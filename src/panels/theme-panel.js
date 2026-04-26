import Panel from './panel';
import themes from '../themes';

export default class extends Panel {

    constructor(options) {
        super(Object.assign({
            className: 'theme-panel',
            modal: true
        }, options));
    }

    addTo(map) {
        const me = this,
            themeKeys = Object.keys(themes),
            currentTheme = map.currentTheme || 'dark-cinematic';

        const html = themeKeys.map(key => {
            const theme = themes[key],
                activeClass = key === currentTheme ? ' theme-row-active' : '',
                swatches = theme.previewColors.map(c =>
                    `<div class="theme-color-swatch" style="background:${c}"></div>`
                ).join('');

            return [
                `<div id="theme-${key}" class="theme-row${activeClass}">`,
                `<div class="theme-color-preview">${swatches}</div>`,
                '<div class="theme-info">',
                `<div class="theme-name">${theme.name}</div>`,
                `<div class="theme-description">${theme.description}</div>`,
                '</div>',
                '</div>'
            ].join('');
        }).join('');

        super.addTo(map)
            .setTitle(map.dict['select-theme'] || 'Theme')
            .setHTML(html);

        for (const key of themeKeys) {
            const row = me._container.querySelector(`#theme-${key}`);

            if (row) {
                row.addEventListener('click', () => {
                    // Update active state
                    const allRows = me._container.querySelectorAll('.theme-row');

                    for (const r of allRows) {
                        r.classList.remove('theme-row-active');
                    }
                    row.classList.add('theme-row-active');

                    map.setTheme(key);
                });
            }
        }

        return me;
    }

}
