import {describe, it, expect} from 'vitest';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const BUILD_DIR = path.resolve('build');
const DATA_DIR = path.join(BUILD_DIR, 'data');

const EXPECTED_DATA_FILES = [
    'railways.json.gz',
    'stations.json.gz',
    'exits.json.gz',
    'features.json.gz',
    'rail-directions.json.gz',
    'station-buildings.json.gz',
    'train-vehicles.json.gz',
    'train-types.json.gz',
    'operators.json.gz',
    'airports.json.gz',
    'flight-statuses.json.gz',
    'poi.json.gz',
    'timetable-weekday.json.gz',
    'timetable-saturday.json.gz',
    'timetable-sunday-holiday.json.gz',
    'timetable-holiday.json.gz'
];

describe('Build integrity', () => {

    it('build/ directory exists', () => {
        expect(fs.existsSync(BUILD_DIR)).toBe(true);
    });

    it('build/data/ directory exists', () => {
        expect(fs.existsSync(DATA_DIR)).toBe(true);
    });

    it('build/index.html exists', () => {
        expect(fs.existsSync(path.join(BUILD_DIR, 'index.html'))).toBe(true);
    });

    it('build/index.html has no unresolved placeholders', () => {
        const html = fs.readFileSync(path.join(BUILD_DIR, 'index.html'), 'utf8');
        expect(html).not.toContain('__MAPBOX_ACCESS_TOKEN__');
        expect(html).not.toContain('__GOOGLE_ANALYTICS_ID__');
        expect(html).not.toContain('__SHARE_URL__');
    });

    it('build/mini-singapore-3d.min.js exists', () => {
        expect(fs.existsSync(path.join(BUILD_DIR, 'mini-singapore-3d.min.js'))).toBe(true);
    });

    describe('Data files', () => {
        for (const file of EXPECTED_DATA_FILES) {
            const filePath = path.join(DATA_DIR, file);

            it(`${file} exists`, () => {
                expect(fs.existsSync(filePath)).toBe(true);
            });

            it(`${file} is valid gzip`, () => {
                const buf = fs.readFileSync(filePath);
                // Gzip magic bytes
                expect(buf[0]).toBe(0x1f);
                expect(buf[1]).toBe(0x8b);
            });

            it(`${file} decompresses to valid JSON`, () => {
                const buf = fs.readFileSync(filePath);
                const decompressed = zlib.gunzipSync(buf).toString('utf8');
                expect(() => JSON.parse(decompressed)).not.toThrow();
            });
        }
    });

    describe('Dictionary files', () => {
        for (const lang of ['en', 'zh-Hans', 'zh-Hant', 'ms', 'ta']) {
            it(`dictionary-${lang}.json exists in build/data/`, () => {
                expect(fs.existsSync(path.join(DATA_DIR, `dictionary-${lang}.json`))).toBe(true);
            });
        }
    });
});
