import * as Comlink from 'comlink';
import geobuf from 'geobuf';
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import Pbf from 'pbf';
import configs from './configs';
import {isString, loadJSON, removePrefix} from './helpers/helpers';
import {decode} from './helpers/helpers-gtfs';

// Singapore MRT/LRT railways for real-time data
const RAILWAYS_FOR_TRAINS = {
    lta: [
        'SMRT.NSL',
        'SMRT.EWL',
        'SMRT.EWL.CAB',
        'SMRT.CCL',
        'SBS.NEL',
        'SBS.DTL',
        'SMRT.TEL',
        'SMRT.BPLRT',
        'SBS.SKLRT',
        'SBS.PGLRT'
    ]
};

// Singapore operators for service alerts
const OPERATORS_FOR_TRAININFORMATION = {
    lta: [
        'SMRT',
        'SBS',
        'LTA'
    ]
};

function getTimetableFileNames(clock) {
    const calendar = clock.getCalendar();

    switch (calendar) {
    case 'Saturday':
        return [
            'timetable-saturday.json.gz',
            'timetable-weekday.json.gz'
        ];
    case 'Holiday':
        return [
            'timetable-sunday-holiday.json.gz',
            'timetable-holiday.json.gz',
            'timetable-weekday.json.gz'
        ];
    default:
        return ['timetable-weekday.json.gz'];
    }
}

// Singapore trains are simpler - no special ID adjustments needed
function adjustTrainID(id) {
    return id;
}

/**
 * Load all the static data.
 * @param {string} dataUrl - Data URL
 * @param {string} lang - IETF language tag for dictionary
 * @param {Promise} clockPromise - Promise for the Clock object representing the
 *     current time
 * @returns {Object} Loaded data
 */
export function loadStaticData(dataUrl, lang, clockPromise) {
    return Promise.all([
        loadJSON(`assets/dictionary-${lang}.json`),
        ...[
            'railways.json.gz',
            'stations.json.gz',
            'exits.json.gz',
            'station-buildings.json.gz',
            'features.json.gz',
            'rail-directions.json.gz',
            'train-types.json.gz',
            'train-vehicles.json.gz',
            'operators.json.gz',
            'airports.json.gz',
            'flight-statuses.json.gz',
            'poi.json.gz'
        ].map(fileName => `${dataUrl}/${fileName}`).map(loadJSON),
        clockPromise.then(clock => {
            const fileNames = getTimetableFileNames(clock);
            return Promise.all(fileNames.map(fileName => `${dataUrl}/${fileName}`).map(loadJSON));
        })
    ]).then(data => ({
        dict: data[0],
        railwayData: data[1],
        stationData: data[2],
        exitData: data[3],
        stationBuildingsData: data[4],
        featureCollection: data[5],
        railDirectionData: data[6],
        trainTypeData: data[7],
        trainVehicleData: data[8],
        operatorData: data[9],
        airportData: data[10],
        flightStatusData: data[11],
        poiData: data[12],
        timetableData: [].concat(...data[13])
    }));
}

/**
 * Load the timetable data.
 * @param {string} dataUrl - Data URL
 * @param {Clock} clock - Clock object representing the current time
 * @returns {Object} Loaded timetable data
 */
export function loadTimetableData(dataUrl, clock) {
    const fileNames = getTimetableFileNames(clock);
    return Promise.all(fileNames.map(fileName => `${dataUrl}/${fileName}`).map(loadJSON)).then(data => [].concat(...data));
}

/**
 * Load the dynamic data for trains.
 * @param {Object} secrets - Secrets object
 * @returns {Object} Loaded data
 */
