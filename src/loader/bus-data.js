import {loadJSON, saveJSON} from './helpers';

export default async function() {

    const data = await loadJSON('data/bus-data.json');

    saveJSON('build/data/bus-data.json.gz', data);

    console.log(`Bus data was loaded (${data.trips.length} trips, ${data.stops.length} stops)`);

}
