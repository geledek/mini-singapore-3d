#!/usr/bin/env node

/**
 * Complete Singapore MRT/LRT Station Data
 * All 140+ stations with accurate coordinates and Chinese names
 *
 * Data sources:
 * - LTA official MRT map
 * - Wikipedia: List of Singapore MRT stations
 * - OpenStreetMap Singapore
 */

const fs = require('fs');
const path = require('path');

// MRT/LRT Lines configuration
const MRT_LINES = {
    'NS': { id: 'SMRT.NSL', operator: 'SMRT', color: '#D42E12' },
    'EW': { id: 'SMRT.EWL', operator: 'SMRT', color: '#009645' },
    'CG': { id: 'SMRT.EWL', operator: 'SMRT', color: '#009645' },
    'CC': { id: 'SMRT.CCL', operator: 'SMRT', color: '#FA9E0D' },
    'CE': { id: 'SMRT.CCL', operator: 'SMRT', color: '#FA9E0D' },
    'NE': { id: 'SBS.NEL', operator: 'SBS', color: '#9900AA' },
    'DT': { id: 'SBS.DTL', operator: 'SBS', color: '#005EC4' },
    'TE': { id: 'SMRT.TEL', operator: 'SMRT', color: '#9D5B25' },
    'BP': { id: 'SMRT.BPLRT', operator: 'SMRT', color: '#748477' },
    'SE': { id: 'SBS.SKLRT', operator: 'SBS', color: '#748477' },
    'SW': { id: 'SBS.SKLRT', operator: 'SBS', color: '#748477' },
    'PE': { id: 'SBS.PGLRT', operator: 'SBS', color: '#748477' },
    'PW': { id: 'SBS.PGLRT', operator: 'SBS', color: '#748477' }
};