export function loadDynamicTrainData(secrets = {}) {
    const trainData = new Map(),
        trainInfoData = [],
        urls = [];

    for (const source of Object.keys(RAILWAYS_FOR_TRAINS)) {
        const url = configs.apiUrl[source],
            key = secrets[source];

        if (source === 'odpt' || source === 'challenge2025') {
            const railways = RAILWAYS_FOR_TRAINS[source]
                .map((railway) => `odpt.Railway:${railway}`)
                .join(',');

            urls.push(`${url}odpt:Train?odpt:railway=${railways}&acl:consumerKey=${key}`);
        }
        // eslint-disable-next-line no-warning-comments
        // TODO: Implement LTA real-time train position data
        // Singapore LTA DataMall doesn't provide real-time train position data like Tokyo's ODPT
    }

    // NOTE: tidUrl removed - was undefined, specific to Tokyo
    // urls.push(configs.tidUrl);

    for (const source of Object.keys(OPERATORS_FOR_TRAININFORMATION)) {
        const url = configs.apiUrl[source],
            key = secrets && secrets[source];

        if (source === 'odpt' || source === 'challenge2025') {
            const operators = OPERATORS_FOR_TRAININFORMATION[source]
                .map(operator => `odpt.Operator:${operator}`)
                .join(',');

            urls.push(`${url}odpt:TrainInformation?odpt:operator=${operators}&acl:consumerKey=${key}`);
        }
        // eslint-disable-next-line no-warning-comments
        // TODO: Implement LTA train service alerts
        // Use configs.trainAlertUrl for Singapore train service alerts
    }

    // NOTE: trainInfoUrl removed - was undefined, specific to Tokyo
    // urls.push(configs.trainInfoUrl);

    // If no URLs (e.g., LTA doesn't have real-time train position data), return empty data
    if (urls.length === 0) {
        return Promise.resolve({trainData, trainInfoData});
    }

    return Promise.all(urls.map(loadJSON)).then(data => {
        // Train data from ODPT and Challenge 2025
        const odptTrainData1 = data.shift() || [];
        const odptTrainData2 = data.shift() || [];
        for (const train of [...odptTrainData1, ...odptTrainData2]) {
            const trainType = removePrefix(train['odpt:trainType']),
                destinationStation = removePrefix(train['odpt:destinationStation']),
                id = adjustTrainID(removePrefix(train['owl:sameAs']));

            trainData.set(id, {
                id,
                o: removePrefix(train['odpt:operator']),
                r: removePrefix(train['odpt:railway']),
                y: trainType,
                n: train['odpt:trainNumber'],
                os: removePrefix(train['odpt:originStation']),
                d: removePrefix(train['odpt:railDirection']),
                ds: destinationStation,
                ts: removePrefix(train['odpt:toStation']),
                fs: removePrefix(train['odpt:fromStation']),
                delay: (train['odpt:delay'] || 0) * 1000,
                carComposition: train['odpt:carComposition'],
                date: train['dc:date'].replace(/([\d\-])T([\d:]+).*/, '$1 $2')
            });
        }

        // Train data from others
        const otherTrainData = data.shift() || [];
        for (const train of otherTrainData) {
            const id = train.id;

            if (trainData.has(id)) {
                Object.assign(trainData.get(id), train);
            } else {
                trainData.set(id, train);
            }
        }

        // Train information data from ODPT and Challenge 2025
        const odptTrainInfo1 = data.shift() || [];
        const odptTrainInfo2 = data.shift() || [];
        for (const trainInfo of [...odptTrainInfo1, ...odptTrainInfo2]) {
            trainInfoData.push({
                operator: removePrefix(trainInfo['odpt:operator']),
                railway: removePrefix(trainInfo['odpt:railway']),
                status: trainInfo['odpt:trainInformationStatus'],
                text: trainInfo['odpt:trainInformationText']
            });
        }

        // Train information data from others
        const otherTrainInfo = data.shift() || [];
        for (const trainInfo of otherTrainInfo) {
            trainInfoData.push(trainInfo);
        }

        return {
            trainData: Array.from(trainData.values()),
            trainInfoData
        };
    });
}

