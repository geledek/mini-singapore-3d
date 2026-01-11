import {createElement} from '../helpers/helpers';

const LANGUAGE_NAMES = {
    'en': 'EN',
    'zh-Hans': '简体',
    'zh-Hant': '繁體',
    'ms': 'BM',
    'ta': 'தமிழ்'
};

export default class {

    constructor(options) {
        this._lang = options.lang || 'en';
        this._langs = options.langs || ['en', 'zh-Hans', 'zh-Hant', 'ms', 'ta'];
    }

    getDefaultPosition() {
        return 'top-right';
    }

    onAdd(map) {
        const me = this;

        me._map = map;

        me._container = createElement('div', {
            className: 'mapboxgl-ctrl mapboxgl-ctrl-group'
        });

        // Create button showing current language
        me._button = createElement('button', {
            className: 'language-ctrl-button',
            type: 'button',
            title: 'Change Language',
            onclick: () => me._toggleDropdown()
        }, me._container);

        me._buttonIcon = createElement('span', {
            className: 'mapboxgl-ctrl-icon',
            textContent: LANGUAGE_NAMES[me._lang] || 'EN'
        }, me._button);

        // For Firefox
        me._button.setAttribute('aria-label', 'Change Language');

        // Create dropdown menu
        me._dropdown = createElement('div', {
            className: 'language-ctrl-dropdown',
            style: 'display: none;'
        }, me._container);

        // Add language options
        me._langs.forEach(lang => {
            const option = createElement('button', {
                className: `language-ctrl-option${lang === me._lang ? ' active' : ''}`,
                type: 'button',
                textContent: LANGUAGE_NAMES[lang] || lang,
                onclick: () => me._selectLanguage(lang)
            }, me._dropdown);

            option.setAttribute('data-lang', lang);
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', me._outsideClickHandler = (e) => {
            if (!me._container.contains(e.target)) {
                me._hideDropdown();
            }
        });

        return me._container;
    }

    onRemove() {
        const me = this,
            container = me._container;

        if (me._outsideClickHandler) {
            document.removeEventListener('click', me._outsideClickHandler);
        }

        container.parentNode.removeChild(container);
        delete me._map;
    }

    _toggleDropdown() {
        const me = this;

        if (me._dropdown.style.display === 'none') {
            me._showDropdown();
        } else {
            me._hideDropdown();
        }
    }

    _showDropdown() {
        const me = this;

        me._dropdown.style.display = 'block';
        me._button.classList.add('active');
    }

    _hideDropdown() {
        const me = this;

        me._dropdown.style.display = 'none';
        me._button.classList.remove('active');
    }

    _selectLanguage(lang) {
        const me = this;

        if (lang === me._lang) {
            me._hideDropdown();
            return;
        }

        // Update URL with new language parameter and reload
        const url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.location.href = url.toString();
    }

}
