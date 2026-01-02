#!/usr/bin/env node

/**
 * Fetch static data from LTA DataMall API
 *
 * This script fetches bus stops, bus routes, and train station data
 * from the LTA DataMall API and saves them as JSON files.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const LTA_API_KEY = '+Z3IvSNwTlmKVY92BS4/nQ==';
const LTA_BASE_URL = 'http://datamall2.mytransport.sg/ltaodataservice';

const OUTPUT_DIR = path.join(__dirname, '../gtfs-data/lta-api');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Make request to LTA DataMall API
 */
function ltaRequest(endpoint, skip = 0) {
    return new Promise((resolve, reject) => {
        const url = `${LTA_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}$skip=${skip}`;

        const options = {
            headers: {
                'AccountKey': LTA_API_KEY,
                'Accept': 'application/json'
            }
        };

        const protocol = url.startsWith('https') ? require('https') : require('http');

        protocol.get(url, options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve(json);
                } catch (err) {
                    reject(err);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

/**
 * Fetch all data with pagination
 */
async function fetchAllData(endpoint, outputFile) {
    console.log(`Fetching ${outputFile}...`);
    let allData = [];
    let skip = 0;
    const limit = 500; // LTA returns max 500 records per request

    while (true) {
        try {
            const response = await ltaRequest(endpoint, skip);
            const records = response.value || [];

            if (records.length === 0) {
                break;
            }

            allData = allData.concat(records);
            console.log(`  Fetched ${allData.length} records...`);

            if (records.length < limit) {
                break;
            }

            skip += limit;

            // Rate limiting - wait 1 second between requests
            await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (err) {
            console.error(`Error fetching ${outputFile}:`, err.message);
            break;
        }
    }

    const outputPath = path.join(OUTPUT_DIR, outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
    console.log(`✓ Saved ${allData.length} records to ${outputFile}\n`);

    return allData;
}

/**
 * Main function
 */
async function main() {
    console.log('Fetching data from LTA DataMall API...\n');

    try {
        // Fetch bus stops
        await fetchAllData('/BusStops', 'bus-stops.json');

        // Fetch bus services/routes
        await fetchAllData('/BusServices', 'bus-services.json');

        // Fetch bus routes (detailed route information)
        await fetchAllData('/BusRoutes', 'bus-routes.json');

        console.log('✓ All data fetched successfully!');
        console.log(`\nData saved to: ${OUTPUT_DIR}`);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();
