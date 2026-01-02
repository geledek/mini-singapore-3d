const configs = {

    // Standing duration at origin and destination in milliseconds
    standingDuration: 60000,

    // Minimum standing duration in milliseconds
    minStandingDuration: 30000,

    // Minimum bus standing duration in milliseconds
    minBusStandingDuration: 15000,

    // Interval of refreshing object positions in milliseconds
    refreshInterval: 60000,

    // All object positions will be refreshed if the screen has been inactive for this duration
    refreshTimeout: 10000,

    // Interval of checking train and bus positions based on real-time data in milliseconds
    realtimeCheckInterval: 15000,

    // Maximum train speed in km/h
    maxSpeedKMPH: 80,

    // Train acceleration in km/h/s
    accelerationKMPHPS: 3,

    // Maximum train speed in km/ms
    get maxSpeed() {
        return configs.maxSpeedKMPH / 3600000;
    },

    // Train acceleration in km/ms^2
    get acceleration() {
        return configs.accelerationKMPHPS / 3600000000;
    },

    // Time required to reach maximum train speed in milliseconds
    get maxAccelerationTime() {
        return configs.maxSpeed / configs.acceleration;
    },

    // Distance required to reach maximum train speed in kilometers
    get maxAccDistance() {
        return configs.maxAccelerationTime * configs.maxSpeed / 2;
    },

    // Maximum flight speed in km/h
    maxFlightSpeedKMPH: 500,

    // Flight acceleration in km/h/s
    flightAccelerationKMPHPS: 12,

    // Maximum flight speed in km/ms
    get maxFlightSpeed() {
        return configs.maxFlightSpeedKMPH / 3600000;
    },

    // Flight acceleration in km/ms^2
    get flightAcceleration() {
        return configs.flightAccelerationKMPHPS / 3600000000;
    },

    // Maximum bus speed in km/h
    maxBusSpeedKMPH: 30,

    // Bus acceleration in km/h/s
    busAccelerationKMPHPS: 3,

    // Maximum bus speed in km/ms
    get maxBusSpeed() {
        return configs.maxBusSpeedKMPH / 3600000;
    },

    // Bus acceleration in km/ms^2
    get busAcceleration() {
        return configs.busAccelerationKMPHPS / 3600000000;
    },

    // Time required to reach maximum bus speed in milliseconds
    get maxBusAccelerationTime() {
        return configs.maxBusSpeed / configs.busAcceleration;
    },

    // Distance required to reach maximum bus speed in kilometers
    get maxBusAccDistance() {
        return configs.maxBusAccelerationTime * configs.maxBusSpeed / 2;
    },

    // Delay in milliseconds for minimizing precision error
    minDelay: 25000,

    // Minimum flight interval in milliseconds
    minFlightInterval: 90000,

    // Time allotted for transitions to complete
    transitionDuration: 300,

    // Fade duration when an object is added or removed
    fadeDuration: 1000,

    // Origin of coordinates (Singapore City Hall MRT)
    defaultCenter: [103.8519, 1.2929],

    // Default zoom level (higher for smaller Singapore area)
    defaultZoom: 12,

    // Default bearing (rotation) of the map
    defaultBearing: 0,

    // Default pitch in degrees
    defaultPitch: 60,

    // Default frame rate for train and aircraft animations in the Eco mode
    defaultEcoFrameRate: 1,

    // Default view mode
    defaultViewMode: 'ground',

    // Default tracking mode
    defaultTrackingMode: 'position',

    // Default clock mode
    defaultClockMode: 'realtime',

    // Default clock mode
    defaultEcoMode: 'normal',

    // API URL - Singapore LTA DataMall
    apiUrl: {

        // LTA DataMall base URL
        lta: 'http://datamall2.mytransport.sg/ltaodataservice/',

        // LTA DataMall API Key
        ltaAccountKey: '+Z3IvSNwTlmKVY92BS4/nQ=='

    },

    // Bus arrival URL (LTA DataMall)
    busArrivalUrl: 'http://datamall2.mytransport.sg/ltaodataservice/BusArrivalv2',

    // Train service alerts URL (LTA DataMall)
    trainAlertUrl: 'http://datamall2.mytransport.sg/ltaodataservice/TrainServiceAlerts',

    // Passenger volume URL (LTA DataMall)
    passengerVolumeUrl: 'http://datamall2.mytransport.sg/ltaodataservice/PCDRealTime',

    // TODO: Set up your own backend proxy server for data aggregation
    // Backend proxy URL (to be implemented)
    proxyUrl: 'http://localhost:3000/api',

    // Default data URL (TODO: Replace with your own CDN after building data)
    dataUrl: './data',

    // Default data sources
    dataSources: [],

    // Route search URL (TODO: Implement Singapore route search)
    searchUrl: null,

    // Timestamp when the static data was last updated
    lastStaticUpdate: '2026-01-01 00:00:00',

    // String to show in an Mapbox's AttributionControl
    customAttribution: '<a href="https://github.com/nagix/mini-tokyo-3d">Based on Mini Tokyo 3D by Akihiko Kusanagi</a> | <a href="https://datamall.lta.gov.sg">LTA DataMall</a>',

    // Copyright string
    copyright: '© 2026 Mini Singapore 3D | Data © LTA Singapore',

    // Share URL (TODO: Update with your deployment URL)
    shareUrl: 'http://localhost:8080',

    // Supported events
    events: [
        'boxzoomcancel',
        'boxzoomend',
        'boxzoomstart',
        'click',
        'contextmenu',
        'dblclick',
        'drag',
        'dragend',
        'dragstart',
        'error',
        'load',
        'mousedown',
        'mousemove',
        'mouseout',
        'mouseover',
        'mouseup',
        'move',
        'moveend',
        'movestart',
        'pitch',
        'pitchend',
        'pitchstart',
        'resize',
        'rotate',
        'rotateend',
        'rotatestart',
        'touchcancel',
        'touchend',
        'touchmove',
        'touchstart',
        'wheel',
        'zoom',
        'zoomend',
        'zoomstart'
    ],

    // Supported languages (Singapore focus: English, Chinese, Malay, Tamil)
    langs: ['en', 'zh-Hans', 'zh-Hant', 'ms', 'ta'],

    // Mapbox access token
    mapboxAccessToken: 'pk.eyJ1IjoiZ2VsZWRlayIsImEiOiJjbWp2Z2kxeGs1YXowM2RvdDAwZzA5eDdmIn0.cvxqYNPcROKg8kqsH7nNrQ'

};

export default configs;
