const fs = require('fs');
const zlib = require('zlib');

// Read compressed data
const compressed = fs.readFileSync('build/data/timetable-weekday.json.gz');
const data = JSON.parse(zlib.gunzipSync(compressed).toString());

// Find EWL trains that depart around 8 PM
const ewlTrains = data.filter(t => t.r === 'SMRT.EWL');
const eveningTrains = ewlTrains.filter(t => {
  const firstStop = t.tt[0];
  if (!firstStop || !firstStop.d) return false;
  const hour = parseInt(firstStop.d.split(':')[0]);
  return hour === 20; // 8 PM
});

console.log('EWL trains departing at 20:00 (8 PM):', eveningTrains.length);

if (eveningTrains.length > 0) {
  const sample = eveningTrains[0];
  console.log('');
  console.log('Sample 8 PM train:');
  console.log('  ID:', sample.id);
  console.log('  Railway:', sample.r);
  console.log('  Direction:', sample.d);
  console.log('  First departure:', sample.tt[0].d);
  console.log('  Last arrival:', sample.tt[sample.tt.length - 1].a);
  console.log('  Number of stops:', sample.tt.length);
  console.log('');
  console.log('  Full timetable object:');
  console.log(JSON.stringify(sample, null, 2));
}
