import {describe, it, expect, vi, beforeEach} from 'vitest';

// Mock performance.now since Clock uses it
vi.stubGlobal('performance', {now: () => 0});

// Must import after mocking
const {default: Clock} = await import('../src/clock.js');

describe('Clock', () => {
    let clock;

    beforeEach(() => {
        clock = new Clock(new Date('2026-04-27T10:00:00'), 1, -480);
    });

    it('creates with SGT timezone offset', () => {
        expect(clock.getTimezoneOffset()).toBe(-480);
    });

    it('setSpeed changes speed', () => {
        clock.setSpeed(2);
        expect(clock.speed).toBe(2);
    });

    it('setSpeed ignores NaN', () => {
        clock.setSpeed(NaN);
        expect(clock.speed).toBe(1);
    });

    it('reset sets speed to 1', () => {
        clock.setSpeed(5);
        clock.reset();
        expect(clock.speed).toBe(1);
    });

    it('setTimezoneOffset changes offset', () => {
        clock.setTimezoneOffset(-540); // JST
        expect(clock.getTimezoneOffset()).toBe(-540);
    });

    it('getDate returns a Date object', () => {
        const date = clock.getDate();
        expect(date).toBeInstanceOf(Date);
    });

    describe('getCalendar', () => {
        it('returns Weekday for a known weekday', () => {
            // 2026-04-27 is a Monday
            const weekdayClock = new Clock(new Date('2026-04-27T10:00:00'), 1, -480);
            expect(weekdayClock.getCalendar()).toBe('Weekday');
        });

        it('returns Saturday for a Saturday', () => {
            // 2026-05-02 is a Saturday
            const satClock = new Clock(new Date('2026-05-02T10:00:00'), 1, -480);
            expect(satClock.getCalendar()).toBe('Saturday');
        });

        it('returns Holiday for a Sunday', () => {
            // 2026-04-26 is a Sunday
            const sunClock = new Clock(new Date('2026-04-26T10:00:00'), 1, -480);
            expect(sunClock.getCalendar()).toBe('Holiday');
        });

        it('returns Holiday for a public holiday', () => {
            // 2026-01-01 is New Year's Day (Thursday)
            const holClock = new Clock(new Date('2026-01-01T10:00:00'), 1, -480);
            expect(holClock.getCalendar()).toBe('Holiday');
        });

        it('returns Holiday for National Day', () => {
            // 2026-08-09 is National Day (Sunday, also a holiday)
            const ndClock = new Clock(new Date('2026-08-09T10:00:00'), 1, -480);
            expect(ndClock.getCalendar()).toBe('Holiday');
        });
    });

    describe('getTimeString', () => {
        it('formats time as hh:mm', () => {
            const ts = clock.getTimeString(clock.getTime());
            expect(ts).toMatch(/^\d{2}:\d{2}$/);
        });
    });

    describe('getLocalTimezoneOffset', () => {
        it('returns a number', () => {
            expect(typeof clock.getLocalTimezoneOffset()).toBe('number');
        });
    });
});
