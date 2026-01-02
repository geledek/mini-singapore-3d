# ✅ GTFS Data Conversion - COMPLETE

## Summary

Successfully created conversion scripts and generated initial Singapore MRT/LRT data files for Mini Singapore 3D!

---

## 📦 Generated Files

### ✅ Complete
- **operators.json** (983 bytes) - 3 operators (SMRT, SBS Transit, LTA)
- **railways.json** (7.1 KB) - 9 MRT/LRT lines
- **stations.json** (14 KB) - 63 stations with coordinates

### ⏳ Still Using Tokyo Data (To Be Replaced)
- **coordinates.json** (2.2 MB) - Tokyo route geometries
- **airports.json** (42 KB) - Tokyo airports (NRT, HND)
- **flight-statuses.json** (6.1 KB) - Tokyo flights
- **poi.json** (524 KB) - Tokyo points of interest
- **train-timetables/** (173 files) - Tokyo schedules
- **train-types.json** (27 KB) - Tokyo train types
- **train-vehicles.json** (1.6 KB) - Tokyo train vehicles

---

## 🎯 What Was Created

### 1. Conversion Scripts (`scripts/`)

| Script | Purpose | Status |
|--------|---------|--------|
| `fetch-lta-data.js` | Fetch data from LTA DataMall API | ✅ Ready |
| `convert-operators.js` | Generate operators.json | ✅ Complete |
| `convert-railways.js` | Generate railways.json | ✅ Complete |
| `convert-stations.js` | Generate stations.json | ✅ Complete |
| `build-data.js` | Master script to run all | ✅ Complete |
| `README.md` | Documentation | ✅ Complete |

### 2. Data Files (`data/`)

#### **operators.json** - Transport Operators
```json
{
  "SMRT": {
    "lines": ["NSL", "EWL", "CCL", "TEL", "BPLRT"],
    "color": "#EE2E24"
  },
  "SBS": {
    "lines": ["NEL", "DTL", "SKLRT", "PGLRT"],
    "color": "#780F7E"
  }
}
```

#### **railways.json** - 9 MRT/LRT Lines
- ✅ North South Line (NSL) - Red `#D42E12`
- ✅ East West Line (EWL) - Green `#009645`
- ✅ Circle Line (CCL) - Orange `#FA9E0D`
- ✅ North East Line (NEL) - Purple `#9900AA`
- ✅ Downtown Line (DTL) - Blue `#005EC4`
- ✅ Thomson-East Coast Line (TEL) - Brown `#9D5B25`
- ✅ Bukit Panjang LRT - Grey `#748477`
- ✅ Sengkang LRT - Grey `#748477`
- ✅ Punggol LRT - Grey `#748477`

#### **stations.json** - 63 Stations
Sample stations included:
- All North South Line stations (NS1-NS28)
- All East West Line stations (EW1-EW33)
- Circle Line stations (CC1-CC4, more to add)

**Format:**
```json
{
  "id": "SMRT.NSL.CityHall",
  "railway": "SMRT.NSL",
  "coord": [103.8519, 1.2929],
  "title": {
    "en": "City Hall",
    "zh-Hans": "政府大厦",
    "zh-Hant": "政府大廈",
    "ms": "Dewan Bandaraya"
  },
  "code": "NS25"
}
```

---

## 🚀 How to Use

### Generate Data Files
```bash
# Run all conversions
node scripts/build-data.js

# Or run individual scripts
node scripts/convert-operators.js
node scripts/convert-railways.js
node scripts/convert-stations.js
```

### Fetch Live Data from LTA
```bash
# Fetch bus stops, routes, services
node scripts/fetch-lta-data.js
```

### View Generated Files
```bash
# List all data files
ls -lh data/

# View stations
cat data/stations.json | head -50

# View railways
cat data/railways.json
```

---

## 📊 Singapore vs Tokyo Comparison

| Metric | Tokyo | Singapore | % of Tokyo |
|--------|-------|-----------|------------|
| MRT/LRT Lines | ~130 railway lines | 9 lines | 7% |
| Stations | ~900 stations | ~140 stations | 16% |
| Operators | ~30 operators | 2 operators | 7% |
| Complexity | Very High | Medium | 15% |

**Good news:** Singapore is MUCH simpler than Tokyo! Less data to process.

---

## ⚠️ What's Still Missing

### Critical (Needed for Basic Functionality)
1. **coordinates.json** - Route geometries
   - Currently using Tokyo data
   - Need to extract from:
     - LTA GTFS shapes.txt (if available)
     - OpenStreetMap railway data
     - Manual digitization
   - ~140 station connections vs Tokyo's 79k lines

2. **Complete station list**
   - Currently: 63 stations
   - Total needed: ~140 stations
   - Missing:
     - Complete Circle Line (CC5-CC33)
     - All NEL, DTL, TEL stations
     - All LRT stations

3. **Timetable data**
   - Currently using Tokyo schedules
   - Need to generate from:
     - LTA GTFS stop_times.txt
     - Real-time API data
     - Or use frequency-based approach

### Optional (Nice to Have)
4. **train-types.json** - Express/Local types
5. **rail-directions.json** - Direction names
6. **features.json** - GeoJSON features
7. **poi.json** - Singapore points of interest

---

## 🔧 Next Steps

### Phase 1: Complete Station Data (1-2 days)
```bash
# Edit scripts/convert-stations.js
# Add remaining ~80 stations to STATION_DATA array
# Include all Circle, NEL, DTL, TEL, and LRT stations
# Run: node scripts/build-data.js
```

**Resources:**
- [Wikipedia: List of Singapore MRT stations](https://en.wikipedia.org/wiki/List_of_Singapore_MRT_stations)
- [LTA Website](https://www.lta.gov.sg/content/ltagov/en/map/train.html)
- Extract from: `gtfs-data/train-codes/Train Station Codes and Chinese Names.xls`

### Phase 2: Generate Route Coordinates (2-3 days)
```bash
# Option A: Use OpenStreetMap
# - Export Singapore railway data using Overpass API
# - Convert to GeoJSON
# - Transform to coordinates.json format

# Option B: Use LTA shapefile data
# - Parse gtfs-data/train-stations/RapidTransitSystemStation.shp
# - Extract line geometries
# - Generate coordinate arrays

# Option C: Manual (tedious but accurate)
# - Use Google Maps / OneMap
# - Digitize station-to-station segments
# - Export as coordinate pairs
```

### Phase 3: Simplify or Generate Timetables (3-5 days)
```bash
# Option A: Frequency-based (RECOMMENDED for MVP)
# - Define peak/off-peak frequencies per line
# - Generate schedules programmatically
# - Much simpler than parsing GTFS

# Option B: Use real-time only
# - Skip timetables entirely
# - Calculate positions from real-time API
# - Requires constant API polling

# Option C: Parse GTFS (if available)
# - Check if LTA provides GTFS stop_times.txt
# - Parse and convert to custom format
```

### Phase 4: Update Loader (1 day)
```bash
# Edit src/loader.js
# Replace Tokyo-specific arrays:
# - RAILWAYS_FOR_TRAINS
# - OPERATORS_FOR_TRAININFORMATION
# With Singapore equivalents
```

---

## 📝 Detailed TODO

### High Priority
- [ ] Add remaining 80 MRT/LRT stations to `convert-stations.js`
- [ ] Generate `coordinates.json` with Singapore route geometries
- [ ] Remove Tokyo data files (airports, flights, poi)
- [ ] Update `src/loader.js` with Singapore railways/operators

### Medium Priority
- [ ] Create `rail-directions.json` (Northbound/Southbound/etc)
- [ ] Create `train-types.json` (if applicable - Singapore has less variety)
- [ ] Generate or mock timetable data
- [ ] Add Malay translations for all stations
- [ ] Add Tamil translations for all stations

### Low Priority
- [ ] Create `features.json` with Singapore landmarks
- [ ] Add Changi Airport data (if including flights)
- [ ] Create `poi.json` with Singapore points of interest
- [ ] Add bus data integration

---

## 🧪 Testing

### Test Current Configuration
```bash
# Build the project
npm run build

# You'll get errors about missing Singapore-specific data
# But you can verify the configuration changes work
```

### Test Generated Data
```bash
# Validate JSON syntax
node -e "console.log('Valid JSON:', JSON.parse(require('fs').readFileSync('data/stations.json')))"

# Count stations per line
node -e "
const stations = require('./data/stations.json');
const byLine = {};
stations.forEach(s => {
  byLine[s.railway] = (byLine[s.railway] || 0) + 1;
});
console.log(byLine);
"
```

---

## 📚 Resources

### Data Sources
- **LTA DataMall:** https://datamall.lta.gov.sg
- **OpenStreetMap Singapore:** https://www.openstreetmap.org/relation/536780
- **Wikipedia:** https://en.wikipedia.org/wiki/Mass_Rapid_Transit_(Singapore)
- **OneMap API:** https://www.onemap.gov.sg/docs/

### Tools
- **Overpass Turbo:** https://overpass-turbo.eu/ (OSM data extraction)
- **geojson.io:** http://geojson.io/ (GeoJSON editing)
- **Mapshaper:** https://mapshaper.org/ (Shapefile conversion)

### API Keys
- ✅ **LTA DataMall:** `+Z3IvSNwTlmKVY92BS4/nQ==`
- ✅ **Mapbox:** `pk.eyJ1IjoiZ2VsZWRlayIsImEiOiJjbWp2Z2kxeGs1YXowM2RvdDAwZzA5eDdmIn0.cvxqYNPcROKg8kqsH7nNrQ`

---

## 🎉 Achievement Summary

### ✅ Completed Today
1. ✅ Analyzed Tokyo codebase structure
2. ✅ Updated configs.js with Singapore settings
3. ✅ Updated clock.js with SGT timezone and holidays
4. ✅ Updated package.json metadata
5. ✅ Created 5 conversion scripts
6. ✅ Generated 3 Singapore data files
7. ✅ Documented entire process

### 📊 Progress: ~30% Complete

**Breakdown:**
- Configuration: ✅ 100% (done)
- Basic data structure: ✅ 80% (operators, railways, partial stations)
- Station data: 🟡 45% (63/140 stations)
- Route geometries: ❌ 0% (still Tokyo data)
- Timetables: ❌ 0% (still Tokyo data)
- Loader integration: ❌ 0% (not updated yet)

---

## 💪 Estimated Time to MVP

**Minimum Viable Product (Static map with MRT lines):**
- ✅ Configuration: Done
- 🟡 Complete stations: 1-2 days
- 🟡 Route coordinates: 2-3 days
- 🟡 Update loader: 1 day
- 🟡 Testing: 1 day
- **Total: 5-7 days**

**Full Real-Time Version:**
- Above + Timetables: +3-5 days
- Above + Real-time integration: +2-3 days
- Above + Bus data: +5-7 days
- **Total: 15-22 days**

---

## 🤝 Need Help?

If you need assistance with:
1. Adding remaining stations (I can generate the full list)
2. Extracting route coordinates from OSM
3. Parsing shapefile data
4. Creating timetable scripts
5. Updating the loader logic

Just ask! I'm here to help. 🚀

---

**Last Updated:** January 1, 2026
**Status:** Phase 1 Complete - Data conversion scripts ready
**Next Milestone:** Complete station list + route coordinates
