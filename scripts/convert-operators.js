#!/usr/bin/env node

/**
 * Convert Singapore transport operators to operators.json format
 *
 * Expected output format (matching Tokyo structure):
 * [{
 *   "id": "SMRT",
 *   "title": {
 *     "en": "SMRT Corporation"
 *   },
 *   "color": "#EE2E24"
 * }]
 */

const fs = require('fs');
const path = require('path');

const OPERATORS = [
    {
        id: 'SMRT',
        title: {
            en: 'SMRT Corporation',
            'zh-Hans': 'SMRT集团',
            'zh-Hant': 'SMRT集團',
            ms: 'Perbadanan SMRT',
            ta: 'எஸ்.எம்.ஆர்.டி. கார்ப்பரேஷன்'
        },
        color: '#EE2E24', // SMRT Red
        type: 'railway',
        lines: ['NSL', 'EWL', 'CCL', 'TEL', 'BPLRT']
    },
    {
        id: 'SBS',
        title: {
            en: 'SBS Transit',
            'zh-Hans': '新捷运',
            'zh-Hant': '新捷運',
            ms: 'SBS Transit',
            ta: 'எஸ்.பி.எஸ். டிரான்சிட்'
        },
        color: '#780F7E', // SBS Purple
        type: 'railway',
        lines: ['NEL', 'DTL', 'SKLRT', 'PGLRT']
    },
    {
        id: 'LTA',
        title: {
            en: 'Land Transport Authority',
            'zh-Hans': '陆路交通管理局',
            'zh-Hant': '陸路交通管理局',
            ms: 'Lembaga Pengangkutan Darat',
            ta: 'நில போக்குவரத்து ஆணையம்'
        },
        color: '#0055A5', // LTA Blue
        type: 'authority'
    }
];

/**
 * Save operators data
 */
function saveOperators() {
    const outputDir = path.join(__dirname, '../data');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputPath = path.join(outputDir, 'operators.json');
    fs.writeFileSync(outputPath, JSON.stringify(OPERATORS, null, '\t'));

    console.log(`✓ Saved ${OPERATORS.length} operators to ${outputPath}`);
    console.log(`\nOutput:`);
    console.log(JSON.stringify(OPERATORS, null, 2));
}

// Run
saveOperators();
