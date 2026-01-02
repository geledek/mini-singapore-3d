# Mini Singapore 3D - Initial Configuration Complete ✅

## Configuration Summary

The project has been successfully configured for Singapore with your API keys!

---

## ✅ Changes Made

### 1. **[src/configs.js](src/configs.js)** - Main Configuration

#### Geographic Settings:
- **Center:** Changed from Tokyo Station `[139.7670, 35.6814]` to Singapore City Hall `[103.8519, 1.2929]`
- **Default Zoom:** Changed from `14` to `12` (Singapore is smaller than Tokyo metro)

#### API Configuration:
```javascript
apiUrl: {
    lta: 'http://datamall2.mytransport.sg/ltaodataservice/',
    ltaAccountKey: '+Z3IvSNwTlmKVY92BS4/nQ=='
}

busArrivalUrl: 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2'
trainAlertUrl: 'http://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts'
passengerVolumeUrl: 'http://datamall2.mytransport.sg/ltaodataservice/PCDRealTime'
```

#### Mapbox Token:
```javascript
mapboxAccessToken: 'pk.eyJ1IjoiZ2VsZWRlayIsImEiOiJjbWp2Z2kxeGs1YXowM2RvdDAwZzA5eDdmIn0.cvxqYNPcROKg8kqsH7nNrQ'
```

