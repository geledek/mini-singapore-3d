export default class {

    constructor(params) {
        const me = this;

        /**
         * Exit ID.
         * @type {string}
         */
        me.id = params.id;

        /**
         * Station code this exit belongs to.
         * @type {string}
         */
        me.stationCode = params.stationCode;

        /**
         * Railway ID.
         * @type {string}
         */
        me.railway = params.railway;

        /**
         * Exit name/code (e.g., "A", "B", "1", "2").
         * @type {string}
         */
        me.name = params.name;

        /**
         * Exit coordinate. These coordinates use longitude, latitude coordinate order.
         * @type {Array<number>}
         */
        me.coord = params.coord;
    }

}
