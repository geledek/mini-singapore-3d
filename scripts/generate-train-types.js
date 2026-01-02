#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Singapore trains are simpler - mostly just regular service
// No express/limited express like Tokyo
const TRAIN_TYPES = [
    {
        id: 'SMRT.Regular',
        title: {
            en: 'Regular',
            'zh-Hans': '常规',
            'zh-Hant': '常規',
            ms: 'Biasa',
            ta: 'வழக்கமான'
        },
        color: '#000000'
    },
    {
        id: 'SBS.Regular',
        title: {
            en: 'Regular',
            'zh-Hans': '常规',
            'zh-Hant': '常規',
            ms: 'Biasa',
            ta: 'வழக்கமான'
        },
        color: '#000000'
    }
];

const outputPath = path.join(__dirname, '../data/train-types.json');
fs.writeFileSync(outputPath, JSON.stringify(TRAIN_TYPES, null, '\t'));
console.log(`✓ Generated train-types.json with ${TRAIN_TYPES.length} types`);
