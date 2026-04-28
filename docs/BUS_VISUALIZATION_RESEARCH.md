# Bus Visualization Research

**Date:** 2026-04-28
**Status:** PoC In Progress (Orchard Road Corridor)

## Summary

Bus visualization is feasible using LTA DataMall APIs. The Bus Arrival API provides real-time GPS positions when Monitored=1, but requires per-stop queries (no bulk vehicle position endpoint).

## Available APIs

| API | Endpoint | Data |
|-----|----------|------|
| Bus Stops | /BusStops | 5,201 stops with coordinates |
| Bus Routes | /BusRoutes | Ordered stop sequences with distances |
| Bus Services | /BusServices | Frequencies, first/last bus |
| Bus Arrival | /v3/BusArrival?BusStopCode=X | Real-time positions (next 3 buses per service) |

## Key Constraints

1. **Per-stop queries** — Full island (5,100 stops/20s) = 15,300 calls/min (impossible)
2. **No route geometry** — Only stop sequences; must generate lines from stop coords
3. **No vehicle IDs** — Cannot track individual buses across stops
4. **No GTFS feed** — Needs custom adapter for existing codebase infrastructure

## PoC Scope: Orchard Road Corridor

- **Services:** 7, 14, 36, 77, 106, 111, 124, 143, 167, 174
- **Stops:** 737 unique stops
- **Trips/day:** ~1,388 scheduled departures
- **API calls:** ~150/min at 20s refresh (within limits)

## Architecture

- Build-time: Fetch static data → generate route geometry → compress to .json.gz
- Runtime: Load pre-built data → poll Bus Arrival API every 20s → animate buses

## Existing Infrastructure (from Mini Tokyo 3D)

- BusMeshSet: 4,000 bus capacity (Three.js instanced geometry)
- Animation physics: acceleration/deceleration between stops
- Bus panel: route timetable display
- Layer toggle: enable/disable bus visualization
