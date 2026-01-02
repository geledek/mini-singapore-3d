#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const railways = require('../data/railways.json');
const stations = require('../data/stations.json');

// Build station lookup by railway
const stationsByRailway = {};
stations.forEach(s => {
  if (!stationsByRailway[s.railway]) {
    stationsByRailway[s.railway] = [];
  }
  stationsByRailway[s.railway].push(s);
});

// Update railways with actual station IDs
railways.forEach(r => {
  const railwayStations = stationsByRailway[r.id] || [];
  r.stations = railwayStations.sort((a, b) => {
    const codeA = a.code || '';
    const codeB = b.code || '';
    return codeA.localeCompare(codeB, undefined, { numeric: true });
  }).map(s => s.id);
});

// Save updated railways
fs.writeFileSync(path.join(__dirname, '../data/railways.json'), JSON.stringify(railways, null, '\t'));
console.log('✓ Updated railways.json with correct station IDs');
railways.forEach(r => console.log(`  ${r.id}: ${r.stations.length} stations`));
