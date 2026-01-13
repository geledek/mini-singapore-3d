# Mini Singapore 3D

<!-- TODO: Add hero image or animated GIF showing trains moving on the 3D map -->
<!-- ![Mini Singapore 3D](docs/images/hero.gif) -->

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.1.0--alpha-orange)](https://github.com/geledek/mini-singapore-3d/releases)
<!-- [![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://mini-singapore-3d.vercel.app) -->
[![Mapbox](https://img.shields.io/badge/Mapbox-000?logo=mapbox&logoColor=fff)](https://www.mapbox.com/)
[![Three.js](https://img.shields.io/badge/Three.js-000?logo=threedotjs&logoColor=fff)](https://threejs.org/)
[![deck.gl](https://img.shields.io/badge/deck.gl-FC4C02)](https://deck.gl/)

A real-time 3D visualization of Singapore's MRT and LRT network. Watch trains move across all 9 lines on an interactive 3D map.

<!-- **[View Live Demo](https://mini-singapore-3d.vercel.app)** -->

> Forked from [Mini Tokyo 3D](https://github.com/nagix/mini-tokyo-3d) by Akihiko Kusanagi

## Features

- **9 rail lines, 215 stations** - Complete MRT and LRT network coverage
- **Real-time train simulation** - Trains follow accurate timetables throughout the day
- **3D interactive map** - Tilt, rotate, and zoom with smooth animations
- **Accurate track geometry** - Curved rails from OpenStreetMap data
- **Station details** - Exit locations, interchange connections, and station codes
- **Multi-language** - English, 中文, Bahasa Melayu, தமிழ்

## Quick Start

### Prerequisites

Get API keys from:
- [Mapbox](https://account.mapbox.com/) - for map tiles
- [LTA DataMall](https://datamall.lta.gov.sg/content/datamall/en/request-for-api.html) - for Singapore transport data

### Setup

```bash
# Clone the repository
git clone https://github.com/geledek/mini-singapore-3d.git
cd mini-singapore-3d

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Install and build
npm install
npm run build-all

# Start local server
npm start
```

Open http://localhost:8080 in your browser.

## Tech Stack

| Layer | Technology |
|-------|------------|
| 3D Map | [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs) |
| Data Visualization | [deck.gl](https://deck.gl/) |
| 3D Meshes | [Three.js](https://threejs.org/) |
| Build | [Rollup](https://rollupjs.org/) |
| Deployment | [Vercel](https://vercel.com/) |

## Documentation

- [User Guide](docs/user-guide/) - How to use the map
- [Developer Guide](docs/developer-guide/) - API and customization
- [CHANGELOG](CHANGELOG.md) - Version history and recent updates

## Data Sources

- **[SGRailData](https://github.com/cheeaun/sgraildata)** - Station coordinates, exits, and rail geometry
- **[LTA DataMall](https://datamall.lta.gov.sg/)** - Official Singapore transport data
- **[OpenStreetMap](https://www.openstreetmap.org/)** - Track geometry

## Contributing

Contributions are welcome! Areas that need help:

- [ ] Real-time train arrival integration (when LTA provides it)
- [ ] Bus route visualization
- [ ] Malay and Tamil translations
- [ ] Performance optimizations

## License

[MIT License](LICENSE) - see the LICENSE file for details.

## Credits

This project is a fork of [Mini Tokyo 3D](https://github.com/nagix/mini-tokyo-3d) by [Akihiko Kusanagi](https://github.com/nagix).

Special thanks to:
- [Chee Aun](https://github.com/cheeaun) for [SGRailData](https://github.com/cheeaun/sgraildata) and [RailRouter SG](https://github.com/cheeaun/railrouter-sg)
- [Land Transport Authority](https://www.lta.gov.sg/) for open transport data
