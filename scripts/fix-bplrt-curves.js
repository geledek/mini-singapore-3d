/**
 * Fix BPLRT curves by replacing interpolated coordinates with curved data
 * The curved BPLRT coordinates already exist in coordinates.json as a separate property
 */

const fs = require('fs');
const path = require('path');

const coordsPath = path.join(__dirname, '../data/coordinates.json');

console.log('Reading coordinates.json...');
const coordData = JSON.parse(fs.readFileSync(coordsPath, 'utf8'));

// Get the curved BPLRT coordinates from the separate property
const curvedBPLRT = coordData['SMRT.BPLRT'];
if (!curvedBPLRT) {
    console.error('ERROR: SMRT.BPLRT property not found in coordinates.json');
    process.exit(1);
}

console.log(`Found curved BPLRT data with ${curvedBPLRT.length} sublines`);

// Find Base.SMRT.BPLRT in the railways array
const baseIndex = coordData.railways.findIndex(r => r.id === 'Base.SMRT.BPLRT');
if (baseIndex === -1) {
    console.error('ERROR: Base.SMRT.BPLRT not found in railways array');
    process.exit(1);
}

// Find SMRT.BPLRT in the railways array
const bplrtIndex = coordData.railways.findIndex(r => r.id === 'SMRT.BPLRT');
if (bplrtIndex === -1) {
    console.error('ERROR: SMRT.BPLRT not found in railways array');
    process.exit(1);
}

// Get the existing structure to preserve color and other properties
const existingBase = coordData.railways[baseIndex];
const existingBPLRT = coordData.railways[bplrtIndex];

// Extract the main subline coords from the curved data
const mainCurvedCoords = curvedBPLRT[0].coords;
console.log(`Curved coords have ${mainCurvedCoords.length} points`);

// Update Base.SMRT.BPLRT with curved coordinates
// Keep only one main subline with the curved path
coordData.railways[baseIndex] = {
    id: 'Base.SMRT.BPLRT',
    color: existingBase.color,
    sublines: [
        {
            type: 'main',
            coords: mainCurvedCoords
        }
    ]
};

// Update SMRT.BPLRT to reference the new base with offsets
coordData.railways[bplrtIndex] = {
    id: 'SMRT.BPLRT',
    color: existingBPLRT.color,
    loop: true,  // BPLRT is a loop line
    sublines: [
        {
            type: 'main',
            coords: mainCurvedCoords
        },
        {
            type: 'sub',
            start: {
                railway: 'Base.SMRT.BPLRT',
                offset: 0.07
            },
            end: {
                railway: 'Base.SMRT.BPLRT',
                offset: 0.07
            },
            coords: [
                mainCurvedCoords[0],
                mainCurvedCoords[mainCurvedCoords.length - 1]
            ]
        },
        {
            type: 'sub',
            start: {
                railway: 'Base.SMRT.BPLRT',
                offset: -0.07
            },
            end: {
                railway: 'Base.SMRT.BPLRT',
                offset: -0.07
            },
            coords: [
                mainCurvedCoords[0],
                mainCurvedCoords[mainCurvedCoords.length - 1]
            ]
        }
    ]
};

// Remove the separate SMRT.BPLRT property since it's now integrated
delete coordData['SMRT.BPLRT'];

// Save updated coordinates
console.log('Saving updated coordinates.json...');
fs.writeFileSync(coordsPath, JSON.stringify(coordData, null, '\t'));

console.log('Done! BPLRT coordinates updated with curved path.');
console.log('Run "npm run build-data" to rebuild the data files.');
