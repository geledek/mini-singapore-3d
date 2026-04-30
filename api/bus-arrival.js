/**
 * Vercel serverless function: Bus Arrival proxy
 * Proxies LTA DataMall Bus Arrival API to avoid CORS issues.
 *
 * Usage: GET /api/bus-arrival?stopCode=01012
 */

export default async function handler(req, res) {
    const {stopCode} = req.query;

    if (!stopCode) {
        return res.status(400).json({error: 'stopCode parameter required'});
    }

    const apiKey = process.env.LTA_ACCOUNT_KEY;
    if (!apiKey) {
        return res.status(500).json({error: 'LTA_ACCOUNT_KEY not configured'});
    }

    try {
        const response = await fetch(
            `https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=${stopCode}`,
            {
                headers: {
                    'AccountKey': apiKey,
                    'accept': 'application/json'
                }
            }
        );

        if (!response.ok) {
            return res.status(response.status).json({error: `LTA API error: ${response.status}`});
        }

        const data = await response.json();

        // Cache for 15 seconds
        res.setHeader('Cache-Control', 's-maxage=15, stale-while-revalidate=30');
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(data);
    } catch (e) {
        return res.status(500).json({error: e.message});
    }
}
