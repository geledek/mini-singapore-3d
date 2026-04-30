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
            const {dict, gtfs, lastDynamicUpdate} = me._map,
                gtfsArray = [...gtfs.values()];

            // Format static update (strip extra quotes from build)
            const staticUpdate = (configs.lastStaticUpdate || '').replace(/^["']|["']$/g, '');

            // Format flight timestamp
            const flightUpdate = lastDynamicUpdate['opensky'] || lastDynamicUpdate['schedule'];
            const flightFormatted = flightUpdate
                ? (typeof flightUpdate === 'number' ? new Date(flightUpdate).toLocaleString() : flightUpdate)
                : 'N/A';

            // Bus data status
            const busPoller = me._map.busArrivalPoller;
            const busStatus = busPoller && busPoller.lastResults.size > 0
                ? `Live (${busPoller.lastResults.size} entries)`
                : gtfsArray.length > 0 ? 'Timetable simulation' : 'N/A';

            me.setHTML([
                dict['description'].replace(/<h3>.*<\/h3>/, ''),
                `<p>${configs.copyright}</p>`,
                `<div class="card-title">${dict['static-update']}</div>`,
                `<div class="card-body">${staticUpdate}</div>`,
                `<div class="card-title">${dict['dynamic-update']}</div>`,
                '<div class="card-body">',
                `Timetable (${dict['smrt']})<br>`,
                `Timetable (${dict['sbs']})<br>`,
                `${flightFormatted} (${dict['opensky']})<br>`,
                `${busStatus} (Bus Arrival API)`,
                '</div>'
            ].join(''));
        }

        return me;
    }

}
