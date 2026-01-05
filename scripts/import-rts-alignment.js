#!/usr/bin/env node
/**
 * Import LTA RTS Alignment (GeoJSON) and update data/coordinates.json
 * Supports MRT + LRT lines. Intended workflow:
 *  1) Convert Shapefile (SVY21) to WGS84 GeoJSON:
 *     ogr2ogr -f GeoJSON -t_srs EPSG:4326 gtfs-data/GEOSPATIAL/RTS_Alignment.json "RTS_Alignment.shp"
 *  2) Run this script to map alignments to our line IDs:
 *     node scripts/import-rts-alignment.js --geojson gtfs-data/GEOSPATIAL/RTS_Alignment.json
 */

const fs = require('fs');
const path = require('path');

function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }

function toCoords(geom) {
  if (!geom) return [];
  const {type, coordinates} = geom;
  if (type === 'LineString') return coordinates;
  if (type === 'MultiLineString') return [].concat(...coordinates);
  return [];
}

function normalize(s){ return (s||'').toString().trim().toLowerCase(); }

// Map various field names and values to our internal railway IDs
const NAME_FIELDS = ['LINE', 'LINE_NAME', 'NAME', 'ROUTE', 'ROUTE_NAME', 'LINENAME', 'Desc', 'desc', 'Name'];
const VALUE_MAP = [
  { match: [/^north\s*south/i, /^nsl$/i], id: 'SMRT.NSL' },
  { match: [/^east\s*west/i, /^ewl$/i], id: 'SMRT.EWL' },
  { match: [/^circle/i, /^ccl$/i], id: 'SMRT.CCL' },
  { match: [/^north\s*east/i, /^nel$/i], id: 'SBS.NEL' },
  { match: [/^downtown/i, /^dtl$/i], id: 'SBS.DTL' },
  { match: [/^thomson.?east\s*coast/i, /^tel$/i], id: 'SMRT.TEL' },
  { match: [/sengkang.*lrt/i, /^sklrt$/i], id: 'SBS.SKLRT' },
  { match: [/punggol.*lrt/i, /^pglrt$/i], id: 'SBS.PGLRT' },
  { match: [/bukit\s*panjang.*lrt/i, /^bplrt$/i], id: 'SMRT.BPLRT' }
];

function detectId(props){
  for (const f of NAME_FIELDS) {
    if (props && props[f] !== undefined && props[f] !== null) {
      const v = props[f].toString();
      for (const {match, id} of VALUE_MAP) {
        if (match.some(rx => rx.test(v))) return id;
      }
    }
  }
  // Fallback: scan all string props
  for (const k of Object.keys(props||{})) {
    const v = props[k];
    if (typeof v !== 'string') continue;
    for (const {match, id} of VALUE_MAP) {
      if (match.some(rx => rx.test(v))) return id;
    }
  }
  return null;
}

function parseArgs(){
  const args = process.argv.slice(2); const out={};
  for (let i=0;i<args.length;i++){ const a=args[i];
    if (a==='--geojson') out.geojson=args[++i];
  }
  return out;
}

function main(){
  const {geojson} = parseArgs();
  if (!geojson) {
    console.error('Usage: --geojson <RTS_Alignment.json>'); process.exit(1);
  }
  const gj = readJson(geojson);
  const byId = new Map();
  for (const f of gj.features || []) {
    const id = detectId(f.properties||{});
    if (!id) continue;
    const seg = toCoords(f.geometry);
    if (!seg.length) continue;
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(seg);
  }
  if (!byId.size) {
    console.error('No alignments matched known lines. Check field mappings or input.');
    process.exit(1);
  }
  // Merge segments: simple greedy stitching by nearest endpoints
  function hav(a,b){const R=6371000;const toRad=d=>d*Math.PI/180;const dLat=toRad(b[1]-a[1]);const dLon=toRad(b[0]-a[0]);const lat1=toRad(a[1]), lat2=toRad(b[1]);const s=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(s));}
  function stitch(paths){
    // paths: array of LineString coords arrays
    let idx = 0; let base = paths[idx].slice(); const used = new Set([idx]);
    function tryAttach(){
      let best=null;
      const head=base[0], tail=base[base.length-1];
      for (let i=0;i<paths.length;i++){
        if (used.has(i)) continue; const pts=paths[i];
        const ch=pts[0], ct=pts[pts.length-1];
        const options=[
          {pos:'tail', order:+1, arr:pts, dist: hav(tail,ch)},
          {pos:'tail', order:-1, arr:pts.slice().reverse(), dist: hav(tail,ct)},
          {pos:'head', order:+1, arr:pts, dist: hav(head,ct)},
          {pos:'head', order:-1, arr:pts.slice().reverse(), dist: hav(head,ch)}
        ];
        for (const o of options){ if (!best || o.dist<best.dist){ best={i, ...o}; } }
      }
      if (!best || best.dist>200) return false; // 200m gap tolerance
      if (best.pos==='tail') base=base.concat(best.arr); else base=best.arr.concat(base);
      used.add(best.i); return true;
    }
    for (let k=0;k<paths.length;k++) if (!tryAttach()) break;
    // Dedup consecutive
    const out=[base[0]]; for(let i=1;i<base.length;i++){ if (hav(out[out.length-1], base[i])>0.5) out.push(base[i]); }
    return out;
  }

  const coordsPath = path.join(__dirname,'../data/coordinates.json');
  const coordsJson = readJson(coordsPath);
  for (const [id, arr] of byId) {
    const merged = stitch(arr);
    const target = coordsJson.railways.find(r=>r.id===id);
    if (!target) continue;
    target.sublines = [{type:'main', coords: merged}];
    console.log(`✓ Imported alignment for ${id}: ${merged.length} points`);
  }
  fs.writeFileSync(coordsPath, JSON.stringify(coordsJson,null,'\t'));
}

main();

