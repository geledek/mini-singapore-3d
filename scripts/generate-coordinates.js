#!/usr/bin/env node

/**
 * Generate coordinates.json with route geometries in correct format
 * Format: { "railways": [{id, sublines: [{type, coords}]}] }
 */

const fs = require('fs');
const path = require('path');

// Load station and railway data
const stations = require('../data/stations.json');
const railways = require('../data/railways.json');

// Helper: Find station by ID
function findStation(stationId) {
    return stations.find(s => s.id === stationId);
}

// Helper: Linear interpolation between two points
function interpolate(coord1, coord2, steps = 10) {
    const points = [];
    for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lng = coord1[0] + (coord2[0] - coord1[0]) * t;
        const lat = coord1[1] + (coord2[1] - coord1[1]) * t;
        points.push([lng, lat]);
    }
    return points;
}

// Generate route coordinates for all railways
function generateCoordinates() {
    console.log('Generating route coordinates...\n');

    const railwayCoords = [];

    railways.forEach(railway => {
        console.log(`Processing ${railway.title.en} (${railway.id})...`);

        const railwayStations = railway.stations || [];
        if (railwayStations.length === 0) {
            console.log(`  ⚠️  No stations defined for ${railway.id}, skipping`);
            return;
        }

        // Collect all coordinates for this railway
        const coords = [];

        // For each consecutive pair of stations
        for (let i = 0; i < railwayStations.length - 1; i++) {
            const station1Id = railwayStations[i];
            const station2Id = railwayStations[i + 1];

            const station1 = findStation(station1Id);
            const station2 = findStation(station2Id);

            if (!station1 || !station2) {
                console.log(`  ⚠️  Missing station: ${station1Id} or ${station2Id}`);
                continue;
            }

            // Generate interpolated points between stations
            const points = interpolate(station1.coord, station2.coord, 10);
            coords.push(...points);
        }

        // Add the railway with its coordinates and metadata
        railwayCoords.push({
            id: railway.id,
            color: railway.color,
            altitude: railway.altitude,
            loop: railway.loop,
            sublines: [{
                type: 'main',
                coords: coords
            }]
        });

        console.log(`  ✓ Generated ${coords.length} coordinate points`);
    });

    return {
        railways: railwayCoords,
        airways: []
    };
}

// Save coordinates
function saveCoordinates(data) {
    const outputPath = path.join(__dirname, '../data/coordinates.json');

    fs.writeFileSync(outputPath, JSON.stringify(data, null, '\t'));

    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`\n✓ Saved coordinates.json`);
    console.log(`  File size: ${sizeKB} KB`);
}

// Main execution
const data = generateCoordinates();
saveCoordinates(data);

console.log('\n✅ Coordinate generation complete!\n');
