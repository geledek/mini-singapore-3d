#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const RAIL_DIRECTIONS = [
    {
        id: 'SMRT.NSL.Northbound',
        title: {
            en: 'Northbound',
            'zh-Hans': '北行',
            'zh-Hant': '北行',
            ms: 'Arah Utara',
            ta: 'வடக்கு நோக்கி'
        }
    },
    {
        id: 'SMRT.NSL.Southbound',
        title: {
            en: 'Southbound',
            'zh-Hans': '南行',
            'zh-Hant': '南行',
            ms: 'Arah Selatan',
            ta: 'தெற்கு நோக்கி'
        }
    },
    {
        id: 'SMRT.EWL.Eastbound',
        title: {
            en: 'Eastbound',
            'zh-Hans': '东行',
            'zh-Hant': '東行',
            ms: 'Arah Timur',
            ta: 'கிழக்கு நோக்கி'
        }
    },
    {
        id: 'SMRT.EWL.Westbound',
        title: {
            en: 'Westbound',
            'zh-Hans': '西行',
            'zh-Hant': '西行',
            ms: 'Arah Barat',
            ta: 'மேற்கு நோக்கி'
        }
    },
    {
        id: 'SMRT.CCL.Clockwise',
        title: {
            en: 'Clockwise',
            'zh-Hans': '顺时针',
            'zh-Hant': '順時針',
            ms: 'Ikut Jam',
            ta: 'வலஞ்சுழியாக'
        }
    },
    {
        id: 'SMRT.CCL.AntiClockwise',
        title: {
            en: 'Anti-Clockwise',
            'zh-Hans': '逆时针',
            'zh-Hant': '逆時針',
            ms: 'Lawan Jam',
            ta: 'எதிர் சுழியாக'
        }
    },
    {
        id: 'SBS.NEL.NorthEastbound',
        title: {
            en: 'To Punggol',
            'zh-Hans': '往榜鹅',
            'zh-Hant': '往榜鵝',
            ms: 'Ke Punggol',
            ta: 'பூங்கோல் நோக்கி'
        }
    },
    {
        id: 'SBS.NEL.SouthWestbound',
        title: {
            en: 'To HarbourFront',
            'zh-Hans': '往港湾',
            'zh-Hant': '往港灣',
            ms: 'Ke HarbourFront',
            ta: 'ஹார்பர்ஃப்ரண்ட் நோக்கி'
        }
    },
    {
        id: 'SBS.DTL.Eastbound',
        title: {
            en: 'Eastbound',
            'zh-Hans': '东行',
            'zh-Hant': '東行',
            ms: 'Arah Timur',
            ta: 'கிழக்கு நோக்கி'
        }
    },
    {
        id: 'SBS.DTL.Westbound',
        title: {
            en: 'Westbound',
            'zh-Hans': '西行',
            'zh-Hant': '西行',
            ms: 'Arah Barat',
            ta: 'மேற்கு நோக்கி'
        }
    },
    {
        id: 'SMRT.TEL.Northbound',
        title: {
            en: 'Northbound',
            'zh-Hans': '北行',
            'zh-Hant': '北行',
            ms: 'Arah Utara',
            ta: 'வடக்கு நோக்கி'
        }
    },
    {
        id: 'SMRT.TEL.Southbound',
        title: {
            en: 'Southbound',
            'zh-Hans': '南行',
            'zh-Hant': '南行',
            ms: 'Arah Selatan',
            ta: 'தெற்கு நோக்கி'
        }
    }
];

const outputPath = path.join(__dirname, '../data/rail-directions.json');
fs.writeFileSync(outputPath, JSON.stringify(RAIL_DIRECTIONS, null, '\t'));
console.log(`✓ Generated rail-directions.json with ${RAIL_DIRECTIONS.length} directions`);
