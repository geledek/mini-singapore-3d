#!/usr/bin/env node
/**
 * Create Base.* entries and add parallel sublines referencing the base
 * for given railways (ensures featureLookup has base available before line).
 *
 * Usage:
 *   node scripts/setup-parallel-rails.js --railway SMRT.EWL --offset 0.15
 *   node scripts/setup-parallel-rails.js --railway SMRT.EWL.CAB --offset 0.12
 */

const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const res = { items: [] };
  let current = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--railway') {
      if (current.railway) res.items.push(current);
      current = { railway: args[++i] };
    } else if (a === '--offset') {
      current.offset = parseFloat(args[++i]);
    }
  }
  if (current.railway) res.items.push(current);
  return res;
}

function ensureBaseAndParallel(file, railwayId, offset) {
  const json = JSON.parse(fs.readFileSync(file, 'utf8'));
  let idx = json.railways.findIndex(r => r.id === railwayId);
  if (idx < 0) throw new Error(`Railway not found: ${railwayId}`);
  const entry = json.railways[idx];
  const main = entry.sublines && entry.sublines[0];
  if (!main || !Array.isArray(main.coords) || main.coords.length < 2) {
    throw new Error(`Main coords invalid for ${railwayId}`);
  }
  const endpoints = [main.coords[0], main.coords[main.coords.length - 1]];

  const baseId = `Base.${railwayId}`;
  const base = {
    id: baseId,
    color: entry.color,
    altitude: entry.altitude,
    loop: entry.loop,
    sublines: [{ type: 'main', coords: main.coords }]
  };

  // Insert/replace base before the target entry
  const existingBaseIdx = json.railways.findIndex(r => r.id === baseId);
  if (existingBaseIdx >= 0) {
    json.railways.splice(existingBaseIdx, 1);
    // After removal, the target entry index may have shifted; recalc
    idx = json.railways.findIndex(r => r.id === railwayId);
  }
  // Place base just before the entry index (or at start if idx==0)
  json.railways.splice(Math.max(0, idx), 0, base);

  // Reset sublines on the main entry to use base offsets
  entry.sublines = [
    { type: 'main', coords: main.coords },
    { type: 'sub', start: { railway: baseId, offset: +offset }, end: { railway: baseId, offset: +offset }, coords: endpoints },
    { type: 'sub', start: { railway: baseId, offset: -offset }, end: { railway: baseId, offset: -offset }, coords: endpoints }
  ];

  fs.writeFileSync(file, JSON.stringify(json, null, '\t'));
  console.log(`✓ Set up Base and parallel tracks for ${railwayId} (±${offset})`);
}

function main() {
  const { items } = parseArgs();
  if (!items.length) {
    console.log('Usage: --railway <ID> --offset <number> [--railway <ID> --offset <number> ...]');
    process.exit(1);
  }
  const file = path.join(__dirname, '../data/coordinates.json');
  for (const { railway, offset } of items) {
    if (!railway || !Number.isFinite(offset)) {
      throw new Error('Both --railway and --offset are required');
    }
    ensureBaseAndParallel(file, railway, offset);
  }
}

main();
