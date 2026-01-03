/**
 * Singapore Public Holidays
 * Based on official public holidays in Singapore
 * Note: Some holidays are based on lunar calendar and vary each year
 */

const FIXED_HOLIDAYS = [
    {month: 1, day: 1},   // New Year's Day
    {month: 5, day: 1},   // Labour Day
    {month: 8, day: 9},   // National Day
    {month: 12, day: 25}  // Christmas Day
];

// Variable holidays by year (lunar calendar based)
// These need to be updated annually
const VARIABLE_HOLIDAYS = {
    2025: [
        {month: 1, day: 29},  // Chinese New Year
        {month: 1, day: 30},  // Chinese New Year
        {month: 3, day: 31},  // Hari Raya Puasa (estimated)
        {month: 4, day: 18},  // Good Friday
        {month: 5, day: 12},  // Vesak Day
        {month: 6, day: 7},   // Hari Raya Haji (estimated)
        {month: 10, day: 20}, // Deepavali (estimated)
    ],
    2026: [
        {month: 2, day: 17},  // Chinese New Year
        {month: 2, day: 18},  // Chinese New Year
        {month: 3, day: 20},  // Hari Raya Puasa (estimated)
        {month: 4, day: 3},   // Good Friday
        {month: 5, day: 1},   // Vesak Day (falls on Labour Day)
        {month: 5, day: 27},  // Hari Raya Haji (estimated)
        {month: 11, day: 8},  // Deepavali (estimated)
    ],
    2027: [
        {month: 2, day: 6},   // Chinese New Year
        {month: 2, day: 7},   // Chinese New Year (Sunday)
        {month: 2, day: 8},   // Chinese New Year (in lieu)
        {month: 3, day: 9},   // Hari Raya Puasa (estimated)
        {month: 3, day: 26},  // Good Friday
        {month: 5, day: 21},  // Vesak Day
        {month: 5, day: 16},  // Hari Raya Haji (estimated)
        {month: 10, day: 28}, // Deepavali (estimated)
    ]
};

function isHoliday(date) {
    if (!(date instanceof Date)) {
        return false;
    }

    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const day = date.getDate();
    const year = date.getFullYear();

    // Check fixed holidays
    for (const holiday of FIXED_HOLIDAYS) {
        if (holiday.month === month && holiday.day === day) {
            return true;
        }
    }

    // Check variable holidays for the specific year
    const yearHolidays = VARIABLE_HOLIDAYS[year];
    if (yearHolidays) {
        for (const holiday of yearHolidays) {
            if (holiday.month === month && holiday.day === day) {
                return true;
            }
        }
    }

    return false;
}

export default {
    isHoliday
};
