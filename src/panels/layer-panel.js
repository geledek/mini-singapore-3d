import Panel from './panel';

export default class extends Panel {

    constructor(options) {
        super(Object.assign({
            className: 'layer-panel',
            modal: true
        }, options));
    }

    addTo(map) {
        const me = this,
            layers = me._options.layers,
            railways = me._options.railways || [],
            airlines = me._options.airlines || [];

        const layersHTML = layers.length > 0 ? [
            `<div class="layer-section-title">${map.dict['layers'] || 'Layers'}</div>`,
            ...layers.map(layer => [
                `<div id="${layer.getId()}-layer" class="layer-row">`,
                '<div class="layer-icon"></div>',
                `<div>${layer.getName(map.lang)}</div>`,
                '</div>'
            ].join(''))
        ].join('') : '';

        // MRT & LRT section with collapsible dropdown and toggle-all
        const railwaysHTML = railways.length > 0 ? [
            '<div class="layer-section-header" id="mrt-section-header">',
            '<div class="layer-section-title" style="margin:0;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">',
            '<span>MRT &amp; LRT Lines</span>',
            '<span id="mrt-section-arrow" class="section-arrow section-arrow-open">&#9662;</span>',
            '</div>',
            '</div>',
            '<div id="mrt-toggle-all" class="railway-toggle-row railway-toggle-enabled">',
            '<div class="railway-color-swatch" style="background:linear-gradient(135deg,#e52222,#009645,#fa9e0d,#9900aa,#0055b8,#9a6f39);border-radius:3px;"></div>',
            '<div class="railway-toggle-name" style="font-weight:bold;">Toggle All</div>',
            '</div>',
            '<div id="mrt-lines-list">',
            ...railways.map(railway => {
                const name = railway.title ? (railway.title[map.lang] || railway.title['en'] || railway.id) : railway.id;
                return [
                    `<div id="railway-toggle-${railway.id.replace(/\./g, '-')}" class="railway-toggle-row railway-toggle-enabled" style="padding-left:24px;">`,
                    `<div class="railway-color-swatch" style="background:${railway.color}"></div>`,
                    `<div class="railway-toggle-name">${name}</div>`,
                    '</div>'
                ].join('');
            }),
            '</div>'
        ].join('') : '';

        // Air Traffic section
        const airTrafficHTML = [
            '<div class="layer-section-header" id="air-traffic-section-header">',
            '<div class="layer-section-title" style="margin:0;cursor:pointer;display:flex;align-items:center;justify-content:space-between;">',
            '<span>Air Traffic</span>',
            '<span id="air-traffic-section-arrow" class="section-arrow section-arrow-open">&#9662;</span>',
            '</div>',
            '</div>',
            '<div id="air-traffic-toggle-all" class="railway-toggle-row railway-toggle-enabled">',
            '<div class="railway-color-swatch" style="background:linear-gradient(135deg,#00205B,#FFD100);border-radius:3px;"></div>',
            '<div class="railway-toggle-name" style="font-weight:bold;">Toggle All</div>',
            '</div>',
            '<div id="air-traffic-list">',
            ...airlines.map(airline => {
                const name = airline.title ? (airline.title[map.lang] || airline.title['en'] || airline.id) : airline.id;
                const color = airline.tailcolor || airline.color;
                return [
                    `<div id="airline-toggle-${airline.id}" class="railway-toggle-row railway-toggle-enabled" style="padding-left:24px;">`,
                    `<div class="railway-color-swatch" style="background:${color}"></div>`,
                    `<div class="railway-toggle-name">${name}</div>`,
                    '</div>'
                ].join('');
            }),
            '</div>'
        ].join('');

        const busHTML = [
            '<div class="layer-section-title">Bus</div>',
            '<div id="bus-lines-toggle" class="railway-toggle-row railway-toggle-enabled">',
            '<div class="railway-color-swatch" style="background:linear-gradient(135deg,#FFFFFF,#AAAAAA);border-radius:3px;"></div>',
            '<div class="railway-toggle-name">Bus Lines (Orchard Rd)</div>',
            '</div>'
        ].join('');

        super.addTo(map)
            .setTitle(map.dict['layers'])
            .setHTML(layersHTML + railwaysHTML + airTrafficHTML + busHTML);

        // Wire up existing plugin layer toggles
        for (const layer of layers) {
            const element = me._container.querySelector(`#${layer.getId()}-layer .layer-icon`),
                classList = element.classList;

            Object.assign(element.style, layer.getIconStyle());
            if (layer.isEnabled()) {
                classList.add('layer-icon-enabled');
            }

            element.addEventListener('click', () => {
                if (layer.isEnabled()) {
                    classList.remove('layer-icon-enabled');
                    layer.disable();
                } else {
                    classList.add('layer-icon-enabled');
                    layer.enable();
                }
            });
        }

        // Collapsible MRT section
        const sectionHeader = me._container.querySelector('#mrt-section-header');
        const linesList = me._container.querySelector('#mrt-lines-list');
        const arrow = me._container.querySelector('#mrt-section-arrow');

        if (sectionHeader && linesList) {
            sectionHeader.addEventListener('click', () => {
                const collapsed = linesList.style.display === 'none';

                linesList.style.display = collapsed ? '' : 'none';
                arrow.classList.toggle('section-arrow-open', collapsed);
            });
        }

        // Toggle-all button
        const toggleAllRow = me._container.querySelector('#mrt-toggle-all');
        let allVisible = map.hiddenRailways.size === 0;

        if (!allVisible) {
            toggleAllRow.classList.remove('railway-toggle-enabled');
        }

        if (toggleAllRow) {
            toggleAllRow.addEventListener('click', () => {
                allVisible = !allVisible;
                const changes = [];

                for (const railway of railways) {
                    const safeId = railway.id.replace(/\./g, '-'),
                        row = me._container.querySelector(`#railway-toggle-${safeId}`);

                    if (row) {
                        if (allVisible) {
                            row.classList.add('railway-toggle-enabled');
                        } else {
                            row.classList.remove('railway-toggle-enabled');
                        }
                    }
                    changes.push({id: railway.id, visible: allVisible});
                }
                map.toggleRailways(changes);
                if (allVisible) {
                    toggleAllRow.classList.add('railway-toggle-enabled');
                } else {
                    toggleAllRow.classList.remove('railway-toggle-enabled');
                }
            });
        }

        // Wire up individual railway toggles
        for (const railway of railways) {
            const safeId = railway.id.replace(/\./g, '-'),
                row = me._container.querySelector(`#railway-toggle-${safeId}`);

            if (!row) {
                continue;
            }

            let visible = !map.hiddenRailways.has(railway.id);

            if (!visible) {
                row.classList.remove('railway-toggle-enabled');
            }

            row.addEventListener('click', () => {
                visible = !visible;
                if (visible) {
                    row.classList.add('railway-toggle-enabled');
                } else {
                    row.classList.remove('railway-toggle-enabled');
                }
                map.toggleRailway(railway.id, visible);
            });
        }

        // Collapsible Air Traffic section
        const airHeader = me._container.querySelector('#air-traffic-section-header');
        const airList = me._container.querySelector('#air-traffic-list');
        const airArrow = me._container.querySelector('#air-traffic-section-arrow');

        if (airHeader && airList) {
            airHeader.addEventListener('click', () => {
                const collapsed = airList.style.display === 'none';

                airList.style.display = collapsed ? '' : 'none';
                airArrow.classList.toggle('section-arrow-open', collapsed);
            });
        }

        // Air Traffic toggle-all
        const airToggleAll = me._container.querySelector('#air-traffic-toggle-all');
        let airAllVisible = map.flightsEnabled;

        if (airToggleAll) {
            airToggleAll.addEventListener('click', () => {
                airAllVisible = !airAllVisible;

                if (airAllVisible) {
                    airToggleAll.classList.add('railway-toggle-enabled');
                    map.enableFlights();
                    map.hiddenAirlines.clear();
                } else {
                    airToggleAll.classList.remove('railway-toggle-enabled');
                    map.disableFlights();
                }

                // Update individual airline rows
                for (const airline of airlines) {
                    const row = me._container.querySelector(`#airline-toggle-${airline.id}`);

                    if (row) {
                        if (airAllVisible) {
                            row.classList.add('railway-toggle-enabled');
                        } else {
                            row.classList.remove('railway-toggle-enabled');
                        }
                    }
                }
            });
        }

        // Wire up individual airline toggles
        for (const airline of airlines) {
            const row = me._container.querySelector(`#airline-toggle-${airline.id}`);

            if (!row) {
                continue;
            }

            let visible = !map.hiddenAirlines.has(airline.id);

            row.addEventListener('click', () => {
                visible = !visible;
                if (visible) {
                    row.classList.add('railway-toggle-enabled');
                } else {
                    row.classList.remove('railway-toggle-enabled');
                }
                map.toggleAirline(airline.id, visible);
            });
        }

        // Wire up bus lines toggle
        const busRow = me._container.querySelector('#bus-lines-toggle');

        if (busRow) {
            busRow.addEventListener('click', () => {
                if (map.busLinesEnabled) {
                    busRow.classList.remove('railway-toggle-enabled');
                    map.disableBusLines();
                } else {
                    busRow.classList.add('railway-toggle-enabled');
                    map.enableBusLines();
                }
            });
        }

        return me;
    }

}
