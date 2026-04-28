/**
 * Generate bus route geometry from cached LTA data.
 * Creates GeoJSON LineStrings for routes and Points for stops.
 *
 * Usage: node scripts/generate-bus-routes.js
 */

import fs from 'fs';
import path from 'path';

const dataDir = path.resolve('data');

const stops = JSON.parse(fs.readFileSync(path.join(dataDir, 'bus-stops.json'), 'utf8'));
const routes = JSON.parse(fs.readFileSync(path.join(dataDir, 'bus-routes.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(dataDir, 'bus-services.json'), 'utf8'));

// Build stop lookup
const stopLookup = new Map();
for (const s of stops) {
    stopLookup.set(s.BusStopCode, {
        code: s.BusStopCode,
        name: s.Description,
        road: s.RoadName,
        lat: parseFloat(s.Latitude),
        lng: parseFloat(s.Longitude)
    });
}

// Group routes by service + direction
const routeMap = new Map();
for (const r of routes) {
    const key = `${r.ServiceNo}-${r.Direction}`;
    if (!routeMap.has(key)) {
        routeMap.set(key, []);
    }
    routeMap.get(key).push(r);
}

// Sort each route by StopSequence
for (const [, stops] of routeMap) {
    stops.sort((a, b) => a.StopSequence - b.StopSequence);
}

// Generate GeoJSON features
const features = [];
const usedStops = new Set();

for (const [key, routeStops] of routeMap) {
    const coords = [];
    const stopCodes = [];

    for (const rs of routeStops) {
        const stop = stopLookup.get(rs.BusStopCode);
        if (stop && stop.lat !== 0 && stop.lng !== 0) {
            coords.push([stop.lng, stop.lat]);
            stopCodes.push(rs.BusStopCode);
            usedStops.add(rs.BusStopCode);
        }
    }

    if (coords.length >= 2) {
        // Route line feature
        features.push({
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: coords
            },
            properties: {
                id: key,
                type: 0,  // Route line type
                service: key.split('-')[0],
                direction: parseInt(key.split('-')[1]),
                color: getServiceColor(key.split('-')[0]),
                width: 4,
                zoom: 14,
                stops: stopCodes
            }
        });
    }
}

// Generate stop point features
for (const code of usedStops) {
    const stop = stopLookup.get(code);
    if (stop) {
        features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [stop.lng, stop.lat]
            },
            properties: {
                id: code,
                type: 1,  // Stop type
                name: stop.name,
                road: stop.road,
                zoom: 15
            }
        });
    }
}

// Build trip data from service frequencies
const trips = [];
for (const svc of services) {
    const key = `${svc.ServiceNo}-${svc.Direction}`;
    const routeStops = routeMap.get(key);
    if (!routeStops || routeStops.length === 0) continue;

    // Get first/last bus from the first stop in the route
    const firstBus = parseTime(routeStops[0].WD_FirstBus);
    const lastBus = parseTime(routeStops[0].WD_LastBus);
    const peakFreq = parseInt(svc.AM_Peak_Freq?.split('-')[1] || '10');
    const offpeakFreq = parseInt(svc.AM_Offpeak_Freq?.split('-')[1] || '15');

    if (firstBus === null || lastBus === null) continue;

    // Handle overnight services (lastBus < firstBus means past midnight)
    const effectiveLast = lastBus < firstBus ? lastBus + 1440 : lastBus;

    // Generate departure times based on frequency
    let time = firstBus;
    let tripIdx = 0;
    while (time <= effectiveLast) {
        const hourMin = time % 1440;
        const freq = (hourMin >= 420 && hourMin <= 540) || (hourMin >= 1020 && hourMin <= 1140)
            ? peakFreq : offpeakFreq;

        trips.push({
            id: `${key}-${tripIdx}`,
            route: key,
            service: svc.ServiceNo,
            direction: svc.Direction,
            departureTime: time % 1440,  // minutes since midnight
            stops: routeStops.map(r => r.BusStopCode),
            distances: routeStops.map(r => parseFloat(r.Distance) || 0)
        });

        time += freq;
        tripIdx++;
    }
}

const output = {
    type: 'FeatureCollection',
    features,
    trips,
    services: services.map(s => ({
        id: `${s.ServiceNo}-${s.Direction}`,
        service: s.ServiceNo,
        direction: s.Direction,
        operator: s.Operator,
        category: s.Category,
        originCode: s.OriginCode,
        destinationCode: s.DestinationCode,
        loopDesc: s.LoopDesc || null
    })),
    stops: [...usedStops].map(code => {
        const s = stopLookup.get(code);
        return {code: s.code, name: s.name, road: s.road, coord: [s.lng, s.lat]};
    })
};

fs.writeFileSync(path.join(dataDir, 'bus-data.json'), JSON.stringify(output));
console.log(`Generated bus data:`);
console.log(`  Route features: ${features.filter(f => f.properties.type === 0).length}`);
console.log(`  Stop features: ${features.filter(f => f.properties.type === 1).length}`);
console.log(`  Trips: ${trips.length}`);
console.log(`  Stops: ${usedStops.size}`);
console.log(`  Output: data/bus-data.json`);

function parseTime(str) {
    if (!str || str.length < 4) return null;
    const h = parseInt(str.substring(0, 2));
    const m = parseInt(str.substring(2, 4));
    return h * 60 + m;
}

function getServiceColor(service) {
    const colors = {
        '7': '#E91E63',
        '14': '#9C27B0',
        '36': '#3F51B5',
        '77': '#009688',
        '106': '#FF5722',
        '111': '#795548',
        '124': '#607D8B',
        '143': '#4CAF50',
        '167': '#FF9800',
        '174': '#2196F3'
    };
    return colors[service] || '#888888';
}
