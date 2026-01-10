// Automated diagnosis of why only NSL trains are visible
const puppeteer = require('puppeteer');

async function diagnose() {
	console.log('🔍 Starting automated train diagnosis...\n');

	const browser = await puppeteer.launch({
		headless: false,
		devtools: false,
		defaultViewport: null,
		args: ['--start-maximized']
	});

	const pages = await browser.pages();
	const page = pages[0];

	try {
		console.log('🌐 Loading app...');
		await page.goto('http://localhost:8080', {
			waitUntil: 'domcontentloaded',
			timeout: 30000
		});

		// Wait for map to initialize using waitForFunction
		await page.waitForFunction(() => window.map && window.map.timetables, {
			timeout: 30000
		});

		console.log('✅ App loaded\n');

		// Run diagnostics
		const results = await page.evaluate(() => {
			const now = window.map.clock.getTimeOffset(); // Use clock offset, not Date.now()!
			const fullTime = window.map.clock.getTime();
			const timetables = Array.from(window.map.timetables.getAll());
			const activeTrains = Array.from(window.map.activeTrainLookup.values());

			// Group timetables by railway
			const timetablesByRailway = {};
			timetables.forEach(t => {
				const railwayId = t.r.id;
				if (!timetablesByRailway[railwayId]) timetablesByRailway[railwayId] = [];
				timetablesByRailway[railwayId].push(t);
			});

			// Group active trains by railway
			const activeByRailway = {};
			activeTrains.forEach(t => {
				const railwayId = t.r.id;
				if (!activeByRailway[railwayId]) activeByRailway[railwayId] = [];
				activeByRailway[railwayId].push(t);
			});

			// Check time windows for each railway
			const railwayAnalysis = {};
			Object.keys(timetablesByRailway).forEach(railwayId => {
				const tt = timetablesByRailway[railwayId];
				const inTimeWindow = tt.filter(t => now >= t.start && now <= t.end);
				const active = activeByRailway[railwayId] || [];

				// Get sample timetable
				const sample = tt[0];

				railwayAnalysis[railwayId] = {
					totalTimetables: tt.length,
					inTimeWindow: inTimeWindow.length,
					activeTrains: active.length,
					sampleStart: sample ? new Date(sample.start).toLocaleTimeString() : 'N/A',
					sampleEnd: sample ? new Date(sample.end).toLocaleTimeString() : 'N/A',
					sampleDirection: sample && sample.d ? sample.d.id : 'MISSING',
					hasActiveTrain: active.length > 0,
					activeSample: active.length > 0 ? {
						id: active[0].t,
						hasTimetable: !!active[0].timetable,
						type: active[0].type
					} : null
				};
			});

			return {
				currentTime: new Date(fullTime).toLocaleTimeString(),
				currentTimeOffset: now,
				totalTimetables: timetables.length,
				totalActiveTrains: activeTrains.length,
				railwayAnalysis
			};
		});

		// Display results
		console.log('📊 DIAGNOSIS RESULTS');
		console.log('='.repeat(80));
		console.log(`Current time: ${results.currentTime}`);
		console.log(`Current time offset: ${results.currentTimeOffset} ms (${Math.floor(results.currentTimeOffset / 3600000)}h ${Math.floor((results.currentTimeOffset % 3600000) / 60000)}m from 3 AM)`);
		console.log(`Total timetables loaded: ${results.totalTimetables}`);
		console.log(`Total active trains: ${results.totalActiveTrains}`);
		console.log('');

		console.log('Per Railway Analysis:');
		console.log('-'.repeat(80));

		Object.keys(results.railwayAnalysis).sort().forEach(railwayId => {
			const analysis = results.railwayAnalysis[railwayId];
			console.log(`\n${railwayId}:`);
			console.log(`  Timetables loaded: ${analysis.totalTimetables}`);
			console.log(`  In time window: ${analysis.inTimeWindow}`);
			console.log(`  Active trains: ${analysis.activeTrains} ${analysis.activeTrains > 0 ? '✅' : '❌'}`);
			console.log(`  Sample time: ${analysis.sampleStart} - ${analysis.sampleEnd}`);
			console.log(`  Sample direction: ${analysis.sampleDirection}`);

			if (analysis.activeSample) {
				console.log(`  Active train info:`);
				console.log(`    ID: ${analysis.activeSample.id}`);
				console.log(`    Has timetable: ${analysis.activeSample.hasTimetable}`);
				console.log(`    Type: ${analysis.activeSample.type}`);
			}
		});

		console.log('\n' + '='.repeat(80));
		console.log('\n🔍 DIAGNOSIS:');

		// Analyze the problem
		const hasTimeWindowIssue = Object.values(results.railwayAnalysis).some(a =>
			a.totalTimetables > 0 && a.inTimeWindow === 0 && a.activeTrains === 0
		);

		const nslAnalysis = results.railwayAnalysis['SMRT.NSL'];

		if (hasTimeWindowIssue) {
			console.log('❌ ISSUE: Time window problem detected');
			console.log('   All timetables have expired (ended earlier in the day)');
			console.log('   Current time is outside all train schedules');

			if (nslAnalysis && nslAnalysis.activeTrains > 0 && nslAnalysis.inTimeWindow === 0) {
				console.log('\n⚠️  NSL trains are active despite expired timetables');
				console.log('   This suggests NSL might be using real-time data or a different mechanism');
			}
		}

		console.log('\n💡 SOLUTION:');
		console.log('   The timetable generator creates trains with 2-hour windows.');
		console.log('   Need to either:');
		console.log('   1. Generate trains covering full operating hours (5:30 AM - 11:30 PM)');
		console.log('   2. Make trains repeat throughout the day');
		console.log('   3. Use the app\'s time control to set time to morning/afternoon');

		console.log('\n⏳ Keeping browser open for 10 seconds...');
		await new Promise(resolve => setTimeout(resolve, 10000));

		await browser.close();
		console.log('\n✅ Diagnosis complete!');

	} catch (error) {
		console.error('\n💥 Error during diagnosis:', error.message);
		await browser.close();
		process.exit(1);
	}
}

diagnose().catch(console.error);
