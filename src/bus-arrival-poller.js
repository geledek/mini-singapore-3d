import configs from './configs';

const BUS_ARRIVAL_URL = 'https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival';
const POLL_INTERVAL = 25000; // 25 seconds
const MAX_STOPS_PER_CYCLE = 80; // Stay within rate limits
const BATCH_SIZE = 5; // Concurrent requests per batch
const BATCH_DELAY = 200; // ms between batches

/**
 * Bus Arrival API poller.
 * Polls visible bus stops and returns real-time bus data.
 * Uses proxy URL if configured (LTA API blocks browser CORS).
 */
export default class BusArrivalPoller {

    constructor(map) {
        this.map = map;
        this.polling = false;
        this.timer = null;
        this.lastResults = new Map();
        this.lastPollTime = null;
        this.listeners = [];
        // Strip any extra quotes from build-time replacement
        const proxy = configs.proxyUrl;
        this.proxyUrl = proxy ? proxy.replace(/^["']|["']$/g, '') : null;
    }

    start() {
        if (this.polling) return;
        this.polling = true;
        this.poll();
        this.timer = setInterval(() => this.poll(), POLL_INTERVAL);
    }

    stop() {
        this.polling = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    onUpdate(fn) {
        this.listeners.push(fn);
    }

    async poll() {
        const apiKey = configs.apiUrl.ltaAccountKey;
        if (!apiKey && !this.proxyUrl) return;
        if (this.proxyUrl === 'BUILD_PROXY_URL') return;

        // Get visible stops from viewport
        const visibleStops = this.getVisibleStops();
        if (visibleStops.length === 0) return;

        // Limit to MAX_STOPS_PER_CYCLE
        const stopsToPoll = visibleStops.slice(0, MAX_STOPS_PER_CYCLE);

        // Batch requests
        const results = [];
        for (let i = 0; i < stopsToPoll.length; i += BATCH_SIZE) {
            const batch = stopsToPoll.slice(i, i + BATCH_SIZE);
            const batchResults = await Promise.all(
                batch.map(stop => this.fetchArrival(stop.code, apiKey))
            );
            results.push(...batchResults.filter(r => r !== null));
            if (i + BATCH_SIZE < stopsToPoll.length) {
                await new Promise(r => setTimeout(r, BATCH_DELAY));
            }
        }

        // Process results
        const busUpdates = new Map();
        for (const result of results) {
            for (const svc of result.services) {
                for (const bus of [svc.NextBus, svc.NextBus2, svc.NextBus3]) {
                    if (!bus || !bus.EstimatedArrival) continue;

                    const lat = parseFloat(bus.Latitude);
                    const lng = parseFloat(bus.Longitude);
                    const hasPosition = bus.Monitored === 1 && lat !== 0 && lng !== 0;

                    const key = `${svc.ServiceNo}-${result.stopCode}-${bus.VisitNumber || '1'}`;
                    busUpdates.set(key, {
                        serviceNo: svc.ServiceNo,
                        operator: svc.Operator,
                        stopCode: result.stopCode,
                        load: bus.Load,
                        type: bus.Type,
                        eta: bus.EstimatedArrival,
                        monitored: bus.Monitored === 1,
                        position: hasPosition ? [lng, lat] : null,
                        originCode: bus.OriginCode,
                        destinationCode: bus.DestinationCode
                    });
                }
            }
        }

        // Store results
        this.lastResults = busUpdates;
        this.lastPollTime = Date.now();

        // Notify listeners
        for (const fn of this.listeners) {
            fn(busUpdates);
        }
    }

    getVisibleStops() {
        const map = this.map;
        const gtfs = map.gtfs.get('lta');
        if (!gtfs) return [];

        // Get map bounds
        const bounds = map.map.getBounds();
        const stops = [];

        for (const [id, stop] of gtfs.stopLookup) {
            const [lng, lat] = stop.coord;
            if (lng >= bounds.getWest() && lng <= bounds.getEast() &&
                lat >= bounds.getSouth() && lat <= bounds.getNorth()) {
                stops.push({...stop, code: id});
            }
        }

        return stops;
    }

    async fetchArrival(stopCode, apiKey) {
        try {
            let url, headers;

            if (this.proxyUrl && this.proxyUrl !== 'BUILD_PROXY_URL') {
                // Use proxy to avoid CORS
                url = `${this.proxyUrl}/api/bus-arrival?stopCode=${stopCode}`;
                headers = {'accept': 'application/json'};
            } else {
                // Direct (only works server-side or with CORS proxy)
                url = `${BUS_ARRIVAL_URL}?BusStopCode=${stopCode}`;
                headers = {'AccountKey': apiKey, 'accept': 'application/json'};
            }

            const res = await fetch(url, {headers});
            if (!res.ok) return null;
            const data = await res.json();
            return {
                stopCode,
                services: data.Services || []
            };
        } catch (e) {
            return null;
        }
    }

    /**
     * Get the current load for a bus on a specific route.
     * @param {string} serviceNo - Bus service number
     * @returns {string|null} Load value: 'SEA', 'SDA', or 'LSD'
     */
    getLoadForService(serviceNo) {
        for (const [, data] of this.lastResults) {
            if (data.serviceNo === serviceNo && data.load) {
                return data.load;
            }
        }
        return null;
    }
}
