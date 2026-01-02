#!/usr/bin/env node

/**
 * Convert Singapore MRT/LRT station data to stations.json format
 *
 * Expected output format (matching Tokyo structure):
 * [{
 *   "id": "SMRT.NSL.CityHall",
 *   "railway": "SMRT.NSL",
 *   "coord": [103.8519, 1.2929],
 *   "title": {
 *     "en": "City Hall",
 *     "zh-Hans": "政府大厦",
 *     "zh-Hant": "政府大廈",
 *     "ms": "Dewan Bandaraya"
 *   }
 * }]
 */

const fs = require('fs');
const path = require('path');

// MRT/LRT Lines configuration
const MRT_LINES = {
    // North South Line
    'NS': { id: 'SMRT.NSL', operator: 'SMRT', color: '#D42E12', name: { en: 'North South Line', 'zh-Hans': '南北线', 'zh-Hant': '南北線', ms: 'Laluan Utara Selatan' }},
    // East West Line
    'EW': { id: 'SMRT.EWL', operator: 'SMRT', color: '#009645', name: { en: 'East West Line', 'zh-Hans': '东西线', 'zh-Hant': '東西線', ms: 'Laluan Timur Barat' }},
    'CG': { id: 'SMRT.EWL', operator: 'SMRT', color: '#009645', name: { en: 'East West Line (Changi)', 'zh-Hans': '东西线', 'zh-Hant': '東西線', ms: 'Laluan Timur Barat' }},
    // Circle Line
    'CC': { id: 'SMRT.CCL', operator: 'SMRT', color: '#FA9E0D', name: { en: 'Circle Line', 'zh-Hans': '环线', 'zh-Hant': '環線', ms: 'Laluan Lingkaran' }},
    'CE': { id: 'SMRT.CCL', operator: 'SMRT', color: '#FA9E0D', name: { en: 'Circle Line Extension', 'zh-Hans': '环线', 'zh-Hant': '環線', ms: 'Laluan Lingkaran' }},
    // North East Line
    'NE': { id: 'SBS.NEL', operator: 'SBS', color: '#9900AA', name: { en: 'North East Line', 'zh-Hans': '东北线', 'zh-Hant': '東北線', ms: 'Laluan Timur Laut' }},
    // Downtown Line
    'DT': { id: 'SBS.DTL', operator: 'SBS', color: '#005EC4', name: { en: 'Downtown Line', 'zh-Hans': '滨海市区线', 'zh-Hant': '濱海市區線', ms: 'Laluan Pusat Bandar' }},
    // Thomson-East Coast Line
    'TE': { id: 'SMRT.TEL', operator: 'SMRT', color: '#9D5B25', name: { en: 'Thomson-East Coast Line', 'zh-Hans': '汤申－东海岸线', 'zh-Hant': '湯申－東海岸線', ms: 'Laluan Thomson-Pantai Timur' }},
    // Bukit Panjang LRT
    'BP': { id: 'SMRT.BPLRT', operator: 'SMRT', color: '#748477', name: { en: 'Bukit Panjang LRT', 'zh-Hans': '武吉班让轻轨', 'zh-Hant': '武吉班讓輕軌', ms: 'LRT Bukit Panjang' }},
    // Sengkang LRT
    'SE': { id: 'SBS.SKLRT', operator: 'SBS', color: '#748477', name: { en: 'Sengkang LRT (East Loop)', 'zh-Hans': '盛港轻轨', 'zh-Hant': '盛港輕軌', ms: 'LRT Sengkang' }},
    'SW': { id: 'SBS.SKLRT', operator: 'SBS', color: '#748477', name: { en: 'Sengkang LRT (West Loop)', 'zh-Hans': '盛港轻轨', 'zh-Hant': '盛港輕軌', ms: 'LRT Sengkang' }},
    // Punggol LRT
    'PE': { id: 'SBS.PGLRT', operator: 'SBS', color: '#748477', name: { en: 'Punggol LRT (East Loop)', 'zh-Hans': '榜鹅轻轨', 'zh-Hant': '榜鵝輕軌', ms: 'LRT Punggol' }},
    'PW': { id: 'SBS.PGLRT', operator: 'SBS', color: '#748477', name: { en: 'Punggol LRT (West Loop)', 'zh-Hans': '榜鹅轻轨', 'zh-Hant': '榜鵝輕軌', ms: 'LRT Punggol' }}
};

