#!/usr/bin/env node

/**
 * Convert Singapore MRT/LRT lines to railways.json format
 *
 * Expected output format (matching Tokyo structure):
 * [{
 *   "id": "SMRT.NSL",
 *   "title": {
 *     "en": "North South Line",
 *     "zh-Hans": "南北线",
 *     "zh-Hant": "南北線",
 *     "ms": "Laluan Utara Selatan"
 *   },
 *   "color": "#D42E12",
 *   "stations": ["SMRT.NSL.JurongEast", "SMRT.NSL.BukitBatok", ...]
 * }]
 */

const fs = require('fs');
const path = require('path');

// Singapore MRT/LRT Lines
const RAILWAYS = [
    {
        id: 'SMRT.NSL',
        title: {
            en: 'North South Line',
            'zh-Hans': '南北线',
            'zh-Hant': '南北線',
            ms: 'Laluan Utara Selatan',
            ta: 'வடக்கு தெற்கு பாதை'
        },
        color: '#D42E12', // Red
        operator: 'SMRT',
        type: 'heavy-rail',
        stations: [
            'SMRT.NSL.JurongEast',
            'SMRT.NSL.BukitBatok',
            'SMRT.NSL.BukitGombak',
            'SMRT.NSL.ChoaChuKang',
            'SMRT.NSL.YewTee',
            'SMRT.NSL.Kranji',
            'SMRT.NSL.Marsiling',
            'SMRT.NSL.Woodlands',
            'SMRT.NSL.Admiralty',
            'SMRT.NSL.Sembawang',
            'SMRT.NSL.Yishun',
            'SMRT.NSL.Khatib',
            'SMRT.NSL.YioChuKang',
            'SMRT.NSL.AngMoKio',
            'SMRT.NSL.Bishan',
            'SMRT.NSL.Braddell',
            'SMRT.NSL.ToaPayoh',
            'SMRT.NSL.Novena',
            'SMRT.NSL.Newton',
            'SMRT.NSL.Orchard',
            'SMRT.NSL.Somerset',
            'SMRT.NSL.DhobyGhaut',
            'SMRT.NSL.CityHall',
            'SMRT.NSL.RafflesPlace',
            'SMRT.NSL.MarinaBay',
            'SMRT.NSL.MarinaSouthPier'
        ]
    },
    {
        id: 'SMRT.EWL',
        title: {
            en: 'East West Line',
            'zh-Hans': '东西线',
            'zh-Hant': '東西線',
            ms: 'Laluan Timur Barat',
            ta: 'கிழக்கு மேற்கு பாதை'
        },
        color: '#009645', // Green
        operator: 'SMRT',
        type: 'heavy-rail',
        stations: [
            'SMRT.EWL.PasirRis',
            'SMRT.EWL.Tampines',
            'SMRT.EWL.Simei',
            'SMRT.EWL.TanahMerah',
            'SMRT.EWL.Bedok',
            'SMRT.EWL.Kembangan',
            'SMRT.EWL.Eunos',
            'SMRT.EWL.PayaLebar',
            'SMRT.EWL.Aljunied',
            'SMRT.EWL.Kallang',
            'SMRT.EWL.Lavender',
            'SMRT.EWL.Bugis',
            'SMRT.EWL.CityHall',
            'SMRT.EWL.RafflesPlace',
            'SMRT.EWL.TanjongPagar',
            'SMRT.EWL.OutramPark',
            'SMRT.EWL.TiongBahru',
            'SMRT.EWL.Redhill',
            'SMRT.EWL.Queenstown',
            'SMRT.EWL.Commonwealth',
            'SMRT.EWL.BuonaVista',
            'SMRT.EWL.Dover',
            'SMRT.EWL.Clementi',
            'SMRT.EWL.JurongEast',
            'SMRT.EWL.ChineseGarden',
            'SMRT.EWL.Lakeside',
            'SMRT.EWL.BoonLay',
            'SMRT.EWL.Pioneer',
            'SMRT.EWL.JooKoon',
            'SMRT.EWL.GulCircle',
            'SMRT.EWL.TuasCrescent',
            'SMRT.EWL.TuasWestRoad',
            'SMRT.EWL.TuasLink'
        ]
    },
    {
        id: 'SMRT.CCL',
        title: {
            en: 'Circle Line',
            'zh-Hans': '环线',
            'zh-Hant': '環線',
            ms: 'Laluan Lingkaran',
            ta: 'வட்ட பாதை'
        },
        color: '#FA9E0D', // Orange
        operator: 'SMRT',
        type: 'heavy-rail',
        stations: [
            'SMRT.CCL.DhobyGhaut',
            'SMRT.CCL.BrasBasah',
            'SMRT.CCL.Esplanade',
            'SMRT.CCL.Promenade',
            'SMRT.CCL.Nicoll Highway',
            'SMRT.CCL.Stadium',
            'SMRT.CCL.Mountbatten',
            'SMRT.CCL.Dakota',
            'SMRT.CCL.PayaLebar',
            'SMRT.CCL.MacPherson',
            'SMRT.CCL.TaiSeng',
            'SMRT.CCL.Bartley',
            'SMRT.CCL.Serangoon',
            'SMRT.CCL.Lorong Chuan',
            'SMRT.CCL.Bishan',
            'SMRT.CCL.Marymount',
            'SMRT.CCL.Caldecott',
            'SMRT.CCL.Botanic Gardens',
            'SMRT.CCL.Farrer Road',
            'SMRT.CCL.Holland Village',
            'SMRT.CCL.BuonaVista',
            'SMRT.CCL.one-north',
            'SMRT.CCL.Kent Ridge',
            'SMRT.CCL.Haw Par Villa',
            'SMRT.CCL.Pasir Panjang',
            'SMRT.CCL.Labrador Park',
            'SMRT.CCL.Telok Blangah',
            'SMRT.CCL.HarbourFront',
            'SMRT.CCL.Keppel',
            'SMRT.CCL.Cantonment',
            'SMRT.CCL.Prince Edward Road',
            'SMRT.CCL.Bugis',
            'SMRT.CCL.Nicoll Highway'
        ]
    },
    {
        id: 'SBS.NEL',
        title: {
            en: 'North East Line',
            'zh-Hans': '东北线',
            'zh-Hant': '東北線',
            ms: 'Laluan Timur Laut',
            ta: 'வடகிழக்கு பாதை'
        },
        color: '#9900AA', // Purple
        operator: 'SBS',
        type: 'heavy-rail',
        stations: [
            'SBS.NEL.HarbourFront',
            'SBS.NEL.OutramPark',
            'SBS.NEL.Chinatown',
            'SBS.NEL.Clarke Quay',
            'SBS.NEL.DhobyGhaut',
            'SBS.NEL.Little India',
            'SBS.NEL.Farrer Park',
            'SBS.NEL.Boon Keng',
            'SBS.NEL.Potong Pasir',
            'SBS.NEL.Woodleigh',
            'SBS.NEL.Serangoon',
            'SBS.NEL.Kovan',
            'SBS.NEL.Hougang',
            'SBS.NEL.Buangkok',
            'SBS.NEL.Sengkang',
            'SBS.NEL.Punggol'
        ]
    },
    {
        id: 'SBS.DTL',
        title: {
            en: 'Downtown Line',
            'zh-Hans': '滨海市区线',
            'zh-Hant': '濱海市區線',
            ms: 'Laluan Pusat Bandar',
            ta: 'நகர வழித்தடம்'
        },
        color: '#005EC4', // Blue
        operator: 'SBS',
        type: 'heavy-rail',
        stations: [
            'SBS.DTL.Bukit Panjang',
            'SBS.DTL.Cashew',
            'SBS.DTL.Hillview',
            'SBS.DTL.Beauty World',
            'SBS.DTL.King Albert Park',
            'SBS.DTL.Sixth Avenue',
            'SBS.DTL.Tan Kah Kee',
            'SBS.DTL.Botanic Gardens',
            'SBS.DTL.Stevens',
            'SBS.DTL.Newton',
            'SBS.DTL.Little India',
            'SBS.DTL.Rochor',
            'SBS.DTL.Bugis',
            'SBS.DTL.Promenade',
            'SBS.DTL.Bayfront',
            'SBS.DTL.Downtown',
            'SBS.DTL.Telok Ayer',
            'SBS.DTL.Chinatown',
            'SBS.DTL.Fort Canning',
            'SBS.DTL.Bencoolen',
            'SBS.DTL.Jalan Besar',
            'SBS.DTL.Bendemeer',
            'SBS.DTL.Geylang Bahru',
            'SBS.DTL.Mattar',
            'SBS.DTL.MacPherson',
            'SBS.DTL.Ubi',
            'SBS.DTL.Kaki Bukit',
            'SBS.DTL.Bedok North',
            'SBS.DTL.Bedok Reservoir',
            'SBS.DTL.Tampines West',
            'SBS.DTL.Tampines',
            'SBS.DTL.Tampines East',
            'SBS.DTL.Upper Changi',
            'SBS.DTL.Expo',
            'SBS.DTL.Xilin',
            'SBS.DTL.Sungei Bedok'
        ]
    },
    {
        id: 'SMRT.TEL',
        title: {
            en: 'Thomson-East Coast Line',
            'zh-Hans': '汤申－东海岸线',
            'zh-Hant': '湯申－東海岸線',
            ms: 'Laluan Thomson-Pantai Timur',
            ta: 'தாம்சன்-கிழக்கு கடற்கரை பாதை'
        },
        color: '#9D5B25', // Brown
        operator: 'SMRT',
        type: 'heavy-rail',
        stations: [
            'SMRT.TEL.Woodlands North',
            'SMRT.TEL.Woodlands',
            'SMRT.TEL.Woodlands South',
            'SMRT.TEL.Springleaf',
            'SMRT.TEL.Lentor',
            'SMRT.TEL.Mayflower',
            'SMRT.TEL.Bright Hill',
            'SMRT.TEL.Upper Thomson',
            'SMRT.TEL.Caldecott',
            'SMRT.TEL.Mount Pleasant',
            'SMRT.TEL.Stevens',
            'SMRT.TEL.Napier',
            'SMRT.TEL.Orchard Boulevard',
            'SMRT.TEL.Orchard',
            'SMRT.TEL.Great World',
            'SMRT.TEL.Havelock',
            'SMRT.TEL.Outram Park',
            'SMRT.TEL.Maxwell',
            'SMRT.TEL.Shenton Way',
            'SMRT.TEL.Marina Bay',
            'SMRT.TEL.Marina South',
            'SMRT.TEL.Gardens by the Bay',
            'SMRT.TEL.Tanjong Rhu',
            'SMRT.TEL.Katong Park',
            'SMRT.TEL.Tanjong Katong',
            'SMRT.TEL.Marine Parade',
            'SMRT.TEL.Marine Terrace',
            'SMRT.TEL.Siglap',
            'SMRT.TEL.Bayshore',
            'SMRT.TEL.Bedok South',
            'SMRT.TEL.Sungei Bedok'
        ]
    },
    {
        id: 'SMRT.BPLRT',
        title: {
            en: 'Bukit Panjang LRT',
            'zh-Hans': '武吉班让轻轨',
            'zh-Hant': '武吉班讓輕軌',
            ms: 'LRT Bukit Panjang',
            ta: 'புக்கிட் பஞ்சாங் இலகுரயில்'
        },
        color: '#748477', // Grey
        operator: 'SMRT',
        type: 'light-rail',
        stations: [] // Loop line - to be populated
    },
    {
        id: 'SBS.SKLRT',
        title: {
            en: 'Sengkang LRT',
            'zh-Hans': '盛港轻轨',
            'zh-Hant': '盛港輕軌',
            ms: 'LRT Sengkang',
            ta: 'செங்காங் இலகுரயில்'
        },
        color: '#748477', // Grey
        operator: 'SBS',
        type: 'light-rail',
        stations: [] // Loop line - to be populated
    },
    {
        id: 'SBS.PGLRT',
        title: {
            en: 'Punggol LRT',
            'zh-Hans': '榜鹅轻轨',
            'zh-Hant': '榜鵝輕軌',
            ms: 'LRT Punggol',
            ta: 'பூங்கோல் இலகுரயில்'
        },
        color: '#748477', // Grey
        operator: 'SBS',
        type: 'light-rail',
        stations: [] // Loop line - to be populated
    }
];

/**
 * Save railways data
 */
function saveRailways() {
    const outputDir = path.join(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'railways.json');
    fs.writeFileSync(outputPath, JSON.stringify(RAILWAYS, null, '\t'));

    console.log(`✓ Saved ${RAILWAYS.length} railways to ${outputPath}`);
    console.log(`\nSample output:`);
    console.log(JSON.stringify(RAILWAYS.slice(0, 1), null, 2));
}

// Run
saveRailways();
