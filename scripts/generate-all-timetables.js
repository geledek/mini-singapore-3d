// Generate train timetables for all Singapore MRT/LRT lines
const fs = require('fs');
const path = require('path');

// Load railways data
const railwaysData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/railways.json'), 'utf8'));

// Configuration for each line type
const LINE_CONFIGS = {
	'heavy-rail': {
		avgTravelTime: 2,  // minutes between stations
		avgStopTime: 1,    // minutes at each station
		schedule: [
			{ start: 5.5, end: 7, interval: 10 },   // Early morning
			{ start: 7, end: 9, interval: 5 },      // Morning peak
			{ start: 9, end: 17, interval: 8 },     // Midday
			{ start: 17, end: 20, interval: 5 },    // Evening peak
			{ start: 20, end: 23.5, interval: 10 }  // Late evening
		]
	},
	'light-rail': {
		avgTravelTime: 1.5,  // LRT is faster, shorter distances
		avgStopTime: 0.5,    // Shorter stops
		schedule: [
			{ start: 5.5, end: 7, interval: 12 },   // Early morning
			{ start: 7, end: 9, interval: 6 },      // Morning peak
			{ start: 9, end: 17, interval: 10 },    // Midday
			{ start: 17, end: 20, interval: 6 },    // Evening peak
			{ start: 20, end: 23.5, interval: 12 }  // Late evening
		]
	}
};

function formatTime(hours, minutes) {
	return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function generateTrain(railwayId, trainNumber, startHour, startMinute, direction, stations, directionId, config) {
	const stationList = direction === 'ascending' ? [...stations].reverse() : stations;

	const train = {
		id: `${railwayId}.${String(trainNumber).padStart(3, '0')}.Weekday`,
		t: `${railwayId}.T${String(trainNumber).padStart(3, '0')}`,
		r: railwayId,
		n: String(trainNumber).padStart(3, '0'),
		y: "default",
		d: directionId,
		os: [stationList[0]],
		ds: [stationList[stationList.length - 1]],
		tt: []
	};

	let currentHour = startHour;
	let currentMinute = startMinute;

	stationList.forEach((station, index) => {
		const stop = { s: station };

		if (index === 0) {
			// First station - departure only
			stop.d = formatTime(currentHour, currentMinute);
		} else if (index === stationList.length - 1) {
			// Last station - arrival only
			currentMinute += config.avgTravelTime;
			if (currentMinute >= 60) {
				currentHour += Math.floor(currentMinute / 60);
				currentMinute = currentMinute % 60;
			}
			stop.a = formatTime(currentHour, currentMinute);
		} else {
			// Middle stations - arrival and departure
			currentMinute += config.avgTravelTime;
			if (currentMinute >= 60) {
				currentHour += Math.floor(currentMinute / 60);
				currentMinute = currentMinute % 60;
			}
			stop.a = formatTime(currentHour, currentMinute);

			currentMinute += config.avgStopTime;
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

function generateTimetableForLine(railway) {
	const config = LINE_CONFIGS[railway.type];
	if (!config) {
		console.error(`Unknown railway type: ${railway.type}`);
		return [];
	}

	const trains = [];
	let trainNumber = 1;

	config.schedule.forEach(({ start, end, interval }) => {
		const startHour = Math.floor(start);
		const startMinute = (start % 1) * 60;
		const endHour = Math.floor(end);
		const endMinute = (end % 1) * 60;

		let hour = startHour;
		let minute = startMinute;

		while (hour < endHour || (hour === endHour && minute <= endMinute)) {
			// Ascending direction train
			trains.push(generateTrain(
				railway.id,
				trainNumber++,
				hour,
				minute,
				'ascending',
				railway.stations,
				railway.ascending,
				config
			));

			// Descending direction train (offset by half the interval)
			const offsetMinute = minute + Math.floor(interval / 2);
			const offsetHour = hour + Math.floor(offsetMinute / 60);
			trains.push(generateTrain(
				railway.id,
				trainNumber++,
				offsetHour,
				offsetMinute % 60,
				'descending',
				railway.stations,
				railway.descending,
				config
			));

			// Next departure
			minute += interval;
			if (minute >= 60) {
				hour += Math.floor(minute / 60);
				minute = minute % 60;
			}
		}
	});

	return trains;
}

// Process each railway line
const allTrains = [];

railwaysData.forEach(railway => {
	// Skip NSL as it already has data
	if (railway.id === 'SMRT.NSL') {
		console.log(`Skipping ${railway.id} (already exists)`);
		return;
	}

	console.log(`Generating timetable for ${railway.id} (${railway.title.en})...`);
	const trains = generateTimetableForLine(railway);

	// Write individual line file
	const lineFileName = railway.id.toLowerCase().replace(/\./g, '-') + '.json';
	const outputPath = path.join(__dirname, '../data/train-timetables', lineFileName);
	fs.writeFileSync(outputPath, JSON.stringify(trains, null, '\t'));
	console.log(`  ✓ Generated ${trains.length} trains → ${lineFileName}`);

	// Add to combined array
	allTrains.push(...trains);
});

console.log(`\n✓ Total trains generated: ${allTrains.length}`);
console.log(`✓ Files created in data/train-timetables/`);
