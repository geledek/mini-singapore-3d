# 🚀 Quick Start Guide - Mini Singapore 3D

## What's Been Done ✅

1. ✅ **Configuration updated** for Singapore
   - Map center: City Hall MRT `[103.8519, 1.2929]`
   - Timezone: SGT (UTC+8)
   - API keys: LTA DataMall + Mapbox configured
   - Languages: English, Chinese, Malay, Tamil

2. ✅ **Conversion scripts created**
   - 5 scripts in `scripts/` directory
   - Ready to generate all data files

3. ✅ **Initial data generated**
   - 3 operators (SMRT, SBS, LTA)
   - 9 MRT/LRT lines
   - 63 stations (partial)

---

## Quick Commands

### Generate Data Files
```bash
# Generate all Singapore data
node scripts/build-data.js

# Or generate individually
node scripts/convert-operators.js
node scripts/convert-railways.js
node scripts/convert-stations.js
```

### Fetch Live Data
```bash
# Fetch from LTA DataMall API
node scripts/fetch-lta-data.js
```

### Build Project
```bash
# Install dependencies (if not done)
npm install

# Build the application
npm run build

# Start dev server (if available)
npm run dev
```

---

## File Structure

```
mini-singapore-3d/
├── src/
│   ├── configs.js          ✅ Updated for Singapore
│   ├── clock.js            ✅ Updated to SGT + holidays
│   └── loader.js           ⏳ TODO: Update railways/operators
├── data/
│   ├── operators.json      ✅ Generated (3 operators)
│   ├── railways.json       ✅ Generated (9 lines)
│   ├── stations.json       ✅ Generated (63 stations)
│   ├── coordinates.json    ⏳ TODO: Singapore routes
│   └── train-timetables/   ⏳ TODO: Singapore schedules
├── scripts/
│   ├── fetch-lta-data.js       ✅ Ready
│   ├── convert-operators.js    ✅ Ready
│   ├── convert-railways.js     ✅ Ready
│   ├── convert-stations.js     ✅ Ready
│   ├── build-data.js          ✅ Ready
│   └── README.md              ✅ Documentation
└── gtfs-data/
    └── Static_ 2025_05/        ✅ Extracted
```

---

## Next Steps (In Order)

### 1. Complete Station Data (Easiest)
```bash
# Edit this file:
nano scripts/convert-stations.js

# Add remaining ~80 stations to STATION_DATA array
# Get data from:
# - Wikipedia: https://en.wikipedia.org/wiki/List_of_Singapore_MRT_stations
# - gtfs-data/train-codes/Train Station Codes and Chinese Names.xls
# - Google Maps for coordinates

# Rebuild:
node scripts/build-data.js
```

### 2. Generate Route Coordinates (Medium)
Create `scripts/convert-coordinates.js` to:
- Extract from OpenStreetMap, OR
- Parse from shapefile data, OR
- Manually digitize connections

### 3. Update Loader (Easy)
```bash
# Edit src/loader.js
# Replace Tokyo-specific arrays with Singapore data
```

### 4. Test (Medium)
```bash
npm run build
# Fix any errors
# Test in browser
```

---

## API Keys Reference

**LTA DataMall:**
```
AccountKey: +Z3IvSNwTlmKVY92BS4/nQ==
Base URL: http://datamall2.mytransport.sg/ltaodataservice/
```

**Mapbox:**
```
Access Token: pk.eyJ1IjoiZ2VsZWRlayIsImEiOiJjbWp2Z2kxeGs1YXowM2RvdDAwZzA5eDdmIn0.cvxqYNPcROKg8kqsH7nNrQ
```

---

## Helpful Resources

### Data Sources
- **LTA DataMall:** https://datamall.lta.gov.sg
- **MRT Map:** https://www.lta.gov.sg/content/ltagov/en/map/train.html
- **Wikipedia MRT List:** https://en.wikipedia.org/wiki/List_of_Singapore_MRT_stations
- **OneMap:** https://www.onemap.gov.sg

### Tools
- **Overpass Turbo:** https://overpass-turbo.eu/ (OSM export)
- **geojson.io:** http://geojson.io/ (GeoJSON editor)

---

## Estimated Time to MVP

**Minimum Viable Product:**
- Complete stations: 1-2 days
- Route coordinates: 2-3 days
- Update loader: 1 day
- Testing: 1 day
- **Total: 5-7 days**

---

## Need Help?

Check these files:
1. `SINGAPORE_CONFIG.md` - Initial setup details
2. `DATA_CONVERSION_COMPLETE.md` - Full conversion guide
3. `scripts/README.md` - Script documentation

Or just ask! 🚀

---

**Status:** Configuration complete, data conversion in progress
**Last Updated:** January 1, 2026
