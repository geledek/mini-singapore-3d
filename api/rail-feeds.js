/**
 * Vercel serverless function: Rail feeds proxy
 * Proxies LTA DataMall rail APIs to avoid CORS issues.
 *
 * Usage:
 *   GET /api/rail-feeds?feed=alerts            → Train Service Alerts
 *   GET /api/rail-feeds?feed=crowd&line=NSL    → Real-time Platform Crowd Density
 */

const LTA_BASE = 'https://datamall2.mytransport.sg/ltaodataservice';

const FEEDS = {
    alerts: () => ({url: `${LTA_BASE}/TrainServiceAlerts`, maxAge: 60}),
    crowd: line => ({url: `${LTA_BASE}/PCDRealTime?TrainLine=${line}`, maxAge: 300})
};

// Canonical list of LTA line codes accepted by PCDRealTime. Note that
// CEL (Circle Line Extension) stations report under CCL in the app mapping
// (see CROWD_LINES in src/rail-feed-poller.js).
const VALID_LINES = ['CCL', 'CEL', 'CGL', 'DTL', 'EWL', 'NEL', 'NSL', 'BPL', 'SLRT', 'PLRT', 'TEL'];

export default async function handler(req, res) {
    const {feed, line} = req.query;

    if (!Object.hasOwn(FEEDS, feed)) {
        return res.status(400).json({error: 'feed parameter must be "alerts" or "crowd"'});
    }
    if (feed === 'crowd' && !VALID_LINES.includes(line)) {
        return res.status(400).json({error: `line parameter must be one of ${VALID_LINES.join(', ')}`});
    }

    const apiKey = process.env.LTA_ACCOUNT_KEY;
    if (!apiKey) {
        return res.status(500).json({error: 'LTA_ACCOUNT_KEY not configured'});
    }

    try {
        const {url, maxAge} = FEEDS[feed](line);
        const response = await fetch(url, {
            headers: {
                'AccountKey': apiKey,
                'accept': 'application/json'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({error: `LTA API error: ${response.status}`});
        }

        const data = await response.json();

        res.setHeader('Cache-Control', `s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(data);
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}
