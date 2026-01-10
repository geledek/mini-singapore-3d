// Test why trains won't start for non-NSL lines
const puppeteer = require('puppeteer');

async function testTrainStart() {
	console.log('🔍 Testing train start for different railways...\n');

	const browser = await puppeteer.launch({
		headless: false,
		devtools: true,
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

		await page.waitForFunction(() => window.map && window.map.timetables, {
			timeout: 30000
		});

		console.log('✅ App loaded\n');

		// Inject logging into setSectionData
		await page.evaluate(() => {
			const originalSetSectionData = window.map.setSectionData.bind(window.map);
			window.map.setSectionData = function(train, index) {
				const result = originalSetSectionData(train, index);
				if (!result && train.r.id !== 'SMRT.NSL') {
					console.log(`❌ setSectionData FAILED for ${train.r.id} train ${train.t || 'unknown'}`);
					console.log('   Train timetable:', train.timetable ? train.timetable.id : 'NO TIMETABLE');
					console.log('   Railway:', train.r.id);
					console.log('   Direction:', train.direction);
				}
				return result;
			};
		});

		// Force refresh trains
		await page.evaluate(() => {
			console.log('🔄 Forcing train refresh...');
			window.map.refreshTrains();
		});

		// Wait a bit for console output
		await new Promise(resolve => setTimeout(resolve, 5000));

		// Get the results
		const results = await page.evaluate(() => {
			const activeByRailway = {};
			Array.from(window.map.activeTrainLookup.values()).forEach(t => {
				const r = t.r.id;
				if (!activeByRailway[r]) activeByRailway[r] = 0;
				activeByRailway[r]++;
			});

			const inTimeWindow = {};
			const now = window.map.clock.getTimeOffset();
			Array.from(window.map.timetables.getAll()).forEach(t => {
				if (now >= t.start && now <= t.end) {
					const r = t.r.id;
					if (!inTimeWindow[r]) inTimeWindow[r] = 0;
					inTimeWindow[r]++;
				}
			});

			return {activeByRailway, inTimeWindow};
		});

		console.log('\n📊 RESULTS:');
		console.log('='.repeat(60));

		const railways = ['SMRT.NSL', 'SMRT.EWL', 'SMRT.CCL', 'SBS.NEL', 'SBS.DTL', 'SMRT.TEL', 'SMRT.BPLRT', 'SBS.SKLRT', 'SBS.PGLRT'];
		railways.forEach(r => {
			const inWindow = results.inTimeWindow[r] || 0;
			const active = results.activeByRailway[r] || 0;
			const status = active > 0 ? '✅' : '❌';
			console.log(`${status} ${r}: ${active}/${inWindow} active`);
		});

		console.log('\n⏳ Check the DevTools console for setSectionData failure details...');
		console.log('Press Ctrl+C when done.\n');

		// Keep open indefinitely
		await new Promise(() => {});

	} catch (error) {
		console.error('\n💥 Error:', error.message);
		await browser.close();
		process.exit(1);
	}
}

testTrainStart().catch(console.error);
