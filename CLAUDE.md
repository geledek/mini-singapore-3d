# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mini Singapore 3D is a real-time 3D digital map of Singapore's public transport system, forked from Mini Tokyo 3D. It visualizes trains, buses, and stations using Mapbox GL JS, deck.gl, and Three.js.

**Tech Stack:**
- **Rendering**: Mapbox GL JS (3D map), deck.gl (data layers), Three.js (3D meshes)
- **Build**: Rollup (bundler), PostCSS (CSS processing)
- **Data**: LTA DataMall API (Singapore transport data), GTFS (bus timetables), Geobuf (compressed GeoJSON)
- **Worker**: Web Worker with Comlink for data processing

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Build the application (development)
npm run build

# Lint code
npm run lint

# Build everything (production)
npm run build-all  # Builds code, pages, data, and docs
```

### Build Process
```bash
# 1. Build JS/CSS bundles
npm run build
# Generates: dist/mini-singapore-3d.js, dist/mini-singapore-3d.min.js,
#            dist/mini-singapore-3d.esm.js, dist/mini-singapore-3d-worker.js,
#            dist/mini-singapore-3d.css, dist/loader.js

# 2. Build static pages
npm run build-pages
# Copies public/ to build/, copies dist files, creates build/assets/

# 3. Build data files (requires dist/loader.js from step 1)
npm run build-data
# Generates: build/data/*.json.gz (railways, stations, timetables, etc.)
# Runs: node dist/loader (compiled from src/loader/index.js)

# 4. Build documentation
npm run docs
```

### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Edit .env with your API keys:
# - MAPBOX_ACCESS_TOKEN (required for maps)
# - LTA_ACCOUNT_KEY (required for Singapore transport data)
```

## Architecture

### Core Application Flow

1. **Entry Point** (`src/index.js`): Exports `Map`, `Marker`, `Popup`, `Panel` classes
2. **Map Class** (`src/map.js`): Main application controller
   - Initializes Mapbox map, controls, layers, data loaders
   - Manages animation loop, clock, tracking modes
   - Coordinates between static data and real-time updates
3. **Data Loading** (`src/loader.js`): Loads static and dynamic data
   - Static: railways, stations, timetables (from `build/data/`)
   - Dynamic: real-time train positions, bus arrivals (from LTA DataMall)
4. **Animation** (`src/animation.js`): Frame-by-frame object movement
5. **Rendering**: Three layers work together:
   - Mapbox base map (buildings, roads)
   - deck.gl layers (traffic, routes)
   - Three.js meshes (trains, buses, aircraft)

### Key Architectural Patterns

**Data Pipeline:**
```
Scripts (scripts/*.js)
  → Generate data files (data/*.json)
  → Loader compresses (node dist/loader)
  → Output (build/data/*.json.gz)
  → Runtime loads (src/loader.js)
```

**Build-Time Data Processing:**
- `src/loader/index.js`: Main script that runs `node dist/loader`
- Individual loaders in `src/loader/*.js`: Process raw JSON into optimized formats
- Each loader reads from `data/*.json`, processes, and writes to `build/data/*.json.gz`
- Uses Geobuf for GeoJSON compression, custom encoding for timetables

**Runtime Data Loading:**
- `src/loader.js`: Client-side data fetcher
- `loadStaticData()`: Loads compressed data files on app init
- `loadDynamicTrainData()`, `loadDynamicBusData()`: Poll APIs for real-time updates
- Web Worker (`src/worker.js`) processes bus data asynchronously

**Environment Variables:**
- Build time: `rollup.config.mjs` replaces `BUILD_*` placeholders with `process.env.*`
- Runtime config: `src/env-config.js` exports values embedded during build
- HTML processing: `scripts/process-html.js` replaces `__*__` placeholders in `public/index.html`

**Coordinate Systems:**
- Origin point: Singapore City Hall MRT (103.8519, 1.2929)
- Uses Mapbox MercatorCoordinate for conversions
- Three.js meshes positioned relative to `map.modelOrigin`

**3D Rendering Pipeline:**
- `ThreeLayer` (`src/layers/three-layer.js`): Custom Mapbox layer integrating Three.js
- Mesh sets (`src/mesh-sets/*.js`): Instanced rendering for trains/buses (one geometry, many instances)
- GPGPU textures (`src/gpgpu/*.js`): Store position/color data in textures for shader-based animation
- Shaders (`src/mesh-sets/shaders.js`): GLSL for efficient rendering

### Directory Structure

