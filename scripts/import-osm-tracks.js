#!/usr/bin/env node
/**
 * Import OSM track geometry for MRT/LRT lines via Overpass API and update data/coordinates.json
 *
 * Usage:
 *   node scripts/import-osm-tracks.js --search "East West Line"
 *   node scripts/import-osm-tracks.js --railway SMRT.EWL --name "East West Line"
 *   node scripts/import-osm-tracks.js --railway SMRT.EWL.CAB --name "East West Line (Changi Airport Branch)"
 *
 * Notes:
 * - Fetches route=subway|light_rail relations in a Singapore bbox and attempts to stitch way geometries.
 * - If a relation has ordered members, we will follow member order; otherwise, we greedily chain by nearest endpoints.
 */

const fs = require('fs');
const path = require('path');

const BBOX = { south: 1.15, west: 103.6, north: 1.50, east: 104.1 }; // Singapore bbox
const OVERPASS_URLS = [
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass-api.de/api/interpreter'
];

function parseArgs() {
  const args = process.argv.slice(2);
  const res = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
      if (a === '--search') res.search = args[++i];
      else if (a === '--railway') res.railway = args[++i];
      else if (a === '--name') res.name = args[++i];
      else if (a === '--relids') res.relids = args[++i];
  }
  return res;
}

async function overpass(query) {
  const body = new URLSearchParams({ data: query }).toString();
  let lastErr;
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Overpass error ${res.status}: ${txt}`);
      }
      return res.json();
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr;
}

function buildSearchQuery(pattern) {
  const { south, west, north, east } = BBOX;
  return `
  [out:json][timeout:60];
  (
    relation["type"="route"]["route"~"subway|light_rail"][~"^(name|name:en|ref)$"~"${pattern}"](${south},${west},${north},${east});
  );
  out tags;
  `;
}

function buildRelationQuery(pattern) {
  const { south, west, north, east } = BBOX;
  return `
  [out:json][timeout:120];
  (
    relation["type"="route"]["route"~"subway|light_rail"][~"^(name|name:en|ref)$"~"${pattern}"](${south},${west},${north},${east});
  )->.routes;
  .routes out ids tags;
  (way(r.routes););
  out body geom;
  `;
}

function haversine(a, b) {
  const R = 6371000;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLon = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]), lat2 = toRad(b[1]);
  const s = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function stitchWays(elements) {
  const ways = elements.filter(e => e.type === 'way' && Array.isArray(e.geometry));
  if (ways.length === 0) return [];
  // Prefer ordered ways if provided by relation (members list)
  // Fallback: greedy chain by nearest endpoints
  const paths = ways.map(w => w.geometry.map(p => [p.lon, p.lat]));
  // Greedy stitching: start with the longest; then attach nearest matching endpoint
  let path = paths.sort((a, b) => b.length - a.length)[0].slice();
  const used = new Set();
  used.add(paths.indexOf(path));

  function tryAttach() {
    let best = null;
    for (let i = 0; i < paths.length; i++) {
      if (used.has(i)) continue;
      const cand = paths[i];
      const head = path[0], tail = path[path.length - 1];
      const ch = cand[0], ct = cand[cand.length - 1];
      const dTailHead = haversine(tail, ch);
      const dTailTail = haversine(tail, ct);
      const dHeadHead = haversine(head, ch);
      const dHeadTail = haversine(head, ct);
      const min = Math.min(dTailHead, dTailTail, dHeadHead, dHeadTail);
      if (!best || min < best.dist) {
        best = { i, cand, dTailHead, dTailTail, dHeadHead, dHeadTail, dist: min };
      }
    }
    if (!best || best.dist > 100) { // stop if gap > 100m
      return false;
    }
    const { i, cand, dTailHead, dTailTail, dHeadHead, dHeadTail } = best;
    if (dTailHead <= dTailTail && dTailHead <= dHeadHead && dTailHead <= dHeadTail) {
      // append cand as-is to tail
      path = path.concat(cand);
    } else if (dTailTail <= dTailHead && dTailTail <= dHeadHead && dTailTail <= dHeadTail) {
      // append reversed to tail
      path = path.concat(cand.slice().reverse());
    } else if (dHeadHead <= dHeadTail && dHeadHead <= dTailHead && dHeadHead <= dTailTail) {
      // prepend cand reversed to head
      path = cand.slice().reverse().concat(path);
    } else {
      // prepend cand to head
      path = cand.concat(path);
    }
    used.add(i);
    return true;
  }

  // Attach until no improvement
  // Limit iterations to avoid infinite loops
  for (let k = 0; k < ways.length; k++) {
    if (!tryAttach()) break;
  }
  // Dedupe consecutive duplicates
  const dedup = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const prev = dedup[dedup.length - 1];
    if (haversine(prev, path[i]) > 0.5) dedup.push(path[i]);
  }
  return dedup;
}

async function fetchTrackByName(pattern) {
  const data = await overpass(buildRelationQuery(pattern));
  const ways = (data.elements || []).filter(e => e.type === 'way');
  if (process.env.DEBUG_OSM === '1') {
    console.error(`DEBUG: fetched ${data.elements?.length || 0} elements, ways=${ways.length}`);
  }
  const coords = stitchWays(data.elements);
  return coords;
}

async function fetchTrackByIds(ids) {
  const { south, west, north, east } = BBOX;
  const idList = ids.join(',');
  const query = `
  [out:json][timeout:120];
  rel(${idList});
  way(r);
  out body geom;
  `;
  const data = await overpass(query);
  const coords = stitchWays(data.elements);
  return coords;
}

function updateCoordinatesJson(railwayId, coords) {
  const f = path.join(__dirname, '../data/coordinates.json');
  const json = JSON.parse(fs.readFileSync(f, 'utf8'));
  const target = json.railways.find(r => r.id === railwayId);
  if (!target) throw new Error(`Railway not found in coordinates.json: ${railwayId}`);
  target.sublines = [{ type: 'main', coords }];
  fs.writeFileSync(f, JSON.stringify(json, null, '\t'));
  console.log(`✓ Updated coordinates for ${railwayId} with ${coords.length} points`);
}

async function main() {
  const args = parseArgs();
  if (args.search) {
    const data = await overpass(buildSearchQuery(args.search));
    console.log(JSON.stringify(data.elements.map(e => ({ id: e.id, tags: e.tags })), null, 2));
    return;
  }
  if (args.railway && args.name) {
    console.log(`Fetching OSM track for ${args.railway} via relation name: ${args.name}`);
    const coords = await fetchTrackByName(args.name);
    if (!coords || coords.length < 2) {
      throw new Error('No geometry returned for relation');
    }
    updateCoordinatesJson(args.railway, coords);
    return;
  }
  if (args.railway && args.relids) {
    const ids = args.relids.split(',').map(s => s.trim()).filter(Boolean);
    console.log(`Fetching OSM track for ${args.railway} via relation ids: ${ids.join(', ')}`);
    const coords = await fetchTrackByIds(ids);
    if (!coords || coords.length < 2) {
      throw new Error('No geometry returned for relation ids');
    }
    updateCoordinatesJson(args.railway, coords);
    return;
  }
  console.log('Usage:\n  --search "Name"\n  --railway <RailwayID> --name "Relation Name"');
}

main().catch(err => {
  console.error(err.stack || err.message || String(err));
  process.exit(1);
});
