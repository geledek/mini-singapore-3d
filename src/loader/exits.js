import {loadJSON, saveJSON} from './helpers';

export default async function() {

    const data = await loadJSON('data/exits.json');

    saveJSON('build/data/exits.json.gz', data);

    console.log(`Station exits data was loaded (${data.length} exits)`);

}
