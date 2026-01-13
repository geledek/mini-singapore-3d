# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mini Singapore 3D is a real-time 3D visualization of Singapore's MRT and LRT network. Trains move across an interactive 3D map following accurate timetables. Forked from [Mini Tokyo 3D](https://github.com/nagix/mini-tokyo-3d).

**Tech Stack:**
- **Rendering**: Mapbox GL JS (3D map), deck.gl (data layers), Three.js (3D train meshes)
- **Build**: Rollup (bundler), PostCSS (CSS processing)
- **Data**: SGRailData (stations/tracks), LTA DataMall API, Geobuf (compressed GeoJSON)
- **Deployment**: Vercel

**Coverage:** 9 rail lines, 215 stations, 591 exits

## Common Commands

```bash
# Install and build everything
npm install
npm run build-all

# Start local server
npm start              # Serves on http://localhost:8080

# Individual build steps
npm run build          # Build JS/CSS bundles → dist/
npm run build-pages    # Copy static files → build/
npm run build-data     # Generate compressed data → build/data/

# Development
npm run lint           # ESLint
npm run docs:dev       # VuePress dev server for docs

# SGRailData integration
npm run sgraildata:convert  # Convert SGRailData GeoJSON
npm run sgraildata:merge    # Merge with existing data
npm run sgraildata:update   # Convert + merge + rebuild
```

## Environment Setup

```bash
cp .env.example .env
# Edit .env with:
# - MAPBOX_ACCESS_TOKEN (required)
# - LTA_ACCOUNT_KEY (required)
```

## Architecture

### Core Application Flow

1. **Entry** (`src/index.js`): Exports `Map`, `Marker`, `Popup`, `Panel` classes
2. **Map** (`src/map.js`): Main controller (~3800 lines)
   - Initializes Mapbox, controls, layers, data loaders
   - Manages animation loop, clock, tracking modes
3. **Loader** (`src/loader.js`): Loads static data from `build/data/*.json.gz`
4. **Animation** (`src/animation.js`): Frame-by-frame train movement
5. **Rendering**: Three layers
   - Mapbox base map (buildings, roads)
   - deck.gl layers (traffic visualization)
   - Three.js meshes (3D trains)

### Data Pipeline

```
Source Data (data/*.json)
  ↓ node dist/loader (build-time)
Compressed (build/data/*.json.gz)
  ↓ src/loader.js (runtime)
Application State
```

### Directory Structure

```
src/
├── index.js              # Main entry
├── map.js                # Map controller
├── loader.js             # Runtime data loading
├── configs.js            # Configuration constants
├── animation.js          # Animation loop
├── clock.js              # Time management
├── worker.js             # Web Worker for async processing
├── data-classes/         # Domain models
│   ├── railway.js        # Railway lines
│   ├── station.js        # Stations
│   ├── exit.js           # Station exits
│   ├── train.js          # Train instances
│   └── train-timetable.js
├── loader/               # Build-time data processors
│   ├── index.js          # Main build script
│   ├── railways.js
│   ├── stations.js
│   ├── exits.js          # Process exit data
│   ├── station-buildings.js
│   ├── features.js       # Track geometry
│   └── train-timetables.js
├── layers/               # Custom Mapbox layers
│   ├── three-layer.js    # Three.js integration
│   └── traffic-layer.js  # deck.gl visualization
├── controls/             # UI controls
│   ├── search-control.js
│   ├── clock-control.js
│   └── language-control.js  # Language selector
├── panels/               # Side panels
│   └── station-panel.js  # Station info with exits
├── mesh-sets/            # 3D geometry
├── gpgpu/                # GPU-accelerated rendering
└── helpers/              # Utilities

scripts/                  # Data generation & utilities
├── generate-all-timetables.js  # Generate train schedules
├── generate-coordinates.js     # Generate track geometry
├── convert-sgraildata.js       # Import from SGRailData
├── merge-sgraildata.js         # Merge SGRailData
├── import-osm-tracks.js        # Import OSM rail geometry
├── process-html.js             # Env var injection
└── debug-app.js                # Browser debugging

data/                     # Source data
├── railways.json         # 9 railway lines
├── stations.json         # 215 stations
├── exits.json            # 591 station exits
├── coordinates.json      # Track coordinates
├── station-buildings.json
├── train-timetables/     # Per-line timetables
│   ├── smrt-nsl.json
│   ├── smrt-ewl.json
│   └── ...
└── *-sgraildata.json     # SGRailData imports

build/data/               # Generated (gitignored)
├── railways.json.gz
├── stations.json.gz
├── exits.json.gz
├── features.json.gz
└── timetable-*.json.gz
```

## Key Features

### Station Exits
- 591 exits with coordinates from SGRailData
- Displayed on map at zoom 16+
- Listed in station panel with details

### Station Codes
- Colored badges (e.g., NS1, EW14, DT19) on map labels
- Matches official MRT color scheme
- Shows at zoom 14+

### Track Geometry
- Accurate curved rails from OpenStreetMap
- Imported via `scripts/import-osm-tracks.js`
- SGRailData provides refined alignments

### Multi-Language
- English, 中文 (Simplified/Traditional), Bahasa Melayu, தமிழ்
- Dictionaries in `assets/dictionary-{lang}.json`
- Language selector in top-right corner

## Adding/Modifying Data

### Railways
1. Edit `data/railways.json`
2. Run `npm run build-data`

### Stations
1. Edit `data/stations.json` (or import via SGRailData)
2. Update `data/station-groups.json` for interchanges
3. Run `npm run build-data`

### Timetables
1. Edit files in `data/train-timetables/`
2. Or regenerate: `node scripts/generate-all-timetables.js`
3. Run `npm run build-data`

### Exits
1. Edit `data/exits.json`
2. Run `npm run build-data`

## SGRailData Integration

[SGRailData](https://github.com/cheeaun/sgraildata) provides high-quality station coordinates, exits, and rail geometry.

```bash
# Update from SGRailData
npm run sgraildata:update
```

See `docs/SGRAILDATA_INTEGRATION.md` for details.

## Debugging

### Browser Console
```javascript
window.map                    // Map instance
window.map._clock             // Current time
window.map.railways.getAll()  // All railways
window.map.stations.getAll()  // All stations
window.map.activeTrainLookup  // Active trains
```

### Common Issues
| Problem | Solution |
|---------|----------|
| Blank map | Check MAPBOX_ACCESS_TOKEN in .env |
| No trains | Check time of day, rebuild timetables |
| Data load error | Run `npm run build-data` |
| Build fails | Check Node version, run `npm install` |

### Debug Scripts
```bash
node scripts/debug-app.js      # Opens Chrome with DevTools
node scripts/test-browser.js   # Automated testing
```

## Known Limitations

- **No real-time train positions** - LTA doesn't provide GPS data; uses timetable simulation
- **Bus routes not implemented** - Infrastructure exists but visualization not built
- **Some Tokyo artifacts remain** - Flight tracking code still present (unused)

## Build Output

```
dist/
├── mini-singapore-3d.js       # UMD (dev)
├── mini-singapore-3d.min.js   # UMD (prod)
├── mini-singapore-3d.esm.js   # ES module
├── mini-singapore-3d.css
└── mini-singapore-3d-worker.js

build/
├── index.html
├── assets/
└── data/*.json.gz
```

## Security

- **Never commit `.env`** - contains API keys
- Keys injected at build time via Rollup
- HTML placeholders replaced by `scripts/process-html.js`
