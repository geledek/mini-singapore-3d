# Mini Singapore 3D

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0--alpha.1-orange)](https://github.com/yourusername/mini-singapore-3d)

A real-time 3D digital map of Singapore's public transport system.

Forked from [Mini Tokyo 3D](https://github.com/nagix/mini-tokyo-3d) by Akihiko Kusanagi, adapted for Singapore's map and data.

## Changelog

For recent changes and version history, see [CHANGELOG.md](CHANGELOG.md).


## Features

- Real-time visualization of MRT and LRT trains across all 9 lines:
  - SMRT: North-South Line (NSL), East-West Line (EWL), Circle Line (CCL), Thomson-East Coast Line (TEL), Bukit Panjang LRT (BPLRT)
  - SBS Transit: North East Line (NEL), Downtown Line (DTL), Sengkang LRT (SKLRT), Punggol LRT (PGLRT)
- Interactive 3D map with train animations
- Station information and interchange connections
- Support for underground and above-ground view modes

## Cheat Sheet

Operation | Description
--- | ---
Mouse or finger drag | Pan
Mouse wheel rotation | Zoom in/out
Right click or Ctrl key + mouse drag | Tilt up/down and rotate
Shift key + mouse drag | Box zoom
Pinch in/out | Zoom in/out
Two-finger drag | Tilt up/down and rotate
Double-click or triple-tap | Zoom in
Shift key + Double-click or two-finger tap | Zoom out
Click or tap +/- buttons | Zoom in/out
Click or tap the compass button | Reset bearing to north
Click or tap the compass button + mouse or finder drag | Rotate
Click or tap the fullscreen button | Toggle the fullscreen mode
Click or tap the eye button | Toggle the underground mode
Click or tap the playback button | Toggle the playback mode
Click or tap the battery button | Toggle the eco mode
Click or tap the layer button | Show/hide the layer display settings panel
Click or tap the camera button | Show/hide the tracking mode settings panel
Click or tap the info button | Show/hide the app info panel
Click or tap a train/station | Enable tracking or select station
Click or tap the map | Disable tracking or deselect station
Hover a train/station | Show the train/station information

## Language Support

Currently, the following languages are supported for Singapore's multilingual context:

Language | User Interface | Map Labels | Stations, Railways, etc.
--- | --- | --- | ---
English | Yes | Yes | Yes
Chinese (Simplified) | Yes | Yes | Yes
Chinese (Traditional) | Yes | Yes | Yes
Malay | Partial | Partial | Partial
Tamil | Partial | Partial | Partial

If you want to contribute translations, please update the `dictionary-<ISO 639-1 code>.json` files in the [`assets`](./assets) directory and add translations to the data files in the [`data`](./data) directory.

## About Data

The visualization uses:
- **Singapore LTA DataMall API** for real-time train arrival data and service alerts
- **Station and railway data** from Singapore's MRT/LRT network
- **GTFS data** for bus routes and timetables
- **Mapbox** for base map tiles and 3D terrain

Note: Real-time train position data is currently simulated based on timetables, as Singapore's LTA DataMall does not provide live train GPS coordinates (unlike Tokyo's ODPT system).

## How to Build

### Prerequisites

First, get access tokens by signing up at:
- [Singapore LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html) - for transport data
- [Mapbox](https://account.mapbox.com/auth/signup/) - for map tiles

### Setup

1. Clone the repository
2. Copy environment template:

```bash
cp .env.example .env
```

3. Edit `.env` with your API keys:

```bash
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_token_here
LTA_ACCOUNT_KEY=your_lta_account_key_here
```

4. Install dependencies and build:

```bash
npm install
npm run build-all
```

This will generate the application in the `build` directory.

⚠️ **Important:** Never commit the `.env` file - it contains sensitive API keys and is gitignored.

### Development

For development with live reload:

```bash
npm run build        # Build JavaScript/CSS bundles
npm run build-pages  # Copy static files
npm run build-data   # Generate compressed data files
npx serve build -p 8080  # Start local server
```

## Project Structure

- `src/` - Source code
  - `map.js` - Main map controller
  - `loader.js` - Data loading and processing
  - `layers/` - Custom Mapbox layers (Three.js integration, traffic)
  - `data-classes/` - Domain models (Train, Station, Railway, etc.)
  - `mesh-sets/` - 3D geometry and rendering
- `data/` - Source data files (railways, stations, timetables)
- `scripts/` - Build scripts and data generators
- `build/` - Generated output (created by build process)

## License

Mini Singapore 3D is available under the [MIT license](https://opensource.org/licenses/MIT).

## Credits

This project is a fork of [Mini Tokyo 3D](https://github.com/nagix/mini-tokyo-3d) by Akihiko Kusanagi.

Original Mini Tokyo 3D:
- Author: Akihiko Kusanagi
- License: MIT
- Repository: https://github.com/nagix/mini-tokyo-3d

## Documentation

- [CHANGELOG.md](CHANGELOG.md) - Version history and release notes
- [CLAUDE.md](CLAUDE.md) - Developer documentation for Claude Code
- [docs/](docs/) - User guides and developer documentation
- [docs/archive/development-notes/](docs/archive/development-notes/) - Historical development notes
