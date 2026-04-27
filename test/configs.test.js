import {describe, it, expect} from 'vitest';
import configs from '../src/configs.js';
import themes from '../src/themes.js';

describe('Configs', () => {
    describe('Default theme', () => {
        it('defaultTheme references a valid theme', () => {
            expect(themes).toHaveProperty(configs.defaultTheme);
        });
    });

    describe('Default center (Singapore)', () => {
        it('longitude is within Singapore bounds', () => {
            const [lng] = configs.defaultCenter;
            expect(lng).toBeGreaterThan(103.5);
            expect(lng).toBeLessThan(104.1);
        });
        it('latitude is within Singapore bounds', () => {
            const [, lat] = configs.defaultCenter;
            expect(lat).toBeGreaterThan(1.1);
            expect(lat).toBeLessThan(1.5);
        });
    });

    describe('Computed physics values', () => {
        it('maxSpeed is positive', () => {
            expect(configs.maxSpeed).toBeGreaterThan(0);
        });
        it('acceleration is positive', () => {
            expect(configs.acceleration).toBeGreaterThan(0);
        });
        it('maxAccelerationTime is positive', () => {
            expect(configs.maxAccelerationTime).toBeGreaterThan(0);
        });
        it('maxAccDistance is positive', () => {
            expect(configs.maxAccDistance).toBeGreaterThan(0);
        });
        it('maxFlightSpeed is greater than maxSpeed', () => {
            expect(configs.maxFlightSpeed).toBeGreaterThan(configs.maxSpeed);
        });
        it('maxBusSpeed is less than maxSpeed', () => {
            expect(configs.maxBusSpeed).toBeLessThan(configs.maxSpeed);
        });
    });

    describe('Timing constants', () => {
        it('standingDuration is a positive number', () => {
            expect(configs.standingDuration).toBeGreaterThan(0);
        });
        it('minStandingDuration <= standingDuration', () => {
            expect(configs.minStandingDuration).toBeLessThanOrEqual(configs.standingDuration);
        });
        it('transitionDuration is positive', () => {
            expect(configs.transitionDuration).toBeGreaterThan(0);
        });
    });

    describe('Languages', () => {
        it('includes English', () => {
            expect(configs.langs).toContain('en');
        });
        it('includes Chinese Simplified', () => {
            expect(configs.langs).toContain('zh-Hans');
        });
        it('includes Malay', () => {
            expect(configs.langs).toContain('ms');
        });
        it('includes Tamil', () => {
            expect(configs.langs).toContain('ta');
        });
    });

    describe('View defaults', () => {
        it('defaultZoom is a reasonable value', () => {
            expect(configs.defaultZoom).toBeGreaterThanOrEqual(10);
            expect(configs.defaultZoom).toBeLessThanOrEqual(16);
        });
        it('defaultPitch is between 0 and 85', () => {
            expect(configs.defaultPitch).toBeGreaterThanOrEqual(0);
            expect(configs.defaultPitch).toBeLessThanOrEqual(85);
        });
        it('defaultViewMode is ground or underground', () => {
            expect(['ground', 'underground']).toContain(configs.defaultViewMode);
        });
    });
});
