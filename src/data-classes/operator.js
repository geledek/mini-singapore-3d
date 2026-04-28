export default class {

    constructor(params) {
        const me = this;

        /**
         * Operator ID.
         * @type {string}
         */
        me.id = params.id;

        /**
         * Operator title.
         * @type {Object}
         */
        me.title = params.title;

        /**
         * Aircraft body color.
         * @type {string}
         */
        me.color = params.color;

        /**
         * Aircraft tail wing color.
         * @type {string}
         */
        me.tailcolor = params.tailcolor;

        /**
         * Aircraft body stripe color.
         * @type {string}
         */
        me.stripecolor = params.stripecolor;

        /**
         * Operator type ('railway', 'airline', 'authority').
         * @type {string}
         */
        me.type = params.type;
    }

}