```
src/
├── index.js                 # Main entry (UMD build)
├── index.esm.js            # ESM entry
├── map.js                  # Main Map class (3600+ lines)
├── loader.js               # Runtime data loading
├── configs.js              # Configuration constants
├── env-config.js           # Build-time environment variables
├── animation.js            # Animation frame logic
├── clock.js                # Time management (real-time/playback)
├── worker.js               # Web Worker for bus data processing
├── data-classes/           # Domain models (Train, Station, Railway, etc.)
├── loader/                 # Build-time data processors
│   ├── index.js           # Main loader script (generates build/data/)
│   ├── railways.js        # Process railway data
│   ├── stations.js        # Process station data
│   └── train-timetables.js # Process timetable data
├── layers/                 # Custom Mapbox layers
│   ├── three-layer.js     # Three.js integration
│   └── traffic-layer.js   # deck.gl traffic visualization
├── mesh-sets/              # 3D geometry and instanced rendering
├── gpgpu/                  # GPU-accelerated data textures
├── controls/               # UI controls (search, clock, navigation)
├── panels/                 # Side panels (train info, station info)
└── helpers/                # Utility functions

scripts/                    # Data generation scripts
├── generate-timetable.js   # Generate timetables from GTFS
├── generate-coordinates.js # Generate station coordinates
└── process-html.js         # Replace env vars in HTML

data/                       # Source data (JSON)
├── railways.json          # Railway line definitions
├── stations.json          # Station definitions
└── coordinates.json       # Station coordinates

build/data/                 # Generated compressed data
├── railways.json.gz
├── stations.json.gz
└── timetable-*.json.gz
```

## Important Conventions

### Adding New Transport Data

**Railways:**
1. Add to `data/railways.json` with LTA line codes (e.g., 'SMRT.NSL')
2. Update `src/loader.js` RAILWAYS_FOR_TRAINS if real-time data exists
3. Run `npm run build-data` to regenerate

**Stations:**
1. Add to `data/stations.json` with coordinates
2. Ensure station IDs match railway references
3. Update `data/station-groups.json` for interchange stations

**Timetables:**
1. Place GTFS data in appropriate location
2. Run `node scripts/generate-timetable.js` to convert to internal format
3. Output goes to `data/train-timetables/*.json`

### Environment Variable Usage

**During build** (rollup.config.mjs):
- `BUILD_MAPBOX_ACCESS_TOKEN` → replaced in code
- `BUILD_LTA_ACCOUNT_KEY` → replaced in code
- Values come from `.env` file via `dotenv`

**In source code:**
- Import from `src/env-config.js`, NOT directly from `process.env`
- `configs.js` uses getters to access `envConfig` properties

### Real-Time Data Integration

Currently, Singapore's LTA DataMall does NOT provide:
- Real-time train positions (unlike Tokyo's ODPT)
- Train delay information

Available from LTA:
- Bus arrivals (`configs.busArrivalUrl`)
- Train service alerts (`configs.trainAlertUrl`)
- Passenger volume (`configs.passengerVolumeUrl`)

See `src/loader.js` lines 136-156 for TODOs on implementing these.

### Multi-Language Support

Dictionaries: `assets/dictionary-{lang}.json`
- English (en), Chinese Simplified/Traditional (zh-Hans/zh-Hant)
- Malay (ms), Tamil (ta) - partially implemented

Add translations:
1. Create `assets/dictionary-{lang}.json`
2. Add lang code to `configs.langs` array
3. Translate UI strings, station names, railway names

## Migration from Mini Tokyo 3D

This codebase was forked from Mini Tokyo 3D. Key differences:

**Geographic Changes:**
- Center: Tokyo → Singapore City Hall (103.8519, 1.2929)
- Default zoom: 11 → 12 (Singapore is smaller)
- Removed: Tokyo-specific operators (JR East, Tokyo Metro, etc.)
- Added: Singapore operators (SMRT, SBS Transit, LTA)

**Data Source Changes:**
- API: ODPT (Tokyo) → LTA DataMall (Singapore)
- Real-time trains: Available in Tokyo, NOT in Singapore
- Bus data: Both use GTFS, different sources

**Known Issues:**
- Many Tokyo-specific features remain (flight tracking, complex train types)
- Some TODOs in code for Singapore-specific implementations
- Build process still references some Tokyo artifacts

## Testing & Debugging

**Browser console:**
```javascript
// Map instance is exposed globally
window.map

// Access clock
window.map._clock

// Access datasets
window.map._railwayData
window.map._stationData
window.map._trains
```

**Common issues:**
- "Failed to load data": Check `build/data/` exists and contains `.json.gz` files
- Blank map: Check MAPBOX_ACCESS_TOKEN in .env
- No real-time data: LTA_ACCOUNT_KEY may be invalid or real-time feature not implemented

## Build Output

```
dist/
├── mini-singapore-3d.js         # UMD bundle (development)
├── mini-singapore-3d.min.js     # UMD bundle (production)
├── mini-singapore-3d.esm.js     # ES module
├── mini-singapore-3d.css        # Styles (development)
├── mini-singapore-3d.min.css    # Styles (production)
├── mini-singapore-3d-worker.js  # Web Worker
└── loader.js                    # Data build script

build/
├── index.html                   # Processed with env vars
├── mini-singapore-3d.min.*     # Copied from dist/
├── assets/                      # Dictionary files, style.json
└── data/                        # Generated compressed data
    ├── railways.json.gz
    ├── stations.json.gz
    ├── features.json.gz
    ├── timetable-weekday.json.gz
    └── ...
```

## Security Notes

- **NEVER commit `.env` file** - contains API keys
- Exposed keys in CLEANUP_SUMMARY.md should be rotated
- HTML placeholders (`__MAPBOX_ACCESS_TOKEN__`) are replaced by `scripts/process-html.js`
- Build-time replacements in code use rollup `@rollup/plugin-replace`
