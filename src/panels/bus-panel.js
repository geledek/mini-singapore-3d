import {getTimeString, lerp} from '../helpers/helpers';
import Panel from './panel';

export default class extends Panel {

    constructor(options) {
        super(Object.assign({className: 'bus-panel'}, options));
    }

    addTo(map) {
        const me = this,
            busstopHTML = [],
            offsets = [],
            bus = me._options.object,
            gtfs = map.gtfs.get(bus.gtfsId),
            trip = bus.trip,
            {route, stops, departureTimes} = trip,
            routeInfo = gtfs.routeLookup.get(route),
            color = routeInfo.color,
            stopLookup = gtfs.stopLookup,
            now = map.clock.getTimeOffset();

        // Find current position and next stop
        const currentIdx = bus.sectionIndex + bus.sectionLength;
        const nextStop = stopLookup.get(stops[currentIdx]);
        const remainingStops = stops.length - currentIdx - 1;
        const originStop = stopLookup.get(stops[0]);
        const destStop = stopLookup.get(stops[stops.length - 1]);

        // Info section
        const infoHTML = [
            '<div class="bus-info-section">',
            `<div class="bus-info-row"><span class="bus-info-label">Origin</span><span>${originStop ? originStop.name : '-'}</span></div>`,
            `<div class="bus-info-row"><span class="bus-info-label">Destination</span><span>${destStop ? destStop.name : '-'}</span></div>`,
            `<div class="bus-info-row"><span class="bus-info-label">Next Stop</span><span class="bus-info-highlight">${nextStop ? nextStop.name : '-'}</span></div>`,
            `<div class="bus-info-row"><span class="bus-info-label">Stops Remaining</span><span>${remainingStops}</span></div>`,
            `<div class="bus-info-row"><span class="bus-info-label">Operator</span><span>${routeInfo.operator || gtfs.agency}</span></div>`,
            '</div>'
        ].join('');

        for (let i = 0, ilen = stops.length; i < ilen; i++) {
            const stop = stopLookup.get(stops[i]),
                departureTime = getTimeString(departureTimes[i]),
                isCurrent = i === currentIdx,
                isPast = i < currentIdx;

            busstopHTML.push([
                `<div class="busstop-row${isCurrent ? ' busstop-current' : ''}${isPast ? ' busstop-past' : ''}">`,
                `<div class="busstop-title-box">${stop ? stop.name : stops[i]}</div>`,
                `<div class="busstop-time-box">${departureTime}</div>`,
                '</div>'
            ].join(''));
        }

        super.addTo(map);
        me.updateHeader();
        me.setHTML([
            infoHTML,
            '<div id="timetable-content">',
            ...busstopHTML,
            '</div>',
            '<svg id="busroute-mark"></svg>',
            '<svg id="bus-mark"></svg>'
        ].join(''));

        const container = me._container,
            bodyElement = container.querySelector('#panel-body');

        for (const child of container.querySelector('#timetable-content').children) {
            offsets.push(child.offsetTop + child.getBoundingClientRect().height / 2);
        }
        container.querySelector('#busroute-mark').innerHTML = [
            `<line stroke="${color || gtfs.color}" stroke-width="10" x1="12" y1="${offsets[0]}" x2="12" y2="${offsets[offsets.length - 1]}" stroke-linecap="round" />`,
        ].concat(offsets.map(offset =>
            `<circle cx="12" cy="${offset}" r="3" fill="#ffffff" />`
        )).join('');

        (function repeat() {
            const height = bodyElement.getBoundingClientRect().height,
                nextIndex = bus.sectionIndex + bus.sectionLength,
                curr = offsets[Math.max(0, nextIndex - 1)],
                next = offsets[nextIndex],
                y = lerp(curr, next, bus._t),
                p = performance.now() % 1500 / 1500;

            container.querySelector('#bus-mark').innerHTML =
                `<circle cx="22" cy="${y}" r="${7 + p * 15}" fill="#ffffff" opacity="${1 - p}" />` +
                `<circle cx="22" cy="${y}" r="7" fill="#ffffff" />`;
            if (me._scrollTop === undefined || me._scrollTop === bodyElement.scrollTop) {
                me._scrollTop = bodyElement.scrollTop = Math.round(y - height / 2 + 4);
            }
            if (me._container) {
                requestAnimationFrame(repeat);
            }
        })();

        return me;
    }

    updateHeader() {
        const me = this,
            map = me._map,
            bus = me._options.object,
            gtfs = map.gtfs.get(bus.gtfsId),
            {route, headsigns} = bus.trip,
            routeInfo = gtfs.routeLookup.get(route),
            {shortName, longName, color, textColor} = routeInfo,
            labelStyle = [
                textColor ? `color: ${textColor};` : 'color: #FFFFFF;',
                color ? `background-color: ${color};` : ''
            ].join(' ');

        this.setTitle([
            '<div class="desc-header">',
            `<div style="background-color: ${color || gtfs.color};"></div>`,
            '<div><div class="desc-first-row">',
            shortName ? `<span class="bus-route-label" style="${labelStyle}">Bus ${shortName}</span> ` : '',
            bus.stop !== undefined ? '<span class="realtime-icon"></span>' : '',
            '</div><div class="desc-second-row">',
            headsigns && headsigns.length > 0 ? headsigns[headsigns.length === 1 ? 0 : bus.sectionIndex] : (longName || ''),
            '</div></div></div>'
        ].join(''));
    }

    reset() {
        delete this._scrollTop;
    }

}
