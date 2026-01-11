import {loadJSON, saveJSON} from './helpers';

export default async function() {

    const data = await loadJSON('data/station-buildings.json');

    saveJSON('build/data/station-buildings.json.gz', data);

    console.log(`Station buildings data was loaded (${data.features.length} buildings)`);

}