/**
 * Load the dynamic data for flights.
 * Attempts OpenSky Network API first (requires CORS proxy or server-side proxy).
 * Falls back to schedule-based simulation using typical SQ flight patterns.
 * @returns {Object} Loaded data with atisData and flightData
 */
export function loadDynamicFlightData() {
    const proxyUrl = configs.proxyUrl;

    // Try OpenSky Network if a proxy is configured
    if (proxyUrl && proxyUrl !== 'BUILD_PROXY_URL') {
        const bbox = 'lamin=1.1&lomin=103.5&lamax=1.6&lomax=104.2';
        const url = `${proxyUrl}https://opensky-network.org/api/states/all?${bbox}`;

        return fetch(url).then(response => {
            if (!response.ok) {
                throw new Error(`OpenSky API error: ${response.status}`);
            }
            return response.json();
        }).then(data => {
            const states = data.states || [];
            const sqStates = states.filter(s => s[1] && s[1].trim().startsWith('SIA'));
            return {
                atisData: {landing: ['20R', '20C'], departure: ['02L', '02C']},
                flightData: sqStates.map(transformOpenSkyState)
            };
        }).catch(() => generateSimulatedFlights());
    }

    // Fallback: generate schedule-based simulated SQ flights
    return Promise.resolve(generateSimulatedFlights());
}

/**
 * Transform an OpenSky state vector to internal flight data format.
 */
function transformOpenSkyState(s) {
    const callsign = s[1].trim(),
        onGround = s[8],
        verticalRate = s[11],
        longitude = s[5];

    const flightNum = callsign.replace('SIA', 'SQ');
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const flightRef = {
        id: callsign,
        n: [flightNum],
        a: 'SIA',
        o: 'opensky',
        date: Date.now()
    };

    if ((verticalRate !== null && verticalRate > 1) || (onGround && longitude > 103.98)) {
        flightRef.dp = 'WSSS';
        flightRef.sdt = timeStr;
    } else {
        flightRef.ar = 'WSSS';
        flightRef.sat = timeStr;
    }
    return flightRef;
}

/**
 * Generate simulated flights based on typical Changi Airport schedule.
 * Creates departures and arrivals for SQ and Scoot spread across the operating day.
 */
