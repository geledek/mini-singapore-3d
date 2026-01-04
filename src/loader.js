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
        featureCollection: data[3],
        railDirectionData: data[4],
        trainTypeData: data[5],
        trainVehicleData: data[6],
        operatorData: data[7],
        airportData: data[8],
        flightStatusData: data[9],
        poiData: data[10],
        timetableData: [].concat(...data[11])
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
 * @returns {Object} Loaded data
 */
export function loadDynamicFlightData() {
    // eslint-disable-next-line no-warning-comments
    // TODO: Implement Singapore flight data
    // Singapore's Changi Airport flight data would need to come from a different source
    // For now, return empty data to prevent undefined URL errors
    return Promise.resolve({
        atisData: [],
        flightData: []
    });
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
