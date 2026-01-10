# SGRailData Integration

## Overview

This document describes the integration of [SGRailData](https://github.com/cheeaun/sgraildata) into Mini Singapore 3D, completed on 2026-01-10.

SGRailData provides high-quality, community-maintained Singapore rail data with accurate geometries, multilingual station names, and additional metadata.

## What Changed

### Data Improvements

1. **Station Coordinates** (176 stations updated)
   - Replaced with more accurate coordinates from SGRailData
   - Based on official LTA data and OpenStreetMap

2. **Multilingual Station Names**
   - Updated 176 Tamil (தமிழ்) station names
   - Improved Chinese (简体中文) station names
   - Better alignment with official LTA naming

3. **Rail Line Geometries** (All 9 lines updated)
   - Replaced linear interpolation with actual OSM track data
   - Smooth curves using Chaikin smoothing algorithm
   - More accurate representation of real rail paths
   - Lines updated:
     - North South Line (SMRT.NSL)
     - East West Line (SMRT.EWL)
     - East West Line Changi Branch (SMRT.EWL.CAB)
     - North East Line (SBS.NEL)
     - Circle Line (SBS.CCL)
     - Downtown Line (SBS.DTL)
     - Thomson-East Coast Line (SMRT.TEL)
     - Bukit Panjang LRT (SMRT.BPLRT)
     - Sengkang LRT (SBS.SKLRT)
     - Punggol LRT (SBS.PGLRT)

### New Scripts

#### `scripts/convert-sgraildata.js`
Converts SGRailData GeoJSON format to Mini Singapore 3D format.

**Usage:**
```bash
node scripts/convert-sgraildata.js
```

**Output:**
- `data/stations-sgraildata.json` - Converted station data
- `data/coordinates-sgraildata.json` - Converted line geometries
- `data/railway-stations-mapping.json` - Railway to station mappings

**Features:**
- Downloads latest SGRailData from GitHub (or uses local clone)
- Maps SGRailData station codes to internal railway IDs
- Preserves multilingual names (English, Chinese, Tamil, Malay)
- Extracts accurate LineString geometries for all lines

#### `scripts/merge-sgraildata.js`
Merges SGRailData with existing Mini Singapore 3D data.

**Usage:**
```bash
node scripts/merge-sgraildata.js
```

**What it does:**
1. Creates backup files (`.backup.json`)
2. Merges station coordinates and translations
3. Updates line geometries
4. Updates railway station lists

**Safety:**
- Preserves existing custom fields
- Creates backups before modifying
- Only updates improved data

## Data Mapping

### Station Code to Railway ID

| Station Code | Railway ID | Line Name |
|--------------|------------|-----------|
| NS | SMRT.NSL | North South Line |
| EW | SMRT.EWL | East West Line |
| CG | SMRT.EWL.CAB | Changi Branch |
| NE | SBS.NEL | North East Line |
| CC, CE | SBS.CCL | Circle Line |
| DT | SBS.DTL | Downtown Line |
| TE | SMRT.TEL | Thomson-East Coast Line |
| BP | SMRT.BPLRT | Bukit Panjang LRT |
| SW, SE, STC | SBS.SKLRT | Sengkang LRT |
| PW, PE, PTC | SBS.PGLRT | Punggol LRT |

### Data Format Comparison

**SGRailData Format (GeoJSON):**
```json
{
  "type": "Feature",
  "properties": {
    "name": "Admiralty",
    "name_zh-Hans": "海军部",
    "name_ta": "அட்மிரல்ட்டி",
    "station_codes": "NS10",
    "station_colors": "red"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [103.800959, 1.440637]
  }
}
```

**Mini Singapore 3D Format:**
```json
{
  "id": "SMRT.NSL.Admiralty",
  "railway": "SMRT.NSL",
  "coord": [103.800959, 1.440637],
  "title": {
    "en": "Admiralty",
    "zh-Hans": "海军部",
    "zh-Hant": "海军部",
    "ta": "அட்மிரல்ட்டி"
  },
  "code": "NS10"
}
```

## Integration Workflow

```
┌─────────────────────────────────────┐
│  SGRailData Repository              │
│  github.com/cheeaun/sgraildata      │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  scripts/convert-sgraildata.js      │
│  • Download/Load sg-rail.geojson    │
│  • Extract stations & coordinates   │
│  • Convert to internal format       │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Generated Files                    │
│  • stations-sgraildata.json         │
│  • coordinates-sgraildata.json      │
│  • railway-stations-mapping.json    │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  scripts/merge-sgraildata.js        │
│  • Backup existing data             │
│  • Merge stations & coordinates     │
│  • Update railway station lists     │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Updated Data Files                 │
│  • data/stations.json               │
│  • data/coordinates.json            │
│  • data/railways.json               │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  npm run build-data                 │
│  • Generate compressed .json.gz     │
│  • Output to build/data/            │
└─────────────────────────────────────┘
```

## Data Sources

SGRailData aggregates data from multiple authoritative sources:

1. **LTA DataMall** - Official train station data
   - Train Station Codes and Chinese Names
   - Station Exit Points
   - Master Plan 2019 Rail Station layer

2. **OpenStreetMap** - Rail line geometries
   - Thomson-East Coast Line
   - Downtown Line
   - Punggol LRT East Loop

3. **Wikipedia** - Multilingual station names
   - Chinese (Simplified) names
   - Tamil names

4. **CityMapper** - Route patterns and stops

## Benefits

### For Users
- **More accurate train positioning** - Trains follow actual track curves
- **Better multilingual support** - Authentic Tamil and Chinese station names
- **Improved visual quality** - Smooth curves instead of straight lines

### For Developers
- **Authoritative data source** - Community-maintained, regularly updated
- **Easy updates** - Re-run scripts to pull latest changes
- **Better alignment** - Matches official LTA station codes and naming

## Maintaining the Integration

### Updating from SGRailData

To pull the latest SGRailData updates:

```bash
# 1. Convert latest SGRailData
node scripts/convert-sgraildata.js

# 2. Review changes in generated files
git diff data/stations-sgraildata.json
git diff data/coordinates-sgraildata.json

# 3. Merge if changes look good
node scripts/merge-sgraildata.js

# 4. Rebuild application data
npm run build
npm run build-pages
npm run build-data

# 5. Test the application
npm start
# Open http://localhost:8080
```

### Backup Files

The merge script creates backups before modifying:
- `data/stations.backup.json`
- `data/coordinates.backup.json`
- `data/railways.backup.json`

To restore from backup:
```bash
mv data/stations.backup.json data/stations.json
mv data/coordinates.backup.json data/coordinates.json
mv data/railways.backup.json data/railways.json
```

## Statistics

- **Stations Updated:** 176
- **Tamil Names Added/Updated:** 176
- **Railways Updated:** 9
- **Total Stations:** 253
- **SGRailData Features:** 998 (stations, exits, lines, buildings)
- **Integration Date:** 2026-01-10

## Credits

- **SGRailData:** [@cheeaun](https://github.com/cheeaun/sgraildata)
- **LTA DataMall:** Singapore Land Transport Authority
- **OpenStreetMap Contributors**
- **Wikipedia Contributors**

## License

SGRailData and its sources have various licenses. Ensure compliance:
- LTA Data: Subject to Singapore Open Data License
- OpenStreetMap: ODbL (Open Database License)
- Wikipedia: CC BY-SA

## Future Enhancements

Potential improvements for future integration:

1. **Station Exits** - Use SGRailData exit coordinates for better POI placement
2. **Station Buildings** - Integrate building polygon data for 3D visualization
3. **Automatic Updates** - Schedule periodic pulls from SGRailData
4. **Validation** - Add tests to verify data integrity after updates
