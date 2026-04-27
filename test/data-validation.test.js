import {describe, it, expect} from 'vitest';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.resolve('data');

const railways = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'railways.json'), 'utf8'));
const stations = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'stations.json'), 'utf8'));
const exits = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'exits.json'), 'utf8'));

describe('Railways data', () => {
    it('is a non-empty array', () => {
        expect(Array.isArray(railways)).toBe(true);
        expect(railways.length).toBeGreaterThan(0);
    });

    it('has unique IDs', () => {
        const ids = railways.map(r => r.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('each railway has required fields', () => {
        for (const r of railways) {
            expect(r).toHaveProperty('id');
            expect(r).toHaveProperty('title');
            expect(r).toHaveProperty('color');
            expect(typeof r.color).toBe('string');
            expect(r.color).toMatch(/^#[0-9a-fA-F]{6}$/);
        }
    });

    it('has expected railway lines', () => {
        const ids = railways.map(r => r.id);
        // Singapore MRT lines (prefixed with operator)
        expect(ids.some(id => id.includes('NSL'))).toBe(true);
        expect(ids.some(id => id.includes('EWL'))).toBe(true);
        expect(ids.some(id => id.includes('DTL'))).toBe(true);
    });
});

describe('Stations data', () => {
    it('is a non-empty array', () => {
        expect(Array.isArray(stations)).toBe(true);
        expect(stations.length).toBeGreaterThan(0);
    });

    it('has at least 200 stations', () => {
        expect(stations.length).toBeGreaterThanOrEqual(200);
    });

    it('all station coordinates are within Singapore bounds', () => {
        for (const s of stations) {
            if (!s.coord) {
                continue;
            }
            const [lng, lat] = s.coord;
            expect(lng).toBeGreaterThan(103.5);
            expect(lng).toBeLessThan(104.2);
            expect(lat).toBeGreaterThan(1.1);
            expect(lat).toBeLessThan(1.5);
        }
    });

    it('each station has an id and title', () => {
        for (const s of stations) {
            expect(s).toHaveProperty('id');
            expect(s).toHaveProperty('title');
        }
    });

    it('station railway references exist in railways', () => {
        const railwayIds = new Set(railways.map(r => r.id));
        for (const s of stations) {
            if (s.railway) {
                expect(railwayIds.has(s.railway)).toBe(true);
            }
        }
    });
});

describe('Exits data', () => {
    it('is a non-empty array', () => {
        expect(Array.isArray(exits)).toBe(true);
        expect(exits.length).toBeGreaterThan(0);
    });

    it('has expected number of exits (~591)', () => {
        expect(exits.length).toBeGreaterThanOrEqual(500);
    });

    it('each exit has coordinates within Singapore', () => {
        for (const e of exits) {
            if (!e.coord) {
                continue;
            }
            const [lng, lat] = e.coord;
            expect(lng).toBeGreaterThan(103.5);
            expect(lng).toBeLessThan(104.2);
            expect(lat).toBeGreaterThan(1.1);
            expect(lat).toBeLessThan(1.5);
        }
    });
});