// Complete station data for all lines
const ALL_STATIONS = [
    // ============================================================
    // NORTH SOUTH LINE (NSL) - Red Line
    // ============================================================
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

    // ============================================================
    // EAST WEST LINE (EWL) - Green Line
    // ============================================================
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
    { code: 'EW22', name: 'Dover', nameCN: '多福', coord: [103.7785, 1.3118] },
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

    // Changi Airport branch
    { code: 'CG1', name: 'Expo', nameCN: '博览', coord: [103.9614, 1.3354] },
    { code: 'CG2', name: 'Changi Airport', nameCN: '樟宜机场', coord: [103.9886, 1.3573] },

    // ============================================================
    // CIRCLE LINE (CCL) - Orange Line
    // ============================================================
    { code: 'CC1', name: 'Dhoby Ghaut', nameCN: '多美歌', coord: [103.8456, 1.2988] },
    { code: 'CC2', name: 'Bras Basah', nameCN: '百胜', coord: [103.8507, 1.2970] },
    { code: 'CC3', name: 'Esplanade', nameCN: '宝门廊', coord: [103.8556, 1.2935] },
    { code: 'CC4', name: 'Promenade', nameCN: '宝龙坊', coord: [103.8610, 1.2931] },
    { code: 'CC5', name: 'Nicoll Highway', nameCN: '尼诰大道', coord: [103.8635, 1.3000] },
    { code: 'CC6', name: 'Stadium', nameCN: '体育场', coord: [103.8754, 1.3027] },
    { code: 'CC7', name: 'Mountbatten', nameCN: '蒙巴登', coord: [103.8826, 1.3064] },
    { code: 'CC8', name: 'Dakota', nameCN: '达哥打', coord: [103.8882, 1.3081] },
    { code: 'CC9', name: 'Paya Lebar', nameCN: '巴耶利峇', coord: [103.8926, 1.3177] },
    { code: 'CC10', name: 'MacPherson', nameCN: '麦波申', coord: [103.8898, 1.3266] },
    { code: 'CC11', name: 'Tai Seng', nameCN: '大成', coord: [103.8878, 1.3358] },
    { code: 'CC12', name: 'Bartley', nameCN: '巴特礼', coord: [103.8794, 1.3425] },
    { code: 'CC13', name: 'Serangoon', nameCN: '实龙岗', coord: [103.8732, 1.3501] },
    { code: 'CC14', name: 'Lorong Chuan', nameCN: '罗弄泉', coord: [103.8644, 1.3517] },
    { code: 'CC15', name: 'Bishan', nameCN: '碧山', coord: [103.8484, 1.3510] },
    { code: 'CC16', name: 'Marymount', nameCN: '玛丽蒙', coord: [103.8396, 1.3487] },
    { code: 'CC17', name: 'Caldecott', nameCN: '加利谷', coord: [103.8394, 1.3375] },
    { code: 'CC19', name: 'Botanic Gardens', nameCN: '植物园', coord: [103.8156, 1.3222] },
    { code: 'CC20', name: 'Farrer Road', nameCN: '花拉路', coord: [103.8076, 1.3173] },
    { code: 'CC21', name: 'Holland Village', nameCN: '荷兰村', coord: [103.7964, 1.3116] },
    { code: 'CC22', name: 'Buona Vista', nameCN: '波那维斯达', coord: [103.7906, 1.3070] },
    { code: 'CC23', name: 'one-north', nameCN: '纬壹', coord: [103.7872, 1.2997] },
    { code: 'CC24', name: 'Kent Ridge', nameCN: '肯特岗', coord: [103.7844, 1.2934] },
    { code: 'CC25', name: 'Haw Par Villa', nameCN: '虎豹别墅', coord: [103.7819, 1.2823] },
    { code: 'CC26', name: 'Pasir Panjang', nameCN: '巴西班让', coord: [103.7913, 1.2762] },
    { code: 'CC27', name: 'Labrador Park', nameCN: '拉柏多公园', coord: [103.8022, 1.2722] },
    { code: 'CC28', name: 'Telok Blangah', nameCN: '直落布兰雅', coord: [103.8097, 1.2707] },
    { code: 'CC29', name: 'HarbourFront', nameCN: '港湾', coord: [103.8218, 1.2653] },

    // Circle Line Extension (Marina Bay)
    { code: 'CE1', name: 'Bayfront', nameCN: '海湾舫', coord: [103.8593, 1.2820] },
    { code: 'CE2', name: 'Marina Bay', nameCN: '滨海湾', coord: [103.8545, 1.2762] },

    // ============================================================
    // NORTH EAST LINE (NEL) - Purple Line
    // ============================================================
    { code: 'NE1', name: 'HarbourFront', nameCN: '港湾', coord: [103.8218, 1.2653] },
    { code: 'NE3', name: 'Outram Park', nameCN: '欧南园', coord: [103.8395, 1.2801] },
    { code: 'NE4', name: 'Chinatown', nameCN: '牛车水', coord: [103.8440, 1.2844] },
    { code: 'NE5', name: 'Clarke Quay', nameCN: '克拉码头', coord: [103.8466, 1.2887] },
    { code: 'NE6', name: 'Dhoby Ghaut', nameCN: '多美歌', coord: [103.8456, 1.2988] },
    { code: 'NE7', name: 'Little India', nameCN: '小印度', coord: [103.8495, 1.3066] },
    { code: 'NE8', name: 'Farrer Park', nameCN: '花拉公园', coord: [103.8538, 1.3122] },
    { code: 'NE9', name: 'Boon Keng', nameCN: '文庆', coord: [103.8617, 1.3194] },
    { code: 'NE10', name: 'Potong Pasir', nameCN: '波东巴西', coord: [103.8693, 1.3314] },
    { code: 'NE11', name: 'Woodleigh', nameCN: '兀里', coord: [103.8705, 1.3390] },
    { code: 'NE12', name: 'Serangoon', nameCN: '实龙岗', coord: [103.8732, 1.3501] },
    { code: 'NE13', name: 'Kovan', nameCN: '高文', coord: [103.8850, 1.3608] },
    { code: 'NE14', name: 'Hougang', nameCN: '后港', coord: [103.8927, 1.3712] },
    { code: 'NE15', name: 'Buangkok', nameCN: '万国', coord: [103.8930, 1.3828] },
    { code: 'NE16', name: 'Sengkang', nameCN: '盛港', coord: [103.8950, 1.3916] },
    { code: 'NE17', name: 'Punggol', nameCN: '榜鹅', coord: [103.9021, 1.4054] },

    // ============================================================
    // DOWNTOWN LINE (DTL) - Blue Line
    // ============================================================
    { code: 'DT1', name: 'Bukit Panjang', nameCN: '武吉班让', coord: [103.7619, 1.3793] },
    { code: 'DT2', name: 'Cashew', nameCN: '腰果', coord: [103.7648, 1.3691] },
    { code: 'DT3', name: 'Hillview', nameCN: '山景', coord: [103.7676, 1.3624] },
    { code: 'DT5', name: 'Beauty World', nameCN: '美世界', coord: [103.7758, 1.3413] },
    { code: 'DT6', name: 'King Albert Park', nameCN: '京华公园', coord: [103.7832, 1.3355] },
    { code: 'DT7', name: 'Sixth Avenue', nameCN: '第六道', coord: [103.7968, 1.3308] },
    { code: 'DT8', name: 'Tan Kah Kee', nameCN: '陈嘉庚', coord: [103.8072, 1.3256] },
    { code: 'DT9', name: 'Botanic Gardens', nameCN: '植物园', coord: [103.8156, 1.3222] },
    { code: 'DT10', name: 'Stevens', nameCN: '史蒂芬', coord: [103.8254, 1.3199] },
    { code: 'DT11', name: 'Newton', nameCN: '纽顿', coord: [103.8383, 1.3130] },
    { code: 'DT12', name: 'Little India', nameCN: '小印度', coord: [103.8495, 1.3066] },
    { code: 'DT13', name: 'Rochor', nameCN: '梧槽', coord: [103.8524, 1.3040] },
    { code: 'DT14', name: 'Bugis', nameCN: '武吉士', coord: [103.8556, 1.3004] },
    { code: 'DT15', name: 'Promenade', nameCN: '宝龙坊', coord: [103.8610, 1.2931] },
    { code: 'DT16', name: 'Bayfront', nameCN: '海湾舫', coord: [103.8593, 1.2820] },
    { code: 'DT17', name: 'Downtown', nameCN: '市中心', coord: [103.8527, 1.2797] },
    { code: 'DT18', name: 'Telok Ayer', nameCN: '直落亚逸', coord: [103.8484, 1.2824] },
    { code: 'DT19', name: 'Chinatown', nameCN: '牛车水', coord: [103.8440, 1.2844] },
    { code: 'DT20', name: 'Fort Canning', nameCN: '福康宁', coord: [103.8444, 1.2929] },
    { code: 'DT21', name: 'Bencoolen', nameCN: '明古连', coord: [103.8500, 1.2986] },
    { code: 'DT22', name: 'Jalan Besar', nameCN: '惹兰勿刹', coord: [103.8552, 1.3053] },
    { code: 'DT23', name: 'Bendemeer', nameCN: '文礼', coord: [103.8620, 1.3139] },
    { code: 'DT24', name: 'Geylang Bahru', nameCN: '芽笼峇鲁', coord: [103.8711, 1.3212] },
    { code: 'DT25', name: 'Mattar', nameCN: '马塔', coord: [103.8828, 1.3266] },
    { code: 'DT26', name: 'MacPherson', nameCN: '麦波申', coord: [103.8898, 1.3266] },
    { code: 'DT27', name: 'Ubi', nameCN: '乌美', coord: [103.8996, 1.3300] },
    { code: 'DT28', name: 'Kaki Bukit', nameCN: '加基武吉', coord: [103.9079, 1.3349] },
    { code: 'DT29', name: 'Bedok North', nameCN: '勿洛北', coord: [103.9176, 1.3348] },
    { code: 'DT30', name: 'Bedok Reservoir', nameCN: '勿洛蓄水池', coord: [103.9334, 1.3361] },
    { code: 'DT31', name: 'Tampines West', nameCN: '淡滨尼西', coord: [103.9381, 1.3454] },
    { code: 'DT32', name: 'Tampines', nameCN: '淡滨尼', coord: [103.9453, 1.3538] },
    { code: 'DT33', name: 'Tampines East', nameCN: '淡滨尼东', coord: [103.9556, 1.3565] },
    { code: 'DT34', name: 'Upper Changi', nameCN: '樟宜上段', coord: [103.9614, 1.3417] },
    { code: 'DT35', name: 'Expo', nameCN: '博览', coord: [103.9614, 1.3354] },
    { code: 'DT36', name: 'Xilin', nameCN: '锡林', coord: [103.9700, 1.3320] },
    { code: 'DT37', name: 'Sungei Bedok', nameCN: '双溪勿洛', coord: [103.9470, 1.3122] },

    // ============================================================
    // THOMSON-EAST COAST LINE (TEL) - Brown Line
    // ============================================================
    { code: 'TE1', name: 'Woodlands North', nameCN: '兀兰北', coord: [103.7864, 1.4484] },
    { code: 'TE2', name: 'Woodlands', nameCN: '兀兰', coord: [103.7865, 1.4370] },
    { code: 'TE3', name: 'Woodlands South', nameCN: '兀兰南', coord: [103.7943, 1.4278] },
    { code: 'TE4', name: 'Springleaf', nameCN: '春叶', coord: [103.8177, 1.4170] },
    { code: 'TE5', name: 'Lentor', nameCN: '林多', coord: [103.8356, 1.3850] },
    { code: 'TE6', name: 'Mayflower', nameCN: '美华', coord: [103.8362, 1.3772] },
    { code: 'TE7', name: 'Bright Hill', nameCN: '明德', coord: [103.8325, 1.3625] },
    { code: 'TE8', name: 'Upper Thomson', nameCN: '汤申上段', coord: [103.8327, 1.3543] },
    { code: 'TE9', name: 'Caldecott', nameCN: '加利谷', coord: [103.8394, 1.3375] },
    { code: 'TE11', name: 'Mount Pleasant', nameCN: '花柏山', coord: [103.8310, 1.3263] },
    { code: 'TE12', name: 'Stevens', nameCN: '史蒂芬', coord: [103.8254, 1.3199] },
    { code: 'TE13', name: 'Napier', nameCN: '那比尔', coord: [103.8233, 1.3123] },
    { code: 'TE14', name: 'Orchard Boulevard', nameCN: '乌节林荫道', coord: [103.8279, 1.3061] },
    { code: 'TE15', name: 'Orchard', nameCN: '乌节', coord: [103.8320, 1.3041] },
    { code: 'TE16', name: 'Great World', nameCN: '大世界', coord: [103.8320, 1.2938] },
    { code: 'TE17', name: 'Havelock', nameCN: '禧街', coord: [103.8351, 1.2891] },
    { code: 'TE18', name: 'Outram Park', nameCN: '欧南园', coord: [103.8395, 1.2801] },
    { code: 'TE19', name: 'Maxwell', nameCN: '麦士威', coord: [103.8444, 1.2806] },
    { code: 'TE20', name: 'Shenton Way', nameCN: '珊顿道', coord: [103.8486, 1.2793] },
    { code: 'TE21', name: 'Marina Bay', nameCN: '滨海湾', coord: [103.8545, 1.2762] },
    { code: 'TE22', name: 'Marina South', nameCN: '滨海南', coord: [103.8628, 1.2715] },
    { code: 'TE22A', name: 'Gardens by the Bay', nameCN: '滨海湾花园', coord: [103.8636, 1.2814] },
    { code: 'TE23', name: 'Tanjong Rhu', nameCN: '丹戎禺', coord: [103.8699, 1.2943] },
    { code: 'TE24', name: 'Katong Park', nameCN: '加东公园', coord: [103.8999, 1.3014] },
    { code: 'TE25', name: 'Tanjong Katong', nameCN: '丹戎加东', coord: [103.9006, 1.3071] },
    { code: 'TE26', name: 'Marine Parade', nameCN: '马林百列', coord: [103.9067, 1.3021] },
    { code: 'TE27', name: 'Marine Terrace', nameCN: '马林台', coord: [103.9156, 1.3058] },
    { code: 'TE28', name: 'Siglap', nameCN: '实乞纳', coord: [103.9269, 1.3137] },
    { code: 'TE29', name: 'Bayshore', nameCN: '海岸', coord: [103.9361, 1.3198] },
    { code: 'TE30', name: 'Bedok South', nameCN: '勿洛南', coord: [103.9441, 1.3211] },
    { code: 'TE31', name: 'Sungei Bedok', nameCN: '双溪勿洛', coord: [103.9470, 1.3122] },

    // ============================================================
    // BUKIT PANJANG LRT (BPLRT) - Grey Line
    // ============================================================
    { code: 'BP1', name: 'Choa Chu Kang', nameCN: '蔡厝港', coord: [103.7443, 1.3854] },
    { code: 'BP2', name: 'South View', nameCN: '南景', coord: [103.7449, 1.3801] },
    { code: 'BP3', name: 'Keat Hong', nameCN: '吉丰', coord: [103.7488, 1.3788] },
    { code: 'BP4', name: 'Teck Whye', nameCN: '德惠', coord: [103.7541, 1.3768] },
    { code: 'BP5', name: 'Phoenix', nameCN: '凤凰', coord: [103.7582, 1.3788] },
    { code: 'BP6', name: 'Bukit Panjang', nameCN: '武吉班让', coord: [103.7619, 1.3793] },
    { code: 'BP7', name: 'Petir', nameCN: '柏提', coord: [103.7664, 1.3780] },
    { code: 'BP8', name: 'Pending', nameCN: '秉定', coord: [103.7710, 1.3759] },
    { code: 'BP9', name: 'Bangkit', nameCN: '万吉', coord: [103.7721, 1.3801] },
    { code: 'BP10', name: 'Fajar', nameCN: '法嘉', coord: [103.7703, 1.3844] },
    { code: 'BP11', name: 'Segar', nameCN: '实加', coord: [103.7691, 1.3876] },
    { code: 'BP12', name: 'Jelapang', nameCN: '泽拉邦', coord: [103.7640, 1.3863] },
    { code: 'BP13', name: 'Senja', nameCN: '信佳', coord: [103.7625, 1.3826] },
    { code: 'BP14', name: 'Ten Mile Junction', nameCN: '十里广场', coord: [103.7602, 1.3806] },

    // ============================================================
    // SENGKANG LRT (SKLRT) - Grey Line (East & West Loops)
    // ============================================================
    { code: 'SE1', name: 'Compassvale', nameCN: '康埔桦', coord: [103.9006, 1.3944] },
    { code: 'SE2', name: 'Rumbia', nameCN: '润必雅', coord: [103.9065, 1.3937] },
    { code: 'SE3', name: 'Bakau', nameCN: '巴考', coord: [103.9051, 1.3908] },
    { code: 'SE4', name: 'Kangkar', nameCN: '港脚', coord: [103.9020, 1.3844] },
    { code: 'SE5', name: 'Ranggung', nameCN: '兰岗', coord: [103.8971, 1.3897] },

    { code: 'SW1', name: 'Cheng Lim', nameCN: '振林', coord: [103.8941, 1.3963] },
    { code: 'SW2', name: 'Farmway', nameCN: '花园路', coord: [103.8897, 1.3973] },
    { code: 'SW3', name: 'Kupang', nameCN: '古邦', coord: [103.8885, 1.3917] },
    { code: 'SW4', name: 'Thanggam', nameCN: '丹甘', coord: [103.8882, 1.3979] },
    { code: 'SW5', name: 'Fernvale', nameCN: '芬微', coord: [103.8766, 1.3920] },
    { code: 'SW6', name: 'Layar', nameCN: '拉雅', coord: [103.8754, 1.3926] },
    { code: 'SW7', name: 'Tongkang', nameCN: '同港', coord: [103.8854, 1.3891] },
    { code: 'SW8', name: 'Renjong', nameCN: '仁宗', coord: [103.8920, 1.3866] },

    // ============================================================
    // PUNGGOL LRT (PGLRT) - Grey Line (East & West Loops)
    // ============================================================
    { code: 'PE1', name: 'Cove', nameCN: '海湾', coord: [103.9060, 1.3998] },
    { code: 'PE2', name: 'Meridian', nameCN: '丽园', coord: [103.9085, 1.3972] },
    { code: 'PE3', name: 'Coral Edge', nameCN: '珊瑚', coord: [103.9127, 1.3940] },
    { code: 'PE4', name: 'Riviera', nameCN: '里维拉', coord: [103.9162, 1.3914] },
    { code: 'PE5', name: 'Kadaloor', nameCN: '卡达鲁', coord: [103.9161, 1.3991] },
    { code: 'PE6', name: 'Oasis', nameCN: '绿洲', coord: [103.9123, 1.4023] },
    { code: 'PE7', name: 'Damai', nameCN: '达迈', coord: [103.9075, 1.4048] },

    { code: 'PW1', name: 'Sam Kee', nameCN: '三记', coord: [103.9020, 1.4125] },
    { code: 'PW2', name: 'Teck Lee', nameCN: '德利', coord: [103.9063, 1.4130] },
    { code: 'PW3', name: 'Punggol Point', nameCN: '榜鹅坊', coord: [103.9064, 1.4169] },
    { code: 'PW4', name: 'Samudera', nameCN: '沙慕达', coord: [103.9024, 1.4151] },
    { code: 'PW5', name: 'Nibong', nameCN: '尼蒙', coord: [103.9066, 1.4093] },
    { code: 'PW6', name: 'Sumang', nameCN: '苏芒', coord: [103.9027, 1.4088] },
    { code: 'PW7', name: 'Soo Teck', nameCN: '树德', coord: [103.8973, 1.4063] },
];

