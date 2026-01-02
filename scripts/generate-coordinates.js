#!/usr/bin/env node

/**
 * Generate coordinates.json with route geometries
 * Uses linear interpolation between stations for MVP
 * Can be enhanced later with actual route shapes from OSM
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

// Helper: Round coordinates to 7 decimal places (matching Tokyo format)
function roundCoord(coord) {
    return [
        Math.round(coord[0] * 10000000) / 10000000,
        Math.round(coord[1] * 10000000) / 10000000
    ];
}

// Generate route coordinates for all railways
function generateCoordinates() {
    console.log('Generating route coordinates...\n');

    const allCoordinates = [];

    railways.forEach(railway => {
        console.log(`Processing ${railway.title.en} (${railway.id})...`);

        const railwayStations = railway.stations || [];
        if (railwayStations.length === 0) {
            console.log(`  ⚠️  No stations defined for ${railway.id}, skipping`);
            return;
        }

        let segmentCount = 0;

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

            // Add each point as a coordinate entry
            points.forEach(point => {
                allCoordinates.push(roundCoord(point));
            });

            segmentCount++;
        }

        console.log(`  ✓ Generated ${segmentCount} segments`);
    });

    return allCoordinates;
}

// Save coordinates
function saveCoordinates(coordinates) {
    const outputPath = path.join(__dirname, '../data/coordinates.json');

    // Format as compact JSON (one array per line for readability)
    const json = JSON.stringify(coordinates, null, 0);

    fs.writeFileSync(outputPath, json);

    const sizeKB = (fs.statSync(outputPath).size / 1024).toFixed(1);
    console.log(`\n✓ Saved ${coordinates.length} coordinate points to coordinates.json`);
    console.log(`  File size: ${sizeKB} KB`);
}

// Main execution
const coordinates = generateCoordinates();
saveCoordinates(coordinates);

console.log('\n✅ Coordinate generation complete!');
console.log('\nNote: This uses linear interpolation. For production, consider:');
console.log('  - Extracting actual route shapes from OpenStreetMap');
console.log('  - Using GTFS shapes.txt if available');
console.log('  - Manual digitization for better accuracy\n');
