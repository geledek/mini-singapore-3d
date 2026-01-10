#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// TEL (Thomson-East Coast Line) station coordinates in order - More accurate positioning
const TEL_STATIONS = [
  // North to South, then East
  [103.7864, 1.4484],   // Woodlands North (TE1)
  [103.7865, 1.4370],   // Woodlands (TE2)
  [103.7943, 1.4278],   // Woodlands South (TE3)
  [103.8177, 1.4170],   // Springleaf (TE4)
  [103.8356, 1.3850],   // Lentor (TE5)
  [103.8360, 1.3720],   // Mayflower (TE6)
  [103.8330, 1.3600],   // Bright Hill (TE7)
  [103.8170, 1.3500],   // Upper Thomson (TE8)
  [103.8390, 1.3380],   // Caldecott (TE9)
  [103.8450, 1.3270],   // Mount Pleasant (TE10)
  [103.8260, 1.3190],   // Stevens (TE11)
  [103.8220, 1.3060],   // Napier (TE12)
  [103.8230, 1.3020],   // Orchard Boulevard (TE13)
  [103.8310, 1.3040],   // Orchard (TE14)
  [103.8320, 1.2960],   // Great World (TE15)
  [103.8300, 1.2880],   // Havelock (TE16)
  [103.8390, 1.2800],   // Outram Park (TE17)
  [103.8460, 1.2820],   // Maxwell (TE18)
  [103.8520, 1.2780],   // Shenton Way (TE19)
  [103.8550, 1.2760],   // Marina Bay (TE20)
  [103.8620, 1.2740],   // Marina South (TE21)
  [103.8680, 1.2790],   // Gardens by the Bay (TE22)
  [103.8730, 1.2980],   // Tanjong Rhu (TE23)
  [103.8880, 1.2970],   // Katong Park (TE24)
  [103.8970, 1.3040],   // Tanjong Katong (TE25)
  [103.9070, 1.3020],   // Marine Parade (TE26)
  [103.9140, 1.3070],   // Marine Terrace (TE27)
  [103.9230, 1.3100],   // Siglap (TE28)
  [103.9420, 1.3120],   // Bayshore (TE29)
  [103.9490, 1.3200],   // Bedok South (TE30)
  [103.9610, 1.3360]    // Sungei Bedok (TE31)
];

// Generate curved path between stations with more realistic railway curves
function generateCurvedPath(coords, segments = 25) {
  const path = [];

  for (let i = 0; i < coords.length - 1; i++) {
    const start = coords[i];
    const end = coords[i + 1];

    // Add the starting point (except for the very first point)
    if (i === 0) {
      path.push(start);
    }

    // Calculate intermediate points with enhanced curve algorithm
    for (let j = 1; j <= segments; j++) {
      const t = j / segments;

      // Linear interpolation between stations
      const lon = start[0] + (end[0] - start[0]) * t;
      const lat = start[1] + (end[1] - start[1]) * t;

      // Add more pronounced curvature for realistic railway path
      // Use a combination of sine waves and distance-based curvature
      const distance = Math.sqrt((end[0] - start[0])**2 + (end[1] - start[1])**2);
      const curveFactor = 0.002 * Math.sin(t * Math.PI) * Math.min(distance * 100, 1);

      // Apply perpendicular offset to create curves
      const dx = end[0] - start[0];
      const dy = end[1] - start[1];
      const length = Math.sqrt(dx*dx + dy*dy);

      // Perpendicular vector for curve offset
      const perpX = -dy / length;
      const perpY = dx / length;

      const curvedLon = lon + curveFactor * perpX;
      const curvedLat = lat + curveFactor * perpY;

      path.push([parseFloat(curvedLon.toFixed(4)), parseFloat(curvedLat.toFixed(4))]);
    }
  }

  return path;
}

// Read current coordinates file
const coordinatesPath = path.join(__dirname, '..', 'data', 'coordinates.json');
let coordinates = JSON.parse(fs.readFileSync(coordinatesPath, 'utf8'));

// Find and replace TEL coordinates
const telIndex = coordinates.railways.findIndex(r => r.id === 'SMRT.TEL');
if (telIndex !== -1) {
  console.log('Found TEL railway at index', telIndex);
  console.log('Original TEL coords length:', coordinates.railways[telIndex].sublines[0].coords.length);

  // Generate new curved path
  const newCoords = generateCurvedPath(TEL_STATIONS);
  coordinates.railways[telIndex].sublines[0].coords = newCoords;

  console.log('New TEL coords length:', newCoords.length);

  // Write back to file
  fs.writeFileSync(coordinatesPath, JSON.stringify(coordinates, null, 2));
  console.log('✅ TEL geometry updated with curved path');
} else {
  console.error('❌ TEL railway not found in coordinates.json');
  process.exit(1);
}