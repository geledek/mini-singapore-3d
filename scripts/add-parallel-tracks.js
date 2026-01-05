#!/usr/bin/env node
/**
 * Add parallel sublines to a railway entry in data/coordinates.json
 * Usage:
 *   node scripts/add-parallel-tracks.js --railway SMRT.EWL --offset 0.15
 *   node scripts/add-parallel-tracks.js --railway SMRT.EWL.CAB --offset 0.12
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const res = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--railway') res.railway = args[++i];
    else if (a === '--offset') res.offset = parseFloat(args[++i]);
  }
  return res;
}

function addParallel(railwayId, offset) {
  const file = path.join(__dirname, '../data/coordinates.json');
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  const entry = json.railways.find(r => r.id === railwayId);
  if (!entry) {
    throw new Error(`Railway not found: ${railwayId}`);
  }
  if (!entry.sublines || entry.sublines.length === 0) {
    throw new Error(`No main subline found in coordinates for ${railwayId}`);
  }
  const main = entry.sublines[0];
  const coords = main.coords;
  if (!Array.isArray(coords) || coords.length < 2) {
    throw new Error(`Main coords invalid for ${railwayId}`);
  }
  const endpoints = [coords[0], coords[coords.length - 1]];

  // Remove any existing sublines we previously added (idempotent behavior)
  entry.sublines = entry.sublines.filter(s => s.type === 'main');

  // Add two parallel tracks as sublines
  entry.sublines.push({
    type: 'sub',
    start: { railway: railwayId, offset: +offset },
    end: { railway: railwayId, offset: +offset },
    coords: endpoints
  });
  entry.sublines.push({
    type: 'sub',
    start: { railway: railwayId, offset: -offset },
    end: { railway: railwayId, offset: -offset },
    coords: endpoints
  });

  fs.writeFileSync(file, JSON.stringify(json, null, '\t'));
  console.log(`✓ Added parallel tracks to ${railwayId} at ±${offset} (relative offset units)`);
}

function main() {
  const { railway, offset } = parseArgs();
  if (!railway || !Number.isFinite(offset)) {
    console.log('Usage: --railway <ID> --offset <number>');
    process.exit(1);
  }
  addParallel(railway, offset);
}

main();

