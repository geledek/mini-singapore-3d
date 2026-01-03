// Generate train timetables for North-South Line
const fs = require('fs');
const path = require('path');

// Station sequence for NSL (northbound)
const northboundStations = [
  "SMRT.NSL.MarinaSouthPier",
  "SMRT.NSL.MarinaBay",
  "SMRT.NSL.RafflesPlace",
  "SMRT.NSL.CityHall",
  "SMRT.NSL.DhobyGhaut",
  "SMRT.NSL.Somerset",
  "SMRT.NSL.Orchard",
  "SMRT.NSL.Newton",
  "SMRT.NSL.Novena",
  "SMRT.NSL.ToaPayoh",
  "SMRT.NSL.Braddell",
  "SMRT.NSL.Bishan",
  "SMRT.NSL.AngMoKio",
  "SMRT.NSL.YioChuKang",
  "SMRT.NSL.Khatib",
  "SMRT.NSL.Yishun",
  "SMRT.NSL.Sembawang",
  "SMRT.NSL.Admiralty",
  "SMRT.NSL.Woodlands",
  "SMRT.NSL.Marsiling",
  "SMRT.NSL.Kranji",
  "SMRT.NSL.YewTee",
  "SMRT.NSL.ChoaChuKang",
  "SMRT.NSL.BukitGombak",
  "SMRT.NSL.BukitBatok",
  "SMRT.NSL.JurongEast"
];

// Average time between stations (in minutes)
const avgTravelTime = 2;
const avgStopTime = 1;

function formatTime(hours, minutes) {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function generateTrain(trainNumber, startHour, startMinute, direction = 'northbound') {
  const stations = direction === 'northbound' ? northboundStations : [...northboundStations].reverse();
  const directionId = direction === 'northbound' ? 'SMRT.NSL.Northbound' : 'SMRT.NSL.Southbound';
  const directionName = direction === 'northbound' ? 'Northbound' : 'Southbound';

  const train = {
    id: `SMRT.NSL.${String(trainNumber).padStart(3, '0')}.Weekday`,
    t: `SMRT.NSL.T${String(trainNumber).padStart(3, '0')}`,
    r: "SMRT.NSL",
    n: String(trainNumber).padStart(3, '0'),
    y: "default",
    d: directionId,
    os: [stations[0]],
    ds: [stations[stations.length - 1]],
    tt: []
  };

  let currentHour = startHour;
  let currentMinute = startMinute;

  stations.forEach((station, index) => {
    const stop = { s: station };

    if (index === 0) {
      // First station - departure only
      stop.d = formatTime(currentHour, currentMinute);
    } else if (index === stations.length - 1) {
      // Last station - arrival only
      currentMinute += avgTravelTime;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
      stop.a = formatTime(currentHour, currentMinute);
    } else {
      // Middle stations - arrival and departure
      currentMinute += avgTravelTime;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
      stop.a = formatTime(currentHour, currentMinute);

      currentMinute += avgStopTime;
      if (currentMinute >= 60) {
        currentHour += Math.floor(currentMinute / 60);
        currentMinute = currentMinute % 60;
      }
      stop.d = formatTime(currentHour, currentMinute);
    }

    train.tt.push(stop);
  });

  return train;
}

// Generate trains throughout the day
const trains = [];
let trainNumber = 1;

// Operating hours: 5:30 AM to 11:30 PM
// Generate trains every 5 minutes during peak hours (7-9 AM, 5-8 PM)
// Generate trains every 10 minutes during off-peak hours

const schedule = [
  { start: 5.5, end: 7, interval: 10 },   // Early morning - 10 min
  { start: 7, end: 9, interval: 5 },       // Morning peak - 5 min
  { start: 9, end: 17, interval: 8 },      // Midday - 8 min
  { start: 17, end: 20, interval: 5 },     // Evening peak - 5 min
  { start: 20, end: 23.5, interval: 10 }   // Late evening - 10 min
];

schedule.forEach(({ start, end, interval }) => {
  const startHour = Math.floor(start);
  const startMinute = (start % 1) * 60;
  const endHour = Math.floor(end);
  const endMinute = (end % 1) * 60;

  let hour = startHour;
  let minute = startMinute;

  while (hour < endHour || (hour === endHour && minute <= endMinute)) {
    // Northbound train
    trains.push(generateTrain(trainNumber++, hour, minute, 'northbound'));

    // Southbound train (offset by half the interval)
    const offsetMinute = minute + Math.floor(interval / 2);
    const offsetHour = hour + Math.floor(offsetMinute / 60);
    trains.push(generateTrain(trainNumber++, offsetHour, offsetMinute % 60, 'southbound'));

    // Next departure
    minute += interval;
    if (minute >= 60) {
      hour += Math.floor(minute / 60);
      minute = minute % 60;
    }
  }
});

console.log(`Generated ${trains.length} trains`);

// Write to file
const outputPath = path.join(__dirname, '../data/train-timetables/smrt-nsl.json');
fs.writeFileSync(outputPath, JSON.stringify(trains, null, '\t'));

console.log(`Wrote timetable to ${outputPath}`);
