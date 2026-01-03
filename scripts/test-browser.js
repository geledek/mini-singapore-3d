// Automated browser test for Mini Singapore 3D
// Run with: node scripts/test-browser.js

const puppeteer = require('puppeteer');

async function testApp() {
	console.log('🚀 Starting browser test...\n');

	const browser = await puppeteer.launch({
		headless: false, // Set to true to run without GUI
		defaultViewport: { width: 1920, height: 1080 }
	});

	const page = await browser.newPage();

	// Capture console messages
	page.on('console', msg => {
		const type = msg.type();
		const text = msg.text();

		if (type === 'error') {
			console.log(`❌ Console Error: ${text}`);
		} else if (type === 'warning') {
			console.log(`⚠️  Console Warning: ${text}`);
		} else if (text.includes('✓') || text.includes('Active trains')) {
			console.log(`📊 ${text}`);
		}
	});

	// Capture network errors
	page.on('requestfailed', request => {
		console.log(`🔴 Network Failed: ${request.url()}`);
	});

	try {
		console.log('🌐 Loading app at http://localhost:8080...\n');
		await page.goto('http://localhost:8080', {
			waitUntil: 'networkidle2',
			timeout: 30000
		});

		console.log('✓ Page loaded\n');

		// Wait for map to initialize
		await page.waitForFunction(() => window.map && window.map.initialized, {
			timeout: 15000
		});

		console.log('✓ Map initialized\n');

		// Run diagnostic checks
		console.log('📋 Running diagnostics...\n');

		const diagnostics = await page.evaluate(() => {
			const feature13 = window.map.featureLookup.get('SMRT.NSL.13');
			const railways = Array.from(window.map.railways.getAll());
			const stations = Array.from(window.map.stations.getAll());
			const timetables = window.map.timetables.getAll();

			return {
				feature13HasStationOffsets: !!feature13?.properties['station-offsets'],
				feature13Coords: feature13?.geometry.coordinates.length,
				railwaysCount: railways.length,
				stationsCount: stations.length,
				timetablesCount: timetables.length,
				activeTrains: window.map.activeTrainLookup?.size,
				standbyTrains: window.map.standbyTrainLookup?.size,
				initialized: window.map.initialized
			};
		});

		console.log('Results:');
		console.log('--------');
		console.log(`✓ Fix working (station-offsets): ${diagnostics.feature13HasStationOffsets ? 'YES' : 'NO'}`);
		console.log(`✓ Feature coords: ${diagnostics.feature13Coords}`);
		console.log(`✓ Railways loaded: ${diagnostics.railwaysCount}`);
		console.log(`✓ Stations loaded: ${diagnostics.stationsCount}`);
		console.log(`✓ Timetables loaded: ${diagnostics.timetablesCount}`);
		console.log(`✓ Active trains: ${diagnostics.activeTrains}`);
		console.log(`✓ Standby trains: ${diagnostics.standbyTrains}`);

		// Check if trains are visible
		console.log('\n🚂 Checking for train visibility...');

		await page.waitForTimeout(3000); // Wait for trains to spawn

		const trainStatus = await page.evaluate(() => {
			return {
				activeTrains: window.map.activeTrainLookup?.size || 0,
				railwayLines: Array.from(window.map.railways.getAll()).map(r => r.id)
			};
		});

		console.log(`✓ Active trains now: ${trainStatus.activeTrains}`);
		console.log(`✓ Railway lines with data: ${trainStatus.railwayLines.join(', ')}`);

		// Take screenshot
		const screenshotPath = 'test-screenshot.png';
		await page.screenshot({ path: screenshotPath, fullPage: false });
		console.log(`\n📸 Screenshot saved: ${screenshotPath}`);

		console.log('\n✅ All tests passed!');

	} catch (error) {
		console.error('\n❌ Test failed:', error.message);

		// Take error screenshot
		await page.screenshot({ path: 'test-error.png' });
		console.log('📸 Error screenshot saved: test-error.png');
	}

	// Keep browser open for inspection (remove this to auto-close)
	console.log('\n⏸️  Browser staying open for inspection. Press Ctrl+C to close.');
	// await browser.close();
}

// Run the test
testApp().catch(console.error);
