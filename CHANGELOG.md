# Changelog

All notable changes to Mini Singapore 3D will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Vercel Analytics integration for usage tracking
- OSM track importer for realistic rail path geometry
- Hybrid track generation combining OSM data with planned route segments for TEL
- Per-line train counts overlay in debug view
- Dashed rail styling and station outlines for planned TEL segments
- AI-powered code reviews using OpenAI Codex for intelligent analysis and feedback
- **SGRailData Integration** - High-quality Singapore rail data from community-maintained source
  - `scripts/convert-sgraildata.js` - Convert SGRailData GeoJSON to internal format
  - `scripts/merge-sgraildata.js` - Merge SGRailData with existing data
  - Documentation: `docs/SGRAILDATA_INTEGRATION.md`

### Changed
- Replaced train type display with operator in UI
- Improved rail alignment using OpenStreetMap geometry data
- **Updated 176 station coordinates** with more accurate positions from SGRailData
- **Enhanced multilingual support** - Updated 176 Tamil station names from SGRailData
- **Replaced all 9 railway line geometries** with accurate OSM-based curves from SGRailData
- Updated Chinese (Simplified) station names for better accuracy

### Fixed
- Corrected railway direction definitions to enable train spawning on all lines
- Regenerated track geometry from station coordinates to ensure complete TEL coverage
- Fixed parallel subline rendering on Changi Airport branch
- Split Changi branch to correct station ownership (SMRT vs SBS)
- Duplicated interchange coordinates to prevent elongated station shapes
- Fixed train misalignment by correcting Three.js camera synchronization
- Fixed env variable substitution in build pipeline
- Regenerated timetables for all 8 remaining MRT/LRT lines
- Fixed LRT timetable loading by adding rail direction definitions
- Fixed train positioning (section feature collision in featureLookup)
- Missing deck.gl dependencies (@deck.gl/mesh-layers, @deck.gl/extensions)

## [0.1.0-alpha.1] - 2026-01-02

### Initial Release - Mini Singapore 3D Fork
Complete migration from Mini Tokyo 3D to Singapore transport system.

### Added
- **Configuration for Singapore**
  - Map center: Singapore City Hall MRT `[103.8519, 1.2929]`
  - Timezone: SGT (UTC+8)
  - Default zoom: 12 (Singapore is smaller than Tokyo)
  - Singapore 2026 public holidays
  - Language support: English, Chinese (Simplified/Traditional), Malay, Tamil

- **Transport Data - 9 Lines, 215 Stations**
  - **Heavy Rail (MRT):**
    - North South Line (NSL) - 26 stations, Red
    - East West Line (EWL) - 35 stations, Green
    - Circle Line (CCL) - 30 stations, Orange
    - North East Line (NEL) - 16 stations, Purple
    - Downtown Line (DTL) - 36 stations, Blue
    - Thomson-East Coast Line (TEL) - 31 stations, Brown
  - **Light Rail (LRT):**
    - Bukit Panjang LRT (BP) - 14 stations
    - Sengkang LRT (SK) - 13 stations
    - Punggol LRT (PG) - 14 stations

- **Data Generation Scripts**
  - `scripts/convert-operators.js` - Generate operator data
  - `scripts/convert-railways.js` - Generate railway line data
  - `scripts/convert-stations-complete.js` - Generate all 215 stations
  - `scripts/generate-coordinates.js` - Generate route geometries
  - `scripts/generate-rail-directions.js` - Generate rail directions
  - `scripts/generate-train-types.js` - Generate train types
  - `scripts/generate-all-timetables.js` - Generate timetables for all lines
  - `scripts/sync-railways.js` - Sync railway station lists
  - `scripts/fetch-lta-data.js` - LTA API fetcher
  - `scripts/build-data.js` - Master build script

- **Build System**
  - Environment variable management (.env, .env.example)
  - Rollup bundler configuration
  - HTML template processor for build-time env var injection
  - Vercel deployment workflow
  - PostCSS processing for styles

### Changed
- **API Integration**
  - Replaced ODPT API (Tokyo) with LTA DataMall API (Singapore)
  - Configured LTA AccountKey for data access
  - Set up Mapbox token for map rendering

- **Project Metadata**
  - Project name: mini-singapore-3d
  - Version: 0.1.0-alpha.1
  - Description: "A real-time 3D digital map of Singapore's public transport system"
  - Removed `japanese-holidays` dependency

- **Codebase**
  - Updated `src/configs.js` with Singapore settings
  - Updated `src/clock.js` to SGT timezone and Singapore holidays
  - Updated `src/loader.js` with Singapore railways/operators
  - Updated `assets/style.json` map center and zoom
  - Renamed all Tokyo references to Singapore

### Security
- Moved API keys to environment variables (.env)
- Added .env to .gitignore
- Created .env.example for developers
- Updated build pipeline to inject env vars at build time
- **Note:** API keys were previously exposed in source code and should be rotated

### Technical Details

**File Sizes (Build Output):**
- dist/mini-singapore-3d.js - 5.9 MB (development)
- dist/mini-singapore-3d.min.js - 3.9 MB (production)
- dist/mini-singapore-3d.esm.js - 6.0 MB (ES module)
- dist/mini-singapore-3d.css - 115 KB
- dist/mini-singapore-3d-worker.js - 387 KB

**Data Files:**
- coordinates.json.gz - 11 KB (2,266 coordinate points)
- operators.json.gz - 487 B (3 operators)
- rail-directions.json.gz - 543 B (12 directions)
- railways.json.gz - 2.2 KB (9 railways)
- stations.json.gz - 7.8 KB (215 stations)
- train-types.json.gz - 178 B (2 types)
- timetable-weekday.json.gz - Placeholder
- timetable-saturday.json.gz - Placeholder
- timetable-holiday.json.gz - Placeholder
- features.json.gz - Placeholder

**Architecture:**
- Mapbox GL JS - 3D map base
- deck.gl - Data layer rendering
- Three.js - 3D meshes (trains, buses)
- Web Worker - Async data processing
- GPGPU - GPU-accelerated rendering
- Geobuf - Compressed GeoJSON format

### Known Limitations
- Timetables are currently placeholder/frequency-based (real GTFS not integrated)
- Real-time train positions not available (LTA DataMall doesn't provide)
- Malay and Tamil translations incomplete (defaults to English)
- Route geometries use linear interpolation (can be refined with OSM data)
- No service alert display implemented
- No bus route visualization (infrastructure ready, not implemented)

### Deployment Options
- Vercel (recommended) - workflow configured
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

---

## [0.0.0] - Fork from Mini Tokyo 3D

Original project: [Mini Tokyo 3D](https://github.com/nagix/mini-tokyo-3d) by Akihiko Kusanagi
