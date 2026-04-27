import {describe, it, expect} from 'vitest';
import {
    lerp,
    clamp,
    includes,
    flat,
    normalize,
    valueOrDefault,
    numberOrDefault,
    isString,
    mergeMaps,
    getTimeString,
    getTimeOffset,
    removePrefix,
    cleanKeys,
    luminance,
    colorToRGBArray,
    pointInTrapezoid
} from '../src/helpers/helpers.js';

describe('lerp', () => {
    it('returns x when a=0', () => {
        expect(lerp(10, 20, 0)).toBe(10);
    });
    it('returns y when a=1', () => {
        expect(lerp(10, 20, 1)).toBe(20);
    });
    it('returns midpoint when a=0.5', () => {
        expect(lerp(0, 100, 0.5)).toBe(50);
    });
    it('works with negative values', () => {
        expect(lerp(-10, 10, 0.5)).toBe(0);
    });
});

describe('clamp', () => {
    it('returns value when in range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
    });
    it('clamps to lower bound', () => {
        expect(clamp(-5, 0, 10)).toBe(0);
    });
    it('clamps to upper bound', () => {
        expect(clamp(15, 0, 10)).toBe(10);
    });
    it('returns boundary when value equals boundary', () => {
        expect(clamp(0, 0, 10)).toBe(0);
        expect(clamp(10, 0, 10)).toBe(10);
    });
});

describe('includes', () => {
    it('finds value in array', () => {
        expect(includes([1, 2, 3], 2)).toBe(true);
    });
    it('returns false for missing value', () => {
        expect(includes([1, 2, 3], 4)).toBe(false);
    });
    it('checks all values when given array', () => {
        expect(includes([1, 2, 3], [1, 2])).toBe(true);
        expect(includes([1, 2, 3], [1, 4])).toBe(false);
    });
    it('works with strings', () => {
        expect(includes('hello', 'ell')).toBe(true);
    });
    it('returns false for non-array/string', () => {
        expect(includes(123, 1)).toBe(false);
        expect(includes(null, 1)).toBe(false);
    });
});

describe('flat', () => {
    it('flattens nested arrays', () => {
        expect(flat([[1, 2], [3, 4]])).toEqual([1, 2, 3, 4]);
    });
    it('handles empty arrays', () => {
        expect(flat([])).toEqual([]);
    });
});

describe('normalize', () => {
    it('removes accents', () => {
        expect(normalize('café')).toBe('cafe');
    });
    it('removes parenthesized text', () => {
        expect(normalize('Station (old name)')).toBe('Station ');
    });
    it('removes angle-bracketed text', () => {
        expect(normalize('Station <code>')).toBe('Station ');
    });
});

describe('valueOrDefault', () => {
    it('returns value when defined', () => {
        expect(valueOrDefault(42, 0)).toBe(42);
    });
    it('returns default when undefined', () => {
        expect(valueOrDefault(undefined, 99)).toBe(99);
    });
    it('returns null (not default) since null is not undefined', () => {
        expect(valueOrDefault(null, 99)).toBe(null);
    });
    it('returns 0 (not default) since 0 is not undefined', () => {
        expect(valueOrDefault(0, 99)).toBe(0);
    });
});

describe('numberOrDefault', () => {
    it('returns number when valid', () => {
        expect(numberOrDefault(42, 0)).toBe(42);
    });
    it('returns default when NaN', () => {
        expect(numberOrDefault(NaN, 99)).toBe(99);
    });
    it('returns 0 when 0', () => {
        expect(numberOrDefault(0, 99)).toBe(0);
    });
});

describe('isString', () => {
    it('returns true for string literal', () => {
        expect(isString('hello')).toBe(true);
    });
    it('returns true for String object', () => {
        expect(isString(new String('hello'))).toBe(true);
    });
    it('returns false for number', () => {
        expect(isString(42)).toBe(false);
    });
    it('returns false for null', () => {
        expect(isString(null)).toBe(false);
    });
});

