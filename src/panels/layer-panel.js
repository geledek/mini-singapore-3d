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
            railways = me._options.railways || [];

        const layersHTML = layers.length > 0 ? [
            `<div class="layer-section-title">${map.dict['layers'] || 'Layers'}</div>`,
            ...layers.map(layer => [
                `<div id="${layer.getId()}-layer" class="layer-row">`,
                '<div class="layer-icon"></div>',
                `<div>${layer.getName(map.lang)}</div>`,
                '</div>'
            ].join(''))
        ].join('') : '';

        const railwaysHTML = railways.length > 0 ? [
            '<div class="layer-section-title">MRT &amp; LRT Lines</div>',
            ...railways.map(railway => {
                const name = railway.title ? (railway.title[map.lang] || railway.title['en'] || railway.id) : railway.id;
                return [
                    `<div id="railway-toggle-${railway.id.replace(/\./g, '-')}" class="railway-toggle-row railway-toggle-enabled">`,
                    `<div class="railway-color-swatch" style="background:${railway.color}"></div>`,
                    `<div class="railway-toggle-name">${name}</div>`,
                    '</div>'
                ].join('');
            })
        ].join('') : '';

        const busHTML = [
            '<div class="layer-section-title">Bus</div>',
            '<div id="bus-lines-toggle" class="railway-toggle-row">',
            '<div class="railway-color-swatch" style="background:#888888"></div>',
            '<div class="railway-toggle-name">Bus Lines</div>',
            '</div>'
        ].join('');

        super.addTo(map)
            .setTitle(map.dict['layers'])
            .setHTML(layersHTML + railwaysHTML + busHTML);

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

        // Wire up railway toggles
        for (const railway of railways) {
            const safeId = railway.id.replace(/\./g, '-'),
                row = me._container.querySelector(`#railway-toggle-${safeId}`);

            if (!row) {
                continue;
            }

            let visible = true;

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
