import {describe, it, expect} from 'vitest';
import themes from '../src/themes.js';

const REQUIRED_KEYS = ['name', 'description', 'previewColors', 'fog', 'ambient', 'directional', 'sky', 'terrainExaggeration', 'useDynamicLighting'];

describe('Themes', () => {
    const themeNames = Object.keys(themes);

    it('has at least one theme', () => {
        expect(themeNames.length).toBeGreaterThan(0);
    });

    it('includes the default themes', () => {
        expect(themeNames).toContain('dark-cinematic');
        expect(themeNames).toContain('clean-minimalist');
    });

    for (const [key, theme] of Object.entries(themes)) {
        describe(`Theme: ${key}`, () => {
            it('has all required keys', () => {
                for (const reqKey of REQUIRED_KEYS) {
                    expect(theme).toHaveProperty(reqKey);
                }
            });

            it('name is a non-empty string', () => {
                expect(typeof theme.name).toBe('string');
                expect(theme.name.length).toBeGreaterThan(0);
            });

            it('fog has valid structure', () => {
                const {fog} = theme;
                expect(fog).toHaveProperty('range');
                expect(fog).toHaveProperty('color');
                expect(fog.range).toHaveLength(2);
                expect(fog.range[0]).toBeLessThan(fog.range[1]);
            });

            it('ambient light has valid RGB and intensity', () => {
                const {ambient} = theme;
                expect(ambient.r).toBeGreaterThanOrEqual(0);
                expect(ambient.r).toBeLessThanOrEqual(255);
                expect(ambient.g).toBeGreaterThanOrEqual(0);
                expect(ambient.g).toBeLessThanOrEqual(255);
                expect(ambient.b).toBeGreaterThanOrEqual(0);
                expect(ambient.b).toBeLessThanOrEqual(255);
                expect(ambient.intensity).toBeGreaterThanOrEqual(0);
            });

            it('directional light has valid RGB and intensity', () => {
                const {directional} = theme;
                expect(directional.r).toBeGreaterThanOrEqual(0);
                expect(directional.r).toBeLessThanOrEqual(255);
                expect(directional.intensity).toBeGreaterThanOrEqual(0);
                expect(directional.shadowIntensity).toBeGreaterThanOrEqual(0);
            });

            it('terrainExaggeration is positive', () => {
                expect(theme.terrainExaggeration).toBeGreaterThan(0);
            });

            it('useDynamicLighting is a boolean', () => {
                expect(typeof theme.useDynamicLighting).toBe('boolean');
            });

            it('previewColors are valid hex colors', () => {
                for (const color of theme.previewColors) {
                    expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
                }
            });
        });
    }
});