describe('mergeMaps', () => {
    it('merges multiple maps', () => {
        const a = new Map([['x', 1]]);
        const b = new Map([['y', 2]]);
        const result = mergeMaps(a, b);
        expect(result.get('x')).toBe(1);
        expect(result.get('y')).toBe(2);
    });
    it('later maps override earlier', () => {
        const a = new Map([['x', 1]]);
        const b = new Map([['x', 2]]);
        expect(mergeMaps(a, b).get('x')).toBe(2);
    });
});

describe('getTimeString', () => {
    it('converts 0 offset to 03:00', () => {
        expect(getTimeString(0)).toBe('03:00');
    });
    it('converts 3600000 (1 hour) to 04:00', () => {
        expect(getTimeString(3600000)).toBe('04:00');
    });
    it('converts 21 hours (75600000ms) to 00:00', () => {
        expect(getTimeString(75600000)).toBe('00:00');
    });
    it('handles minutes correctly', () => {
        expect(getTimeString(1800000)).toBe('03:30');
    });
});

describe('getTimeOffset', () => {
    it('converts 03:00 to 0', () => {
        expect(getTimeOffset('03:00')).toBe(0);
    });
    it('converts 04:00 to 3600000', () => {
        expect(getTimeOffset('04:00')).toBe(3600000);
    });
    it('is inverse of getTimeString', () => {
        expect(getTimeOffset(getTimeString(7200000))).toBe(7200000);
    });
});

describe('removePrefix', () => {
    it('removes colon-delimited prefix', () => {
        expect(removePrefix('prefix:value')).toBe('value');
    });
    it('returns value unchanged if no colon', () => {
        expect(removePrefix('value')).toBe('value');
    });
    it('handles arrays recursively', () => {
        expect(removePrefix(['a:b', 'c:d'])).toEqual(['b', 'd']);
    });
    it('returns non-string/non-array values unchanged', () => {
        expect(removePrefix(42)).toBe(42);
    });
});

describe('cleanKeys', () => {
    it('removes undefined keys', () => {
        const obj = {a: 1, b: undefined, c: 3};
        expect(cleanKeys(obj)).toEqual({a: 1, c: 3});
    });
    it('keeps null and falsy values', () => {
        const obj = {a: null, b: 0, c: ''};
        expect(cleanKeys(obj)).toEqual({a: null, b: 0, c: ''});
    });
});

describe('luminance', () => {
    it('returns 0 for black', () => {
        expect(luminance({r: 0, g: 0, b: 0})).toBe(0);
    });
    it('returns ~255 for white', () => {
        expect(luminance({r: 255, g: 255, b: 255})).toBeCloseTo(255, 0);
    });
    it('weights green highest', () => {
        const rOnly = luminance({r: 255, g: 0, b: 0});
        const gOnly = luminance({r: 0, g: 255, b: 0});
        const bOnly = luminance({r: 0, g: 0, b: 255});
        expect(gOnly).toBeGreaterThan(rOnly);
        expect(rOnly).toBeGreaterThan(bOnly);
    });
});

describe('colorToRGBArray', () => {
    it('converts white', () => {
        expect(colorToRGBArray('#ffffff')).toEqual([255, 255, 255]);
    });
    it('converts black', () => {
        expect(colorToRGBArray('#000000')).toEqual([0, 0, 0]);
    });
    it('converts red', () => {
        expect(colorToRGBArray('#ff0000')).toEqual([255, 0, 0]);
    });
    it('converts arbitrary color', () => {
        expect(colorToRGBArray('#1a5276')).toEqual([26, 82, 118]);
    });
});

describe('pointInTrapezoid', () => {
    // Counter-clockwise square (required winding for pointInTrapezoid)
    const square = [[0, 0], [0, 10], [10, 10], [10, 0]];

    it('returns true for point inside', () => {
        expect(pointInTrapezoid([5, 5], square)).toBe(true);
    });
    it('returns false for point outside', () => {
        expect(pointInTrapezoid([15, 5], square)).toBe(false);
    });
});