#### Language Support:
- Changed from: `['de', 'en', 'es', 'fr', 'ja', 'ko', 'ne', 'pt-BR', 'th', 'zh-Hans', 'zh-Hant']`
- Changed to: `['en', 'zh-Hans', 'zh-Hant', 'ms', 'ta']` (Singapore's official languages)

---

### 2. **[src/clock.js](src/clock.js)** - Timezone & Holidays

#### Timezone:
- Changed from: `offset = -540` (JST, UTC+9)
- Changed to: `offset = -480` (SGT, UTC+8)

#### Public Holidays:
- Removed: `japanese-holidays` package dependency
- Added: Singapore 2026 public holidays array:
  ```javascript
  const SINGAPORE_HOLIDAYS = [
      '2026-01-01', // New Year's Day
      '2026-01-29', // Chinese New Year
      '2026-01-30', // Chinese New Year
      '2026-04-10', // Good Friday
      '2026-05-01', // Labour Day
      '2026-05-04', // Vesak Day
      '2026-06-15', // Hari Raya Puasa
      '2026-08-09', // National Day
      '2026-08-10', // National Day (observed)
      '2026-08-21', // Hari Raya Haji
      '2026-10-24', // Deepavali
      '2026-12-25', // Christmas Day
  ];
  ```

---

### 3. **[package.json](package.json)** - Project Metadata

- **Name:** `mini-singapore-3d`
- **Version:** `0.1.0-alpha.1`
- **Description:** "A real-time 3D digital map of Singapore's public transport system"
- **Removed dependency:** `japanese-holidays`

---

## 🚧 Next Steps

### Phase 1: Data Collection (Start Here)

1. **Download GTFS Data:**
   ```bash
   # Login to LTA DataMall at https://datamall.lta.gov.sg
   # Navigate to "Static Datasets" > "GTFS"
   # Download the latest GTFS.zip file
   ```

2. **Extract GTFS Data:**
   ```bash
   mkdir -p /Users/I311008/Workspace/mini-singapore-3d/gtfs-data
   unzip GTFS.zip -d gtfs-data/
   ```

3. **Inspect GTFS Files:**
   The GTFS archive contains:
   - `stops.txt` - All MRT/LRT/Bus stops with coordinates
   - `routes.txt` - All transport routes
   - `trips.txt` - Service patterns
   - `stop_times.txt` - Timetables
   - `shapes.txt` - Route geometries
   - `calendar.txt` - Service days

### Phase 2: Create Data Conversion Scripts

You'll need to write Node.js scripts to convert GTFS data to the custom JSON format:

1. **stations.json** - From GTFS `stops.txt`
2. **railways.json** - From GTFS `routes.txt`
3. **coordinates.json** - From GTFS `shapes.txt`
4. **timetable-*.json.gz** - From GTFS `stop_times.txt` + `calendar.txt`

### Phase 3: Backend Proxy Server

Create a simple Express server to:
- Cache LTA DataMall API responses
- Aggregate real-time bus/train data
- Serve as CORS proxy

**Example structure:**
```bash
mkdir -p backend
cd backend
npm init -y
npm install express axios node-cache cors
```

### Phase 4: Update Loader Logic

Modify [src/loader.js](src/loader.js) to:
- Remove Tokyo-specific railway/operator lists
- Add Singapore MRT/LRT lines
- Integrate with LTA DataMall APIs

---

## 📝 TODO List

- [ ] Download LTA GTFS data
- [ ] Write GTFS → JSON conversion scripts
- [ ] Create minimal `data/stations.json` with Singapore MRT stations
- [ ] Create minimal `data/railways.json` with MRT lines
- [ ] Update [src/loader.js](src/loader.js) with Singapore railways
- [ ] Build backend proxy server
- [ ] Test basic map rendering
- [ ] Add real-time bus data integration
- [ ] Add MRT service alerts
- [ ] Create Malay (`ms`) and Tamil (`ta`) translation files

---

## 🧪 Testing the Configuration

To test if the basic configuration works:

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Check if there are any errors
# (You'll get warnings about missing data files - that's expected!)
```

---

## 📚 Singapore Transport Data Sources

### LTA DataMall APIs (You already have access!)
- **Base URL:** `http://datamall2.mytransport.sg/ltaodataservice/`
- **Your API Key:** `+Z3IvSNwTlmKVY92BS4/nQ==`
- **Header:** `AccountKey: +Z3IvSNwTlmKVY92BS4/nQ==`

### Available Endpoints:
1. **Bus Arrival (Real-time):**
   ```
   GET /BusArrivalv2?BusStopCode={code}
   ```

2. **Bus Services (Static):**
   ```
   GET /BusServices
   ```

3. **Bus Routes (Static):**
   ```
   GET /BusRoutes?ServiceNo={number}
   ```

4. **Bus Stops (Static):**
   ```
   GET /BusStops
   ```

5. **Train Service Alerts (Real-time):**
   ```
   GET /TrainServiceAlerts
   ```

6. **Passenger Volume (Real-time):**
   ```
   GET /PCDRealTime
   ```

### Quick API Test:
```bash
# Test your LTA API key
curl -X GET "http://datamall2.mytransport.sg/ltaodataservice/BusStops?%24skip=0" \
  -H "AccountKey: +Z3IvSNwTlmKVY92BS4/nQ=="
```

---

## 🎯 Singapore MRT/LRT Lines to Include

### MRT Lines:
1. **North South Line (NSL)** - Red `#D42E12`
2. **East West Line (EWL)** - Green `#009645`
3. **Circle Line (CCL)** - Orange/Yellow `#FA9E0D`
4. **North East Line (NEL)** - Purple `#9900AA`
5. **Downtown Line (DTL)** - Blue `#005EC4`
6. **Thomson-East Coast Line (TEL)** - Brown `#9D5B25`

### LRT Lines:
7. **Bukit Panjang LRT** - Grey `#748477`
8. **Sengkang LRT** - Grey `#748477`
9. **Punggol LRT** - Grey `#748477`

### Operators:
- **SMRT Corporation** - Operates NSL, EWL, CCL, TEL, BP LRT
- **SBS Transit** - Operates NEL, DTL, SK/PG LRT

---

## ⚠️ Important Notes

1. **Data Files Missing:** The project will not run yet because the `/data/*.json` files still contain Tokyo data. You need to replace these with Singapore data.

2. **GTFS Conversion Required:** You'll need to write scripts to convert LTA's GTFS data to the custom JSON format used by this app.

3. **Backend Not Set Up:** The `proxyUrl` points to `http://localhost:3000/api` which doesn't exist yet. You'll need to create this.

4. **Asset Files:** Some asset files (like map styles, dictionaries) may still reference Tokyo. These will be updated in later phases.

---

## 🆘 Need Help?

If you need assistance with:
- Writing GTFS conversion scripts
- Setting up the backend proxy server
- Creating sample data files
- Testing the LTA API

Just ask! I can help generate those scripts and files for you.

---

**Status:** ✅ Initial configuration complete
**Next Step:** Download GTFS data and start data conversion
**Estimated Time to Working Demo:** 2-3 weeks with data conversion
