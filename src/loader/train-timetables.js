import {loadJSON, saveJSON, readdir} from './helpers';

async function process(data, calendar, postfix, fallbackCalendar) {

    let filteredData = data.filter(item =>
        item.id.endsWith(`.${calendar}`) || item.id.includes(`.${calendar}.`)
    );

    if (!filteredData.length && fallbackCalendar) {
        console.warn(`${calendar} train timetable missing, falling back to ${fallbackCalendar}`);
        filteredData = data.filter(item =>
            item.id.endsWith(`.${fallbackCalendar}`) || item.id.includes(`.${fallbackCalendar}.`)
        );
    }

    saveJSON(`build/data/timetable-${postfix}.json.gz`, filteredData);

    console.log(`${calendar} train timetable data was loaded (${filteredData.length} entries)`);
}

export default async function() {

    const files = await readdir('data/train-timetables');

    const data = [];

    for (const file of files) {
        data.push(...await loadJSON(`data/train-timetables/${file}`));
    }

    await process(data, 'Weekday', 'weekday');
    await process(data, 'Saturday', 'saturday', 'Weekday');
    await process(data, 'Holiday', 'sunday-holiday', 'Weekday');
    await process(data, 'SaturdayHoliday', 'holiday', 'Weekday');

}