function generateSimulatedFlights() {
    const now = new Date(),
        hours = now.getHours(),
        minutes = now.getMinutes();

    // Typical SQ departures from Changi (rough hourly schedule)
    const sqDepartures = [
        {id: 'SIA321', n: ['SQ321'], dest: 'RJTT', hour: 0, min: 30},
        {id: 'SIA118', n: ['SQ118'], dest: 'RKSI', hour: 1, min: 0},
        {id: 'SIA502', n: ['SQ502'], dest: 'VTBS', hour: 2, min: 15},
        {id: 'SIA108', n: ['SQ108'], dest: 'WMKK', hour: 3, min: 30},
        {id: 'SIA956', n: ['SQ956'], dest: 'WIII', hour: 5, min: 0},
        {id: 'SIA910', n: ['SQ910'], dest: 'VHHH', hour: 6, min: 30},
        {id: 'SIA602', n: ['SQ602'], dest: 'VIDP', hour: 7, min: 0},
        {id: 'SIA368', n: ['SQ368'], dest: 'EDDF', hour: 7, min: 45},
        {id: 'SIA322', n: ['SQ322'], dest: 'EGLL', hour: 8, min: 30},
        {id: 'SIA308', n: ['SQ308'], dest: 'LFPG', hour: 9, min: 0},
        {id: 'SIA218', n: ['SQ218'], dest: 'YSSY', hour: 9, min: 30},
        {id: 'SIA226', n: ['SQ226'], dest: 'YMML', hour: 10, min: 0},
        {id: 'SIA12',  n: ['SQ12'],  dest: 'KLAX', hour: 10, min: 45},
        {id: 'SIA24',  n: ['SQ24'],  dest: 'KJFK', hour: 11, min: 30},
        {id: 'SIA836', n: ['SQ836'], dest: 'ZSSS', hour: 12, min: 0},
        {id: 'SIA406', n: ['SQ406'], dest: 'OMDB', hour: 13, min: 15},
        {id: 'SIA860', n: ['SQ860'], dest: 'RPLL', hour: 14, min: 30},
        {id: 'SIA712', n: ['SQ712'], dest: 'VABB', hour: 15, min: 0},
        {id: 'SIA638', n: ['SQ638'], dest: 'RJAA', hour: 16, min: 30},
        {id: 'SIA916', n: ['SQ916'], dest: 'VHHH', hour: 17, min: 30},
        {id: 'SIA504', n: ['SQ504'], dest: 'VTBS', hour: 18, min: 45},
        {id: 'SIA110', n: ['SQ110'], dest: 'WMKK', hour: 19, min: 30},
        {id: 'SIA326', n: ['SQ326'], dest: 'EGLL', hour: 21, min: 0},
        {id: 'SIA346', n: ['SQ346'], dest: 'RJTT', hour: 22, min: 30},
        {id: 'SIA958', n: ['SQ958'], dest: 'WIII', hour: 23, min: 0}
    ];

    // SQ arrivals
    const sqArrivals = [
        {id: 'SIA345', n: ['SQ345'], orig: 'RJTT', hour: 5, min: 30},
        {id: 'SIA117', n: ['SQ117'], orig: 'RKSI', hour: 6, min: 45},
        {id: 'SIA501', n: ['SQ501'], orig: 'VTBS', hour: 7, min: 30},
        {id: 'SIA107', n: ['SQ107'], orig: 'WMKK', hour: 8, min: 0},
        {id: 'SIA955', n: ['SQ955'], orig: 'WIII', hour: 9, min: 15},
        {id: 'SIA909', n: ['SQ909'], orig: 'VHHH', hour: 10, min: 0},
        {id: 'SIA321R', n: ['SQ322'], orig: 'RJTT', hour: 10, min: 30},
        {id: 'SIA217', n: ['SQ217'], orig: 'YSSY', hour: 11, min: 45},
        {id: 'SIA225', n: ['SQ225'], orig: 'YMML', hour: 12, min: 30},
        {id: 'SIA601', n: ['SQ601'], orig: 'VIDP', hour: 13, min: 0},
        {id: 'SIA323', n: ['SQ323'], orig: 'EGLL', hour: 14, min: 0},
        {id: 'SIA367', n: ['SQ367'], orig: 'EDDF', hour: 14, min: 45},
        {id: 'SIA307', n: ['SQ307'], orig: 'LFPG', hour: 15, min: 30},
        {id: 'SIA11',  n: ['SQ11'],  orig: 'KLAX', hour: 16, min: 0},
        {id: 'SIA23',  n: ['SQ23'],  orig: 'KJFK', hour: 17, min: 0},
        {id: 'SIA835', n: ['SQ835'], orig: 'ZSSS', hour: 18, min: 15},
        {id: 'SIA405', n: ['SQ405'], orig: 'OMDB', hour: 19, min: 30},
        {id: 'SIA859', n: ['SQ859'], orig: 'RPLL', hour: 20, min: 0},
        {id: 'SIA711', n: ['SQ711'], orig: 'VABB', hour: 21, min: 0},
        {id: 'SIA637', n: ['SQ637'], orig: 'RJAA', hour: 22, min: 0},
        {id: 'SIA915', n: ['SQ915'], orig: 'VHHH', hour: 23, min: 0},
        {id: 'SIA503', n: ['SQ503'], orig: 'VTBS', hour: 23, min: 45}
    ];

    // Scoot (TGW) departures
    const trDepartures = [
        {id: 'TGW101', n: ['TR101'], dest: 'VTBS', hour: 0, min: 45},
        {id: 'TGW502', n: ['TR502'], dest: 'RKSI', hour: 1, min: 30},
        {id: 'TGW606', n: ['TR606'], dest: 'RJTT', hour: 2, min: 45},
        {id: 'TGW868', n: ['TR868'], dest: 'ZSSS', hour: 4, min: 0},
        {id: 'TGW12',  n: ['TR12'],  dest: 'YSSY', hour: 5, min: 30},
        {id: 'TGW634', n: ['TR634'], dest: 'RPLL', hour: 6, min: 15},
        {id: 'TGW468', n: ['TR468'], dest: 'VHHH', hour: 7, min: 15},
        {id: 'TGW564', n: ['TR564'], dest: 'WIII', hour: 8, min: 0},
        {id: 'TGW992', n: ['TR992'], dest: 'WMKK', hour: 8, min: 45},
        {id: 'TGW102', n: ['TR102'], dest: 'VTBS', hour: 9, min: 20},
        {id: 'TGW710', n: ['TR710'], dest: 'VIDP', hour: 10, min: 15},
        {id: 'TGW150', n: ['TR150'], dest: 'RJAA', hour: 11, min: 0},
        {id: 'TGW504', n: ['TR504'], dest: 'RKSI', hour: 11, min: 45},
        {id: 'TGW870', n: ['TR870'], dest: 'ZSSS', hour: 12, min: 30},
        {id: 'TGW636', n: ['TR636'], dest: 'RPLL', hour: 13, min: 45},
        {id: 'TGW470', n: ['TR470'], dest: 'VHHH', hour: 14, min: 15},
        {id: 'TGW566', n: ['TR566'], dest: 'WIII', hour: 15, min: 30},
        {id: 'TGW994', n: ['TR994'], dest: 'WMKK', hour: 16, min: 0},
        {id: 'TGW104', n: ['TR104'], dest: 'VTBS', hour: 17, min: 0},
        {id: 'TGW608', n: ['TR608'], dest: 'RJTT', hour: 18, min: 0},
        {id: 'TGW14',  n: ['TR14'],  dest: 'YSSY', hour: 19, min: 15},
        {id: 'TGW506', n: ['TR506'], dest: 'RKSI', hour: 20, min: 30},
        {id: 'TGW106', n: ['TR106'], dest: 'VTBS', hour: 21, min: 30},
        {id: 'TGW872', n: ['TR872'], dest: 'ZSSS', hour: 22, min: 45},
        {id: 'TGW568', n: ['TR568'], dest: 'WIII', hour: 23, min: 30}
    ];

    // Scoot (TGW) arrivals
    const trArrivals = [
        {id: 'TGW100', n: ['TR100'], orig: 'VTBS', hour: 4, min: 30},
        {id: 'TGW501', n: ['TR501'], orig: 'RKSI', hour: 5, min: 45},
        {id: 'TGW605', n: ['TR605'], orig: 'RJTT', hour: 6, min: 30},
        {id: 'TGW867', n: ['TR867'], orig: 'ZSSS', hour: 7, min: 45},
        {id: 'TGW633', n: ['TR633'], orig: 'RPLL', hour: 8, min: 15},
        {id: 'TGW467', n: ['TR467'], orig: 'VHHH', hour: 9, min: 0},
        {id: 'TGW563', n: ['TR563'], orig: 'WIII', hour: 9, min: 45},
        {id: 'TGW991', n: ['TR991'], orig: 'WMKK', hour: 10, min: 30},
        {id: 'TGW11',  n: ['TR11'],  orig: 'YSSY', hour: 11, min: 15},
        {id: 'TGW103', n: ['TR103'], orig: 'VTBS', hour: 12, min: 0},
        {id: 'TGW709', n: ['TR709'], orig: 'VIDP', hour: 12, min: 45},
        {id: 'TGW149', n: ['TR149'], orig: 'RJAA', hour: 13, min: 30},
        {id: 'TGW503', n: ['TR503'], orig: 'RKSI', hour: 14, min: 30},
        {id: 'TGW869', n: ['TR869'], orig: 'ZSSS', hour: 15, min: 15},
        {id: 'TGW635', n: ['TR635'], orig: 'RPLL', hour: 16, min: 30},
        {id: 'TGW469', n: ['TR469'], orig: 'VHHH', hour: 17, min: 15},
        {id: 'TGW565', n: ['TR565'], orig: 'WIII', hour: 18, min: 30},
        {id: 'TGW993', n: ['TR993'], orig: 'WMKK', hour: 19, min: 0},
        {id: 'TGW105', n: ['TR105'], orig: 'VTBS', hour: 20, min: 15},
        {id: 'TGW607', n: ['TR607'], orig: 'RJTT', hour: 21, min: 30},
        {id: 'TGW505', n: ['TR505'], orig: 'RKSI', hour: 22, min: 15},
        {id: 'TGW871', n: ['TR871'], orig: 'ZSSS', hour: 23, min: 15}
    ];

    // Thai Airways (THA) - ~8 flights/day
    const thaDepartures = [
        {id: 'THA851', n: ['TG851'], dest: 'VTBS', hour: 0, min: 15},
        {id: 'THA403', n: ['TG403'], dest: 'VTBS', hour: 7, min: 50},
        {id: 'THA405', n: ['TG405'], dest: 'VTBS', hour: 13, min: 20},
        {id: 'THA407', n: ['TG407'], dest: 'VTBS', hour: 19, min: 10}
    ];
    const thaArrivals = [
        {id: 'THA402', n: ['TG402'], orig: 'VTBS', hour: 6, min: 45},
        {id: 'THA404', n: ['TG404'], orig: 'VTBS', hour: 12, min: 15},
        {id: 'THA406', n: ['TG406'], orig: 'VTBS', hour: 18, min: 5},
        {id: 'THA852', n: ['TG852'], orig: 'VTBS', hour: 23, min: 30}
    ];

    // ANA - All Nippon Airways (~6 flights/day)
    const anaDepartures = [
        {id: 'ANA842', n: ['NH842'], dest: 'RJTT', hour: 1, min: 10},
        {id: 'ANA804', n: ['NH804'], dest: 'RJAA', hour: 9, min: 40},
        {id: 'ANA844', n: ['NH844'], dest: 'RJTT', hour: 17, min: 20}
    ];
    const anaArrivals = [
        {id: 'ANA841', n: ['NH841'], orig: 'RJTT', hour: 7, min: 20},
        {id: 'ANA803', n: ['NH803'], orig: 'RJAA', hour: 15, min: 50},
        {id: 'ANA843', n: ['NH843'], orig: 'RJTT', hour: 23, min: 10}
    ];

    // Lufthansa (DLH) - ~4 flights/day
    const dlhDepartures = [
        {id: 'DLH779', n: ['LH779'], dest: 'EDDF', hour: 23, min: 20},
        {id: 'DLH783', n: ['LH783'], dest: 'EDDM', hour: 11, min: 30}
    ];
    const dlhArrivals = [
        {id: 'DLH778', n: ['LH778'], orig: 'EDDF', hour: 18, min: 40},
        {id: 'DLH782', n: ['LH782'], orig: 'EDDM', hour: 6, min: 50}
    ];

    // United Airlines (UAL) - ~4 flights/day
    const ualDepartures = [
        {id: 'UAL1', n: ['UA1'], dest: 'KLAX', hour: 9, min: 50},
        {id: 'UAL22', n: ['UA22'], dest: 'KSFO', hour: 1, min: 40}
    ];
    const ualArrivals = [
        {id: 'UAL2', n: ['UA2'], orig: 'KLAX', hour: 6, min: 10},
        {id: 'UAL21', n: ['UA21'], orig: 'KSFO', hour: 17, min: 40}
    ];

    // Air India (AIC) - ~6 flights/day
    const aicDepartures = [
        {id: 'AIC381', n: ['AI381'], dest: 'VIDP', hour: 8, min: 20},
        {id: 'AIC383', n: ['AI383'], dest: 'VABB', hour: 14, min: 40},
        {id: 'AIC385', n: ['AI385'], dest: 'VOBL', hour: 21, min: 10}
    ];
    const aicArrivals = [
        {id: 'AIC380', n: ['AI380'], orig: 'VIDP', hour: 5, min: 50},
        {id: 'AIC382', n: ['AI382'], orig: 'VABB', hour: 11, min: 30},
        {id: 'AIC384', n: ['AI384'], orig: 'VOBL', hour: 19, min: 50}
    ];

    // EVA Air (EVA) - ~6 flights/day
    const evaDepartures = [
        {id: 'EVA225', n: ['BR225'], dest: 'RCTP', hour: 8, min: 10},
        {id: 'EVA227', n: ['BR227'], dest: 'RCTP', hour: 14, min: 50},
        {id: 'EVA229', n: ['BR229'], dest: 'RCTP', hour: 21, min: 40}
    ];
    const evaArrivals = [
        {id: 'EVA226', n: ['BR226'], orig: 'RCTP', hour: 6, min: 0},
        {id: 'EVA228', n: ['BR228'], orig: 'RCTP', hour: 12, min: 30},
        {id: 'EVA230', n: ['BR230'], orig: 'RCTP', hour: 19, min: 20}
    ];

    // Air China (CCA) - ~6 flights/day
    const ccaDepartures = [
        {id: 'CCA769', n: ['CA769'], dest: 'ZBAA', hour: 8, min: 55},
        {id: 'CCA975', n: ['CA975'], dest: 'ZSSS', hour: 14, min: 10},
        {id: 'CCA771', n: ['CA771'], dest: 'ZBAA', hour: 20, min: 45}
    ];
    const ccaArrivals = [
        {id: 'CCA770', n: ['CA770'], orig: 'ZBAA', hour: 7, min: 10},
        {id: 'CCA976', n: ['CA976'], orig: 'ZSSS', hour: 12, min: 50},
        {id: 'CCA768', n: ['CA768'], orig: 'ZBAA', hour: 18, min: 30}
    ];

    // Asiana Airlines (AAR) - ~4 flights/day
    const aarDepartures = [
        {id: 'AAR741', n: ['OZ741'], dest: 'RKSI', hour: 1, min: 25},
        {id: 'AAR743', n: ['OZ743'], dest: 'RKSI', hour: 15, min: 55}
    ];
    const aarArrivals = [
        {id: 'AAR742', n: ['OZ742'], orig: 'RKSI', hour: 8, min: 40},
        {id: 'AAR744', n: ['OZ744'], orig: 'RKSI', hour: 22, min: 30}
    ];

    // Turkish Airlines (THY) - ~2 flights/day
    const thyDepartures = [
        {id: 'THY55', n: ['TK55'], dest: 'LTFM', hour: 23, min: 45}
    ];
    const thyArrivals = [
        {id: 'THY54', n: ['TK54'], orig: 'LTFM', hour: 17, min: 25}
    ];

    // Swiss (SWR) - ~2 flights/day
    const swrDepartures = [
        {id: 'SWR167', n: ['LX167'], dest: 'LSZH', hour: 23, min: 55}
    ];
    const swrArrivals = [
        {id: 'SWR166', n: ['LX166'], orig: 'LSZH', hour: 18, min: 50}
    ];

    // Air New Zealand (ANZ) - ~2 flights/day
    const anzDepartures = [
        {id: 'ANZ282', n: ['NZ282'], dest: 'NZAA', hour: 10, min: 30}
    ];
    const anzArrivals = [
        {id: 'ANZ281', n: ['NZ281'], orig: 'NZAA', hour: 5, min: 15}
    ];

    const flightData = [];

    // Helper to add flights within window
    const addFlights = (flights, airline, isDeparture) => {
        for (const f of flights) {
            const diff = (f.hour * 60 + f.min) - (hours * 60 + minutes);
            if (diff >= -30 && diff <= 90) {
                const timeStr = `${String(f.hour).padStart(2, '0')}:${String(f.min).padStart(2, '0')}`;
                const entry = {
                    id: f.id,
                    n: f.n,
                    a: airline,
                    o: 'schedule',
                    date: Date.now()
                };
                if (isDeparture) {
                    entry.dp = 'WSSS';
                    entry.ds = f.dest;
                    entry.sdt = timeStr;
                } else {
                    entry.ar = 'WSSS';
                    entry.or = f.orig;
                    entry.sat = timeStr;
                }
                flightData.push(entry);
            }
        }
    };

    addFlights(sqDepartures, 'SIA', true);
    addFlights(sqArrivals, 'SIA', false);
    addFlights(trDepartures, 'TGW', true);
    addFlights(trArrivals, 'TGW', false);
    addFlights(thaDepartures, 'THA', true);
    addFlights(thaArrivals, 'THA', false);
    addFlights(anaDepartures, 'ANA', true);
    addFlights(anaArrivals, 'ANA', false);
    addFlights(dlhDepartures, 'DLH', true);
    addFlights(dlhArrivals, 'DLH', false);
    addFlights(ualDepartures, 'UAL', true);
    addFlights(ualArrivals, 'UAL', false);
    addFlights(aicDepartures, 'AIC', true);
    addFlights(aicArrivals, 'AIC', false);
    addFlights(evaDepartures, 'EVA', true);
    addFlights(evaArrivals, 'EVA', false);
    addFlights(ccaDepartures, 'CCA', true);
    addFlights(ccaArrivals, 'CCA', false);
    addFlights(aarDepartures, 'AAR', true);
    addFlights(aarArrivals, 'AAR', false);
    addFlights(thyDepartures, 'THY', true);
    addFlights(thyArrivals, 'THY', false);
    addFlights(swrDepartures, 'SWR', true);
    addFlights(swrArrivals, 'SWR', false);
    addFlights(anzDepartures, 'ANZ', true);
    addFlights(anzArrivals, 'ANZ', false);

    return {
        atisData: {landing: ['20R', '20C'], departure: ['02L', '02C']},
        flightData
    };
}

