/**
 * Merge SGRailData with existing Mini Singapore 3D data
 *
 * This script:
 * 1. Backs up existing data files
 * 2. Merges SGRailData stations with existing stations.json
 * 3. Merges SGRailData coordinates with existing coordinates.json
 * 4. Updates railways.json station lists
 */

const fs = require('fs');
const path = require('path');

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, '\t'));
}

function backupFile(filePath) {
  if (fs.existsSync(filePath)) {
    const backupPath = filePath.replace(/\.json$/, '.backup.json');
    fs.copyFileSync(filePath, backupPath);
    console.log(`✓ Backed up ${path.basename(filePath)} → ${path.basename(backupPath)}`);
  }
}

function mergeStations() {
  console.log('\n=== Merging Stations ===');

  const existingStations = loadJSON('data/stations.json');
  const sgRailStations = loadJSON('data/stations-sgraildata.json');

  // Create a map of existing stations by ID
  const existingMap = {};
  existingStations.forEach(station => {
    existingMap[station.id] = station;
  });

  // Merge: prefer SGRailData coordinates and translations, keep existing custom fields
  const mergedStations = [];
  const updatedCount = { coords: 0, translations: 0 };

  sgRailStations.forEach(sgStation => {
    const existing = existingMap[sgStation.id];

    if (existing) {
      // Merge with existing station
      const merged = { ...existing };

      // Update coordinates if different
      if (JSON.stringify(existing.coord) !== JSON.stringify(sgStation.coord)) {
        merged.coord = sgStation.coord;
        updatedCount.coords++;
      }

      // Update translations (SGRailData has better Tamil names)
      if (sgStation.title.ta && sgStation.title.ta !== existing.title.ta) {
        merged.title.ta = sgStation.title.ta;
        updatedCount.translations++;
      }

      // Update Chinese if improved
      if (sgStation.title['zh-Hans'] && sgStation.title['zh-Hans'] !== sgStation.title.en) {
        merged.title['zh-Hans'] = sgStation.title['zh-Hans'];
        merged.title['zh-Hant'] = sgStation.title['zh-Hant'];
      }

      mergedStations.push(merged);
      delete existingMap[sgStation.id];
    } else {
      // New station from SGRailData
      mergedStations.push(sgStation);
    }
  });

  // Add remaining existing stations that aren't in SGRailData
  Object.values(existingMap).forEach(station => {
    mergedStations.push(station);
  });

  // Sort by railway and code
  mergedStations.sort((a, b) => {
    if (a.railway !== b.railway) {
      return a.railway.localeCompare(b.railway);
    }
    const aNum = parseInt(a.code?.replace(/[^0-9]/g, '') || '0');
    const bNum = parseInt(b.code?.replace(/[^0-9]/g, '') || '0');
    return aNum - bNum;
  });

  backupFile('data/stations.json');
  saveJSON('data/stations.json', mergedStations);

  console.log(`✓ Merged ${mergedStations.length} stations`);
  console.log(`  - Updated ${updatedCount.coords} coordinates`);
  console.log(`  - Updated ${updatedCount.translations} Tamil translations`);
  console.log(`  - Added ${sgRailStations.length - (mergedStations.length - Object.keys(existingMap).length)} new stations`);
}

function mergeCoordinates() {
  console.log('\n=== Merging Coordinates ===');

  const existingCoords = loadJSON('data/coordinates.json');
  const sgRailCoords = loadJSON('data/coordinates-sgraildata.json');

  const mergedCoords = { ...existingCoords };
  let updatedCount = 0;

  // Merge SGRailData coordinates (they have better OSM-based geometries)
  Object.keys(sgRailCoords).forEach(railwayId => {
    const sgSublines = sgRailCoords[railwayId];

    if (!mergedCoords[railwayId]) {
      // New railway
      mergedCoords[railwayId] = sgSublines;
      updatedCount++;
    } else {
      // Update existing railway with better geometries
      // Keep the structure but update coordinates
      mergedCoords[railwayId] = sgSublines;
      updatedCount++;
    }
  });

  backupFile('data/coordinates.json');
  saveJSON('data/coordinates.json', mergedCoords);

  console.log(`✓ Updated coordinates for ${updatedCount} railways`);
}

function updateRailwayStationLists() {
  console.log('\n=== Updating Railway Station Lists ===');

  const railways = loadJSON('data/railways.json');
  const stationMapping = loadJSON('data/railway-stations-mapping.json');

  let updatedCount = 0;

  railways.forEach(railway => {
    const stationList = stationMapping[railway.id];

    if (stationList && stationList.length > 0) {
      // Update station list if it's different
      if (JSON.stringify(railway.stations) !== JSON.stringify(stationList)) {
        railway.stations = stationList;
        updatedCount++;
      }
    }
  });

  if (updatedCount > 0) {
    backupFile('data/railways.json');
    saveJSON('data/railways.json', railways);
    console.log(`✓ Updated station lists for ${updatedCount} railways`);
  } else {
    console.log(`✓ All railway station lists are up to date`);
  }
}

// Main merge function
function mergeSGRailData() {
  try {
    console.log('=== SGRailData Merge Process ===');
    console.log('This will update your data files with SGRailData.\n');

    // Check if SGRailData files exist
    if (!fs.existsSync('data/stations-sgraildata.json')) {
      console.error('❌ Error: Run "node scripts/convert-sgraildata.js" first');
      process.exit(1);
    }

    mergeStations();
    mergeCoordinates();
    updateRailwayStationLists();

    console.log('\n=== Merge Complete ===');
    console.log('\nBackup files created:');
    console.log('  - data/stations.backup.json');
    console.log('  - data/coordinates.backup.json');
    console.log('  - data/railways.backup.json (if updated)');
    console.log('\nNext steps:');
    console.log('  1. Review changes in data/stations.json and data/coordinates.json');
    console.log('  2. Run: npm run build-data');
    console.log('  3. Test the application');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  mergeSGRailData();
}

module.exports = { mergeSGRailData };