// Manual station data (you'll expand this with all stations)
// Source: https://en.wikipedia.org/wiki/List_of_Singapore_MRT_stations
const STATION_DATA = [
    // North South Line
    { code: 'NS1', name: 'Jurong East', nameCN: '裕廊东', coord: [103.7423, 1.3330] },
    { code: 'NS2', name: 'Bukit Batok', nameCN: '武吉巴督', coord: [103.7496, 1.3490] },
    { code: 'NS3', name: 'Bukit Gombak', nameCN: '武吉甘柏', coord: [103.7518, 1.3586] },
    { code: 'NS4', name: 'Choa Chu Kang', nameCN: '蔡厝港', coord: [103.7443, 1.3854] },
    { code: 'NS5', name: 'Yew Tee', nameCN: '油池', coord: [103.7472, 1.3973] },
    { code: 'NS7', name: 'Kranji', nameCN: '克兰芝', coord: [103.7620, 1.4250] },
    { code: 'NS8', name: 'Marsiling', nameCN: '马西岭', coord: [103.7739, 1.4326] },
    { code: 'NS9', name: 'Woodlands', nameCN: '兀兰', coord: [103.7865, 1.4370] },
    { code: 'NS10', name: 'Admiralty', nameCN: '海军部', coord: [103.8009, 1.4406] },
    { code: 'NS11', name: 'Sembawang', nameCN: '三巴旺', coord: [103.8202, 1.4491] },
    { code: 'NS13', name: 'Yishun', nameCN: '义顺', coord: [103.8350, 1.4297] },
    { code: 'NS14', name: 'Khatib', nameCN: '卡迪', coord: [103.8329, 1.4172] },
    { code: 'NS15', name: 'Yio Chu Kang', nameCN: '杨厝港', coord: [103.8447, 1.3818] },
    { code: 'NS16', name: 'Ang Mo Kio', nameCN: '宏茂桥', coord: [103.8495, 1.3700] },
    { code: 'NS17', name: 'Bishan', nameCN: '碧山', coord: [103.8484, 1.3510] },
    { code: 'NS18', name: 'Braddell', nameCN: '布莱德', coord: [103.8467, 1.3406] },
    { code: 'NS19', name: 'Toa Payoh', nameCN: '大巴窑', coord: [103.8473, 1.3327] },
    { code: 'NS20', name: 'Novena', nameCN: '诺维娜', coord: [103.8437, 1.3204] },
    { code: 'NS21', name: 'Newton', nameCN: '纽顿', coord: [103.8383, 1.3130] },
    { code: 'NS22', name: 'Orchard', nameCN: '乌节', coord: [103.8320, 1.3041] },
    { code: 'NS23', name: 'Somerset', nameCN: '索美塞', coord: [103.8390, 1.3003] },
    { code: 'NS24', name: 'Dhoby Ghaut', nameCN: '多美歌', coord: [103.8456, 1.2988] },
    { code: 'NS25', name: 'City Hall', nameCN: '政府大厦', coord: [103.8519, 1.2929] },
    { code: 'NS26', name: 'Raffles Place', nameCN: '莱佛士坊', coord: [103.8513, 1.2837] },
    { code: 'NS27', name: 'Marina Bay', nameCN: '滨海湾', coord: [103.8545, 1.2762] },
    { code: 'NS28', name: 'Marina South Pier', nameCN: '滨海南码头', coord: [103.8630, 1.2712] },

    // East West Line
    { code: 'EW1', name: 'Pasir Ris', nameCN: '巴西立', coord: [103.9493, 1.3729] },
    { code: 'EW2', name: 'Tampines', nameCN: '淡滨尼', coord: [103.9453, 1.3538] },
    { code: 'EW3', name: 'Simei', nameCN: '四美', coord: [103.9532, 1.3434] },
    { code: 'EW4', name: 'Tanah Merah', nameCN: '丹那美拉', coord: [103.9464, 1.3276] },
    { code: 'EW5', name: 'Bedok', nameCN: '勿洛', coord: [103.9300, 1.3240] },
    { code: 'EW6', name: 'Kembangan', nameCN: '景万岸', coord: [103.9127, 1.3210] },
    { code: 'EW7', name: 'Eunos', nameCN: '友诺士', coord: [103.9033, 1.3197] },
    { code: 'EW8', name: 'Paya Lebar', nameCN: '巴耶利峇', coord: [103.8926, 1.3177] },
    { code: 'EW9', name: 'Aljunied', nameCN: '阿裕尼', coord: [103.8829, 1.3164] },
    { code: 'EW10', name: 'Kallang', nameCN: '加冷', coord: [103.8714, 1.3115] },
    { code: 'EW11', name: 'Lavender', nameCN: '劳明达', coord: [103.8631, 1.3074] },
    { code: 'EW12', name: 'Bugis', nameCN: '武吉士', coord: [103.8556, 1.3004] },
    { code: 'EW13', name: 'City Hall', nameCN: '政府大厦', coord: [103.8519, 1.2929] },
    { code: 'EW14', name: 'Raffles Place', nameCN: '莱佛士坊', coord: [103.8513, 1.2837] },
    { code: 'EW15', name: 'Tanjong Pagar', nameCN: '丹戎巴葛', coord: [103.8457, 1.2764] },
    { code: 'EW16', name: 'Outram Park', nameCN: '欧南园', coord: [103.8395, 1.2801] },
    { code: 'EW17', name: 'Tiong Bahru', nameCN: '中峇鲁', coord: [103.8268, 1.2861] },
    { code: 'EW18', name: 'Redhill', nameCN: '红山', coord: [103.8167, 1.2896] },
    { code: 'EW19', name: 'Queenstown', nameCN: '女皇镇', coord: [103.8060, 1.2945] },
    { code: 'EW20', name: 'Commonwealth', nameCN: '联邦', coord: [103.7976, 1.3025] },
    { code: 'EW21', name: 'Buona Vista', nameCN: '波那维斯达', coord: [103.7906, 1.3070] },
    { code: 'EW22', name: 'Dover', nameCN: 'Dover', coord: [103.7785, 1.3118] },
    { code: 'EW23', name: 'Clementi', nameCN: '金文泰', coord: [103.7652, 1.3152] },
    { code: 'EW24', name: 'Jurong East', nameCN: '裕廊东', coord: [103.7423, 1.3330] },
    { code: 'EW25', name: 'Chinese Garden', nameCN: '裕华园', coord: [103.7325, 1.3423] },
    { code: 'EW26', name: 'Lakeside', nameCN: '湖畔', coord: [103.7210, 1.3444] },
    { code: 'EW27', name: 'Boon Lay', nameCN: '文礼', coord: [103.7057, 1.3389] },
    { code: 'EW28', name: 'Pioneer', nameCN: '先驱', coord: [103.6974, 1.3376] },
    { code: 'EW29', name: 'Joo Koon', nameCN: '裕群', coord: [103.6781, 1.3276] },
    { code: 'EW30', name: 'Gul Circle', nameCN: '卡尔圈', coord: [103.6604, 1.3193] },
    { code: 'EW31', name: 'Tuas Crescent', nameCN: '大士新月', coord: [103.6489, 1.3208] },
    { code: 'EW32', name: 'Tuas West Road', nameCN: '大士西路', coord: [103.6395, 1.3299] },
    { code: 'EW33', name: 'Tuas Link', nameCN: '大士连路', coord: [103.6367, 1.3403] },

    // Circle Line (sample - add all)
    { code: 'CC1', name: 'Dhoby Ghaut', nameCN: '多美歌', coord: [103.8456, 1.2988] },
    { code: 'CC2', name: 'Bras Basah', nameCN: '百胜', coord: [103.8507, 1.2970] },
    { code: 'CC3', name: 'Esplanade', nameCN: '宝门廊', coord: [103.8556, 1.2935] },
    { code: 'CC4', name: 'Promenade', nameCN: '宝龙坊', coord: [103.8610, 1.2931] },

    // Add more stations as needed...
];