function getLineInfo(stationCode) {
    const linePrefix = stationCode.replace(/\d+A?/g, '');
    return MRT_LINES[linePrefix] || { id: 'Unknown', operator: 'Unknown' };
}

function createStationId(stationCode, stationName) {
    const lineInfo = getLineInfo(stationCode);
    const safeName = stationName.replace(/\s+/g, '').replace(/'/g, '').replace(/-/g, '');
    return `${lineInfo.id}.${safeName}`;
}

function convertStations() {
    console.log(`Converting ${ALL_STATIONS.length} stations to stations.json format...\n`);

    const stations = ALL_STATIONS.map(station => {
        const lineInfo = getLineInfo(station.code);
        const stationId = createStationId(station.code, station.name);

        return {
            id: stationId,
            railway: lineInfo.id,
            coord: station.coord,
            title: {
                en: station.name,
                'zh-Hans': station.nameCN,
                'zh-Hant': station.nameCN, // Using simplified for traditional (can be updated later)
                ms: station.name // Default to English (can translate manually later)
            },
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

function saveStations(stations) {
    const outputDir = path.join(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'stations.json');
    fs.writeFileSync(outputPath, JSON.stringify(stations, null, '\t'));

    console.log(`✓ Saved ${stations.length} stations to ${outputPath}\n`);

    // Print statistics
    const byLine = {};
    stations.forEach(s => {
        byLine[s.railway] = (byLine[s.railway] || 0) + 1;
    });

    console.log('Station count by line:');
    Object.entries(byLine).sort((a, b) => a[0].localeCompare(b[0])).forEach(([line, count]) => {
        console.log(`  ${line}: ${count} stations`);
    });

    console.log(`\nSample output (first 2 stations):`);
    console.log(JSON.stringify(stations.slice(0, 2), null, 2));
}

// Run conversion
const stations = convertStations();
saveStations(stations);

module.exports = { ALL_STATIONS, convertStations };
