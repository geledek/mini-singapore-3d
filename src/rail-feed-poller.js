import configs from './configs';

const ALERTS_INTERVAL = 60000; // 1 minute
const CROWD_INTERVAL = 300000; // 5 minutes (LTA updates PCD every 10 minutes)

// LTA line codes used by PCDRealTime, mapped to this app's railway IDs.
// Canonical list of LTA line codes: VALID_LINES in api/rail-feeds.js.
// CEL (Circle Line Extension) is intentionally omitted here; its stations
// report under CCL in this app's mapping.
const CROWD_LINES = {
    NSL: 'smrt-nsl',
    EWL: 'smrt-ewl',
    CGL: 'smrt-ewl',
    CCL: 'smrt-ccl',
    TEL: 'smrt-tel',
    NEL: 'sbst-nel',
    DTL: 'sbst-dtl',
    BPL: 'smrt-bplrt',
    SLRT: 'sbst-slrt',
    PLRT: 'sbst-plrt'
};

/**
 * Rail feed poller: LTA Train Service Alerts + real-time Platform Crowd Density.
 * LTA provides no train position or arrival data for rail, so these feeds are
 * the only live rail signals available. Normalized output is intended to feed
 * the timetable simulation (disruption overlays, crowd-weighted dwell times).
 *
 * State shape passed to listeners:
 *   {
 *     alerts: {status: 1|2, affected: [{line, direction, stations, freePublicBus,
 *              freeMRTShuttle, shuttleDirection}], messages: [{content, createdAt}]},
 *     crowd: Map<stationCode, 'l'|'m'|'h'>,
 *     updatedAt: number
 *   }
 */
export default class RailFeedPoller {

    constructor() {
        this.polling = false;
        this.timers = [];
        this.listeners = [];
        this.state = {alerts: null, crowd: new Map(), updatedAt: null};
        const proxy = configs.proxyUrl;
        this.proxyUrl = proxy ? proxy.replace(/^["']|["']$/g, '') : null;
    }

    get enabled() {
        return this.proxyUrl && this.proxyUrl !== 'BUILD_PROXY_URL';
    }

    start() {
        if (this.polling || !this.enabled) return;
        this.polling = true;
        this.pollAlerts();
        this.pollCrowd();
        this.timers = [
            setInterval(() => this.pollAlerts(), ALERTS_INTERVAL),
            setInterval(() => this.pollCrowd(), CROWD_INTERVAL)
        ];
    }

    stop() {
        this.polling = false;
        for (const timer of this.timers) {
            clearInterval(timer);
        }
        this.timers = [];
    }

    onUpdate(fn) {
        this.listeners.push(fn);
    }

    notify() {
        this.state.updatedAt = Date.now();
        for (const fn of this.listeners) {
            fn(this.state);
        }
    }

    async fetchFeed(params) {
        try {
            const res = await fetch(`${this.proxyUrl}/api/rail-feeds?${params}`, {
                headers: {'accept': 'application/json'}
            });
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async pollAlerts() {
        const data = await this.fetchFeed('feed=alerts');
        if (!data || !data.value) return;

        const {Status, AffectedSegments, Message} = data.value;
        this.state.alerts = {
            status: Status, // 1 = normal, 2 = disrupted
            affected: (AffectedSegments || []).map(seg => ({
                line: seg.Line,
                railwayId: CROWD_LINES[seg.Line] || null,
                direction: seg.Direction,
                stations: seg.Stations ? seg.Stations.split(',') : [],
                freePublicBus: seg.FreePublicBus,
                freeMRTShuttle: seg.FreeMRTShuttle,
                shuttleDirection: seg.MRTShuttleDirection
            })),
            messages: (Message || []).map(m => ({
                content: m.Content,
                createdAt: m.CreatedDate
            }))
        };
        this.notify();
    }

    async pollCrowd() {
        const crowd = new Map();
        for (const line of Object.keys(CROWD_LINES)) {
            if (!this.polling) return;
            const data = await this.fetchFeed(`feed=crowd&line=${line}`);
            if (!data || !data.value) continue;
            for (const entry of data.value) {
                // CrowdLevel: 'l' (low), 'm' (moderate), 'h' (high)
                crowd.set(entry.Station, entry.CrowdLevel);
            }
        }
        if (crowd.size > 0) {
            this.state.crowd = crowd;
            this.notify();
        }
    }

    /**
     * Whether a railway currently has a service disruption.
     * @param {string} railwayId - Railway ID (e.g. 'smrt-nsl')
     * @returns {boolean} True if the railway has an active alert segment
     */
    isDisrupted(railwayId) {
        const {alerts} = this.state;
        if (!alerts || alerts.status !== 2) return false;
        return alerts.affected.some(seg => seg.railwayId === railwayId);
    }

    /**
     * Crowd level for a station.
     * @param {string} stationCode - Station code (e.g. 'NS1')
     * @returns {string|null} 'l', 'm', 'h' or null if unknown
     */
    getCrowdLevel(stationCode) {
        return this.state.crowd.get(stationCode) || null;
    }
}
