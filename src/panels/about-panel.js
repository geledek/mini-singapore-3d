import configs from '../configs';
import Panel from './panel';

export default class extends Panel {

    constructor(options) {
        super(Object.assign({
            className: 'about-panel',
            modal: true
        }, options));
    }

    addTo(map) {
        return super.addTo(map)
            .setTitle(map.dict['about'])
            .updateContent();
    }

    updateContent() {
        const me = this;

        if (me.isOpen()) {
            const {dict, gtfs} = me._map;

            // Format static update (strip extra quotes from build)
            const staticUpdate = (configs.lastStaticUpdate || '').replace(/^["']|["']$/g, '');

            // MRT status
            const trainCount = me._map.activeTrainLookup ? me._map.activeTrainLookup.size : 0;

            // Flight status
            const flightCount = me._map.activeFlightLookup ? me._map.activeFlightLookup.size : 0;
            const flightLastUpdate = me._map.lastFlightUpdate;
            const flightStatus = flightLastUpdate ?
                `Live — ${flightCount} active (${formatTime(flightLastUpdate)})` :
                flightCount > 0 ? `Simulated — ${flightCount} active` : 'N/A';

            // Bus status
            const busPoller = me._map.busArrivalPoller;
            const lta = gtfs.get('lta');
            const busCount = lta ? lta.activeBusLookup.size : 0;
            const busLastUpdate = busPoller ? busPoller.lastPollTime : null;
            const busEntries = busPoller ? busPoller.lastResults.size : 0;
            const busStatus = busEntries > 0 ?
                `Live — ${busCount} buses, ${busEntries} arrivals (${formatTime(busLastUpdate)})` :
                busCount > 0 ? `Simulated — ${busCount} active` : 'N/A';

            // Service alerts status
            const railFeedPoller = me._map.railFeedPoller;
            const alerts = railFeedPoller ? railFeedPoller.state.alerts : null;
            const alertsUpdatedAt = railFeedPoller ? railFeedPoller.state.updatedAt : null;
            const disruptedLines = alerts && alerts.status === 2 ?
                [...new Set(alerts.affected.map(seg => seg.line))].join(', ') :
                '';
            const alertStatus = !alerts ?
                'N/A' :
                alerts.status === 2 ?
                    `Disrupted (${disruptedLines})` :
                    'Normal';
            const alertStatusText = alertsUpdatedAt ?
                `${alertStatus} (${formatTime(alertsUpdatedAt)})` :
                alertStatus;

            // Assembled at runtime (reversed parts) so the address doesn't
            // appear verbatim in the bundle for email scrapers to harvest.
            const feedbackAddress = ['.ai', 'rayhan', '@', 'ray'].reverse().join(''),
                feedbackHref = ['otliam'.split('').reverse().join(''), ':', feedbackAddress, '?subject=Mini%20Singapore%203D'].join('');

            me.setHTML([
                dict['description'].replace(/<h3>.*<\/h3>/, ''),
                `<p>${configs.copyright}</p>`,
                '<div class="card-body" style="margin-bottom:8px;">',
                '<strong>Author:</strong> Ray Han<br>',
                '<strong>Source:</strong> <a href="https://github.com/geledek/mini-singapore-3d" target="_blank" style="color:#4fc3f7;">github.com/geledek/mini-singapore-3d</a><br>',
                `<strong>Feedback:</strong> <a href="${feedbackHref}" style="color:#4fc3f7;">${feedbackAddress}</a> · <a href="https://github.com/geledek/mini-singapore-3d/issues" target="_blank" style="color:#4fc3f7;">report an issue</a>`,
                '</div>',
                `<div class="card-title">${dict['static-update']}</div>`,
                `<div class="card-body">${staticUpdate}</div>`,
                `<div class="card-title">${dict['dynamic-update']}</div>`,
                '<div class="card-body">',
                `<strong>MRT/LRT:</strong> Simulated — ${trainCount} trains active<br>`,
                `<strong>Flights:</strong> ${flightStatus}<br>`,
                `<strong>Buses:</strong> ${busStatus}<br>`,
                `<strong>Service alerts:</strong> ${alertStatusText}`,
                '</div>'
            ].join(''));
        }

        return me;
    }

}

function formatTime(timestamp) {
    if (!timestamp) return '';
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit', second: '2-digit'});
}
