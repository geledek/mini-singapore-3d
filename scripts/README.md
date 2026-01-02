# Data Conversion Scripts

This directory contains scripts to convert Singapore transport data into the format required by Mini Singapore 3D.

## Scripts Overview

### 1. `fetch-lta-data.js`
Fetches real-time and static data from LTA DataMall API.

**Usage:**
```bash
node fetch-lta-data.js
```

**Fetches:**
- Bus stops
- Bus services
- Bus routes

**Output:** `gtfs-data/lta-api/*.json`

---

### 2. `convert-operators.js`
Generates `operators.json` with Singapore transport operators (SMRT, SBS Transit).

**Usage:**
```bash
node convert-operators.js
```

**Output:** `data/operators.json`

---

### 3. `convert-railways.js`
Generates `railways.json` with all MRT/LRT lines.

**Usage:**
```bash
node convert-railways.js
```

**Lines included:**
- North South Line (NSL)
- East West Line (EWL)
- Circle Line (CCL)
- North East Line (NEL)
- Downtown Line (DTL)
- Thomson-East Coast Line (TEL)
- Bukit Panjang LRT
- Sengkang LRT
- Punggol LRT

**Output:** `data/railways.json`

---

### 4. `convert-stations.js`
Generates `stations.json` with all MRT/LRT stations including coordinates.

**Usage:**
```bash
node convert-stations.js
```

**Output:** `data/stations.json`

**Note:** Currently includes major stations. You may need to add more stations manually or parse from additional data sources.

---

### 5. `build-data.js` (Master Script)
Runs all conversion scripts in the correct order.

**Usage:**
```bash
node build-data.js
```

This is the recommended way to generate all data files at once.

---

## Quick Start

### Prerequisites

```bash
# Make sure you're in the project root
cd /Users/I311008/Workspace/mini-singapore-3d

# Install dependencies (if not already done)
npm install
```

### Generate All Data Files

```bash
# Run the master build script
node scripts/build-data.js
```

### Check Output

```bash
# List generated files
ls -lh data/

# Preview stations.json
head -50 data/stations.json

# Preview railways.json
head -50 data/railways.json
```

---

## Data Sources

### LTA DataMall API
- **URL:** http://datamall2.mytransport.sg/ltaodataservice/
- **API Key:** Configured in scripts (your key: `+Z3IvSNwTlmKVY92BS4/nQ==`)
- **Documentation:** [LTA DataMall Developer Guide](https://datamall.lta.gov.sg/content/datamall/en/dynamic-data.html)

### Static GTFS Data
- **Location:** `gtfs-data/Static_ 2025_05/`
- **Source:** LTA DataMall Static Datasets
- **Format:** Shapefiles (for geospatial data)

---

## File Formats

### stations.json
```json
[{
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
}]
```

### railways.json
```json
[{
  "id": "SMRT.NSL",
  "title": {
    "en": "North South Line",
    "zh-Hans": "南北线",
    "zh-Hant": "南北線",
    "ms": "Laluan Utara Selatan"
  },
  "color": "#D42E12",
  "stations": ["SMRT.NSL.JurongEast", "SMRT.NSL.BukitBatok", ...]
}]
```

### operators.json
```json
[{
  "id": "SMRT",
  "title": {
    "en": "SMRT Corporation"
  },
  "color": "#EE2E24"
}]
```

---

## Next Steps

After generating these files, you'll need to:

1. **Add Route Coordinates** (`coordinates.json`)
   - Extract from GTFS shapes.txt or OpenStreetMap
   - This is the most complex file (79k+ lines in Tokyo version)

2. **Generate Timetables** (`timetable-*.json.gz`)
   - Parse from GTFS stop_times.txt
   - Separate by weekday/saturday/holiday

3. **Add Additional Metadata**
   - `rail-directions.json` - Train directions
   - `train-types.json` - Express/Local/etc
   - `features.json` - GeoJSON features

4. **Compress Files**
   ```bash
   gzip -9 data/*.json
   ```

5. **Update Loader**
   - Modify `src/loader.js` to use Singapore railway/operator IDs
   - Remove Tokyo-specific code

---

## Troubleshooting

### "Cannot find module"
Make sure you're running from the project root or scripts directory.

### "API request failed"
Check your LTA API key and internet connection. LTA may have rate limits.

### "File not found"
Ensure the GTFS data has been extracted to `gtfs-data/Static_ 2025_05/`.

---

## Manual Data Entry

Some data may need to be entered manually:

- **Station coordinates:** Use Google Maps to get [lng, lat]
- **Chinese translations:** Verify official names from LTA website
- **Malay/Tamil translations:** May need professional translation
- **Route shapes:** Use GeoJSON tools or extract from OpenStreetMap

---

## License

These scripts are part of Mini Singapore 3D, based on Mini Tokyo 3D by Akihiko Kusanagi.
Data sources are credited to LTA Singapore and respective providers.
