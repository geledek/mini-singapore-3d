/**
 * Fetch bus data from LTA DataMall API.
 * Downloads Bus Stops, Bus Routes, and Bus Services,
 * filtered to the Orchard Road PoC service set.
 *
 * Usage: node scripts/fetch-bus-data.js
 * Requires LTA_ACCOUNT_KEY in .env
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';

const LTA_BASE = 'https://datamall2.mytransport.sg/ltaodataservice';
const API_KEY = process.env.LTA_ACCOUNT_KEY;

if (!API_KEY) {
    console.error('Error: LTA_ACCOUNT_KEY not set in .env');
    process.exit(1);
}

// Expanded bus services covering major corridors
// Orchard: 7, 14, 36, 77, 106, 111, 124, 143, 167, 174
// Bukit Timah: 67, 75, 170, 171, 173, 961
// East Coast/Tampines: 12, 15, 16, 31, 32, 38
// Cross-island: 51, 61, 65, 80, 145, 196
const POC_SERVICES = [
    '7', '12', '14', '15', '16', '30', '31', '32', '36', '38',
    '51', '61', '65', '67', '75', '77', '80',
    '106', '111', '124', '143', '145', '167', '170', '171', '173', '174',
    '196', '961'
];

async function fetchPaginated(endpoint) {
    const results = [];
    let skip = 0;

    while (true) {
        const url = `${LTA_BASE}/${endpoint}?$skip=${skip}`;
        console.log(`  Fetching ${endpoint} (skip=${skip})...`);

        const res = await fetch(url, {
            headers: {'AccountKey': API_KEY, 'accept': 'application/json'}
        });

        if (!res.ok) {
            throw new Error(`API error ${res.status}: ${await res.text()}`);
        }

        const data = await res.json();
        const items = data.value || [];

        if (items.length === 0) {
            break;
        }

        results.push(...items);
        skip += 500;

        // Rate limit: small delay between requests
        await new Promise(r => setTimeout(r, 200));
    }

    return results;
}

async function main() {
    const dataDir = path.resolve('data');

    console.log('Fetching Bus Stops...');
    const allStops = await fetchPaginated('BusStops');
    console.log(`  Total stops: ${allStops.length}`);

    console.log('Fetching Bus Routes...');
    const allRoutes = await fetchPaginated('BusRoutes');
    console.log(`  Total route records: ${allRoutes.length}`);

    console.log('Fetching Bus Services...');
    const allServices = await fetchPaginated('BusServices');
    console.log(`  Total services: ${allServices.length}`);

    // Filter routes to PoC services only
    const pocRoutes = allRoutes.filter(r => POC_SERVICES.includes(r.ServiceNo));
    console.log(`  PoC route records (filtered): ${pocRoutes.length}`);

    // Filter services to PoC
    const pocServices = allServices.filter(s => POC_SERVICES.includes(s.ServiceNo));
    console.log(`  PoC services (filtered): ${pocServices.length}`);

    // Find all stops used by PoC routes
    const pocStopCodes = new Set(pocRoutes.map(r => r.BusStopCode));
    const pocStops = allStops.filter(s => pocStopCodes.has(s.BusStopCode));
    console.log(`  PoC stops (filtered): ${pocStops.length}`);

    // Save filtered data
    fs.writeFileSync(
        path.join(dataDir, 'bus-stops.json'),
        JSON.stringify(pocStops, null, 2)
    );
    fs.writeFileSync(
        path.join(dataDir, 'bus-routes.json'),
        JSON.stringify(pocRoutes, null, 2)
    );
    fs.writeFileSync(
        path.join(dataDir, 'bus-services.json'),
        JSON.stringify(pocServices, null, 2)
    );

    console.log('\nDone! Files saved:');
    console.log('  data/bus-stops.json');
    console.log('  data/bus-routes.json');
    console.log('  data/bus-services.json');
}

main().catch(err => {
    console.error('Failed:', err.message);
    process.exit(1);
});