export function loadBusData(source, clock, lang) {
    const workerUrl = URL.createObjectURL(new Blob([`WORKER_STRING`], {type: 'text/javascript'})),
        worker = new Worker(workerUrl),
        proxy = Comlink.wrap(worker),
        date = clock.getDate(),
        hours = date.getHours();

    if (hours < 3) {
        date.setHours(hours - 24);
    }

    const year = date.getFullYear(),
        month = `0${date.getMonth() + 1}`.slice(-2),
        day = `0${date.getDate()}`.slice(-2),
        dayOfWeek = date.getDay(),
        dateString = `${year}${month}${day}`,
        dayString = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][dayOfWeek];

    return new Promise(resolve => proxy.load(source, dateString, dayString, lang, Comlink.proxy(data => {
        proxy[Comlink.releaseProxy]();
        worker.terminate();
        resolve({
            featureCollection: geobuf.decode(new Pbf(data[0])),
            ...decode(new Pbf(data[1]))
        });
    })));
}

export function loadDynamicBusData(url) {
    return fetch(url)
        .then(response => response.arrayBuffer())
        .then(data => GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(data)));
}

export function updateOdptUrl(url, secrets) {
    if (!isString(url)) {
        return;
    }
    if (url.startsWith('https://api.odpt.org/') && !url.match(/acl:consumerKey/)) {
        return `${url}${url.match(/\?/) ? '&' : '?'}acl:consumerKey=${secrets.odpt}`;
    } else if (url.startsWith('https://api-challenge.odpt.org/') && !url.match(/acl:consumerKey/)) {
        return `${url}${url.match(/\?/) ? '&' : '?'}acl:consumerKey=${secrets.challenge2025}`;
    }
    return url;
}
