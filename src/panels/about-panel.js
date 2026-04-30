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
            const flightStatus = flightLastUpdate
                ? `Live — ${flightCount} active (${formatTime(flightLastUpdate)})`
                : flightCount > 0 ? `Simulated — ${flightCount} active` : 'N/A';

            // Bus status
            const busPoller = me._map.busArrivalPoller;
            const lta = gtfs.get('lta');
            const busCount = lta ? lta.activeBusLookup.size : 0;
            const busLastUpdate = busPoller ? busPoller.lastPollTime : null;
            const busEntries = busPoller ? busPoller.lastResults.size : 0;
            const busStatus = busEntries > 0
                ? `Live — ${busCount} buses, ${busEntries} arrivals (${formatTime(busLastUpdate)})`
                : busCount > 0 ? `Simulated — ${busCount} active` : 'N/A';

            me.setHTML([
                dict['description'].replace(/<h3>.*<\/h3>/, ''),
                `<p>${configs.copyright}</p>`,
                `<div class="card-title">${dict['static-update']}</div>`,
                `<div class="card-body">${staticUpdate}</div>`,
                `<div class="card-title">${dict['dynamic-update']}</div>`,
                '<div class="card-body">',
                `<strong>MRT/LRT:</strong> Simulated — ${trainCount} trains active<br>`,
                `<strong>Flights:</strong> ${flightStatus}<br>`,
                `<strong>Buses:</strong> ${busStatus}`,
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