/**
 * Convert station code to railway ID
 */
function getLineInfo(stationCode) {
    const linePrefix = stationCode.replace(/\d+/g, '');
    return MRT_LINES[linePrefix] || { id: 'Unknown', operator: 'Unknown' };
}

/**
 * Convert station name to various formats
 */
function createStationId(stationCode, stationName) {
    const lineInfo = getLineInfo(stationCode);
    const safeName = stationName.replace(/\s+/g, '');
    return `${lineInfo.id}.${safeName}`;
}

/**
 * Main conversion function
 */
function convertStations() {
    console.log('Converting station data to stations.json format...\n');

    const stations = STATION_DATA.map(station => {
        const lineInfo = getLineInfo(station.code);
        const stationId = createStationId(station.code, station.name);

        return {
            id: stationId,
            railway: lineInfo.id,
            coord: station.coord,
            title: {
                en: station.name,
                'zh-Hans': station.nameCN,
                'zh-Hant': station.nameCN, // For now, use same as simplified
                ms: station.name // Default to English, translate manually later
            },
            // Optional: add station code for reference
            code: station.code
        };
    });

    // Sort by railway and then by station code
    stations.sort((a, b) => {
        if (a.railway !== b.railway) {
            return a.railway.localeCompare(b.railway);
        }
        return a.code.localeCompare(b.code);
    });

    return stations;
}

/**
 * Save to file
 */
function saveStations(stations) {
    const outputDir = path.join(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'stations.json');
    fs.writeFileSync(outputPath, JSON.stringify(stations, null, '\t'));

    console.log(`✓ Saved ${stations.length} stations to ${outputPath}`);
    console.log(`\nSample output:`);
    console.log(JSON.stringify(stations.slice(0, 2), null, 2));
}

// Run conversion
const stations = convertStations();
saveStations(stations);
