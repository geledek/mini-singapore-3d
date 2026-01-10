/**
 * SGRailData Integration Script
 *
 * Converts data from https://github.com/cheeaun/sgraildata
 * to Mini Singapore 3D format
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Station code to railway mapping
const CODE_TO_RAILWAY = {
  'NS': 'SMRT.NSL',
  'EW': 'SMRT.EWL',
  'CG': 'SMRT.EWL.CAB',  // Changi Branch
  'NE': 'SBS.NEL',
  'CC': 'SBS.CCL',
  'CE': 'SBS.CCL',  // Circle Extension
  'DT': 'SBS.DTL',
  'TE': 'SMRT.TEL',
  'BP': 'SMRT.BPLRT',
  'SW': 'SBS.SKLRT',  // Sengkang West Loop
  'SE': 'SBS.SKLRT',  // Sengkang East Loop
  'STC': 'SBS.SKLRT', // Sengkang Town Centre
  'PW': 'SBS.PGLRT',  // Punggol West Loop
  'PE': 'SBS.PGLRT',  // Punggol East Loop
  'PTC': 'SBS.PGLRT'  // Punggol Town Centre
};

// Download SGRailData
function downloadSGRailData() {
  return new Promise((resolve, reject) => {
    const url = 'https://raw.githubusercontent.com/cheeaun/sgraildata/main/data/v1/sg-rail.geojson';

    console.log('Downloading SGRailData from GitHub...');
    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          console.log(`✓ Downloaded ${json.features.length} features`);
          resolve(json);
        } catch (err) {
          reject(new Error('Failed to parse JSON: ' + err.message));
        }
      });
    }).on('error', (err) => {
      reject(new Error('Failed to download: ' + err.message));
    });
  });
}

// Convert station name to ID format (e.g., "Admiralty" → "Admiralty")
function nameToId(name) {
  return name
    .replace(/\s+/g, '')  // Remove spaces
    .replace(/[^a-zA-Z0-9]/g, '');  // Remove special chars
}

// Get railway ID from station code (e.g., "NS10" → "SMRT.NSL")
function getRailwayId(code) {
  const prefix = code.replace(/\d+$/,  '');
  return CODE_TO_RAILWAY[prefix] || null;
}

// Extract stations from SGRailData
function extractStations(sgRailData) {
  const stations = [];
  const stationsByRailway = {};

  sgRailData.features.forEach(feature => {
    if (feature.geometry.type !== 'Point' || feature.properties.stop_type !== 'station') {
      return;
    }

    const props = feature.properties;
    const codes = props.station_codes.split('-');

    // Create a station entry for each station code
    codes.forEach(code => {
      const railwayId = getRailwayId(code);
      if (!railwayId) {
        console.warn(`⚠ Unknown railway code: ${code} for station ${props.name}`);
        return;
      }

      const stationId = `${railwayId}.${nameToId(props.name)}`;

      const station = {
        id: stationId,
        railway: railwayId,
        coord: feature.geometry.coordinates,
        title: {
          en: props.name,
          'zh-Hans': props['name_zh-Hans'] || props.name,
          'zh-Hant': props['name_zh-Hans'] || props.name,  // Use same as simplified
          ms: props.name,  // Default to English for now
          ta: props.name_ta || props.name
        },
        code: code
      };

      // Avoid duplicates
      if (!stations.find(s => s.id === stationId)) {
        stations.push(station);

        // Track by railway for later
        if (!stationsByRailway[railwayId]) {
          stationsByRailway[railwayId] = [];
        }
        stationsByRailway[railwayId].push(stationId);
      }
    });
  });

  // Sort stations by code within each railway
  stations.sort((a, b) => {
    if (a.railway !== b.railway) {
      return a.railway.localeCompare(b.railway);
    }
    // Extract number from code for sorting
    const aNum = parseInt(a.code.replace(/[^0-9]/g, '')) || 0;
    const bNum = parseInt(b.code.replace(/[^0-9]/g, '')) || 0;
    return aNum - bNum;
  });

  console.log(`✓ Extracted ${stations.length} stations`);
  return { stations, stationsByRailway };
}

// Extract coordinates (route geometries) from SGRailData
function extractCoordinates(sgRailData) {
  const coordinates = {};

  sgRailData.features.forEach(feature => {
    if (feature.geometry.type !== 'LineString' &&
        feature.geometry.type !== 'MultiLineString') {
      return;
    }

    const props = feature.properties;
    const lineName = props.name;

    // Map line name to railway ID
    let railwayId = null;
    if (/north\s+south/i.test(lineName)) {
      railwayId = 'SMRT.NSL';
    } else if (/east\s+west.*changi/i.test(lineName)) {
      railwayId = 'SMRT.EWL.CAB';
    } else if (/east\s+west/i.test(lineName)) {
      railwayId = 'SMRT.EWL';
    } else if (/north\s+east/i.test(lineName)) {
      railwayId = 'SBS.NEL';
    } else if (/circle/i.test(lineName)) {
      railwayId = 'SBS.CCL';
    } else if (/downtown/i.test(lineName)) {
      railwayId = 'SBS.DTL';
    } else if (/thomson/i.test(lineName)) {
      railwayId = 'SMRT.TEL';
    } else if (/bukit\s+panjang/i.test(lineName)) {
      railwayId = 'SMRT.BPLRT';
    } else if (/sengkang/i.test(lineName)) {
      railwayId = 'SBS.SKLRT';
    } else if (/punggol/i.test(lineName)) {
      railwayId = 'SBS.PGLRT';
    }

    if (!railwayId) {
      console.warn(`⚠ Unknown line: ${lineName}`);
      return;
    }

    // Extract coordinates
    let coords;
    if (feature.geometry.type === 'LineString') {
      coords = feature.geometry.coordinates;
    } else {
      // MultiLineString - flatten to single array
      coords = feature.geometry.coordinates.flat();
    }

    if (!coordinates[railwayId]) {
      coordinates[railwayId] = [];
    }

    // Add as a subline
    coordinates[railwayId].push({
      type: 'main',
      coords: coords
    });
  });

  console.log(`✓ Extracted coordinates for ${Object.keys(coordinates).length} railways`);
  return coordinates;
}

// Main conversion function
async function convertSGRailData() {
  try {
    console.log('=== SGRailData Integration ===\n');

    // Try to load from local clone first, then download
    let sgRailData;
    const localPath = '/tmp/sgraildata-temp/data/v1/sg-rail.geojson';
    if (fs.existsSync(localPath)) {
      console.log('Loading SGRailData from local clone...');
      sgRailData = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      console.log(`✓ Loaded ${sgRailData.features.length} features from local clone`);
    } else {
      // Download data
      sgRailData = await downloadSGRailData();
    }

    // Extract stations
    const { stations, stationsByRailway } = extractStations(sgRailData);

    // Extract coordinates
    const coordinates = extractCoordinates(sgRailData);

    // Save stations.json
    const stationsPath = path.join(__dirname, '../data/stations-sgraildata.json');
    fs.writeFileSync(stationsPath, JSON.stringify(stations, null, '\t'));
    console.log(`✓ Saved stations to ${stationsPath}`);

    // Save coordinates.json
    const coordsPath = path.join(__dirname, '../data/coordinates-sgraildata.json');
    fs.writeFileSync(coordsPath, JSON.stringify(coordinates, null, '\t'));
    console.log(`✓ Saved coordinates to ${coordsPath}`);

    // Save railway station mappings for reference
    const mappingPath = path.join(__dirname, '../data/railway-stations-mapping.json');
    fs.writeFileSync(mappingPath, JSON.stringify(stationsByRailway, null, '\t'));
    console.log(`✓ Saved railway mappings to ${mappingPath}`);

    console.log('\n=== Integration Complete ===');
    console.log('\nNext steps:');
    console.log('1. Review the generated files:');
    console.log('   - data/stations-sgraildata.json');
    console.log('   - data/coordinates-sgraildata.json');
    console.log('2. Merge with existing data or replace as needed');
    console.log('3. Run: npm run build-data');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  convertSGRailData();
}

module.exports = { convertSGRailData };
