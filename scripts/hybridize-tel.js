#!/usr/bin/env node
/**
 * Hybridize TEL geometry: use OSM polyline for open sections up to Gardens by the Bay,
 * then station-based densified path for planned tail to Sungei Bedok.
 */
const fs = require('fs');
const path = require('path');

function hav(a,b){const R=6371000;const toRad=d=>d*Math.PI/180;const dLat=toRad(b[1]-a[1]);const dLon=toRad(b[0]-a[0]);const lat1=toRad(a[1]), lat2=toRad(b[1]);const s=Math.sin(dLat/2)**2+Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(s));}
function nearestIndex(line, pt){let min=Infinity, idx=0; for(let i=0;i<line.length;i++){const d=hav(line[i], pt); if(d<min){min=d; idx=i;}} return idx; }
function interpolate(a,b,steps=20){const pts=[]; for(let i=0;i<=steps;i++){const t=i/steps; pts.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]);} return pts;}

function main(){
  const stations = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/stations.json'),'utf8'));
  const railways = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/railways.json'),'utf8'));
  const coords = JSON.parse(fs.readFileSync(path.join(__dirname,'../data/coordinates.json'),'utf8'));
  const tel = railways.find(r=>r.id==='SMRT.TEL');
  const telCoords = coords.railways.find(r=>r.id==='SMRT.TEL');
  if(!tel || !telCoords || !telCoords.sublines || !telCoords.sublines.length){
    console.error('TEL data not found'); process.exit(1);
  }
  const lineOSM = telCoords.sublines[0].coords;
  const lastOpenId = 'SMRT.TEL.Bayshore';
  const idxLastOpen = tel.stations.indexOf(lastOpenId);
  if(idxLastOpen < 0){ console.error('Last open TEL station not found'); process.exit(1);} 
  const lastOpenCoord = (stations.find(s=>s.id===lastOpenId) || {}).coord;
  if(!lastOpenCoord){ console.error('Last open TEL station coord not found'); process.exit(1);} 
  const cutIdx = nearestIndex(lineOSM, lastOpenCoord);
  const head = lineOSM.slice(0, cutIdx+1);
  // Tail from lastOpen to end by station interpolation
  const seq = tel.stations.slice(idxLastOpen); // includes lastOpen
  const seqCoords = seq.map(id=>{
    const s = stations.find(x=>x.id===id); if(!s) throw new Error('Missing station '+id); return s.coord;
  });
  const tail=[];
  for(let i=1;i<seqCoords.length;i++){
    const seg = interpolate(seqCoords[i-1], seqCoords[i], 20);
    if(i>1) seg.shift();
    tail.push(...seg);
  }
  const hybrid = head.concat(tail);
  telCoords.sublines = [{ type:'main', coords: hybrid }];
  fs.writeFileSync(path.join(__dirname,'../data/coordinates.json'), JSON.stringify(coords,null,'\t'));
  console.log(`✓ Hybridized TEL: OSM head (${head.length} pts) + planned tail (${tail.length} pts) => ${hybrid.length} pts`);
}

main();
