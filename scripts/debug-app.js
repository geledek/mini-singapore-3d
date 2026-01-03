// Open Mini Singapore 3D in browser with DevTools for debugging
// Run with: node scripts/debug-app.js

const puppeteer = require('puppeteer');

async function debugApp() {
	console.log('🔍 Opening app with DevTools for debugging...\n');

	const browser = await puppeteer.launch({
		headless: false,
		devtools: true, // Automatically open DevTools
		defaultViewport: null,
		args: [
			'--start-maximized',
			'--disable-web-security', // Allow CORS for local testing
			'--disable-features=IsolateOrigins,site-per-process'
		]
	});

	const pages = await browser.pages();
	const page = pages[0];

	// Capture ALL console messages with full details
	page.on('console', async msg => {
		const type = msg.type();
		const location = msg.location();
		const text = msg.text();

		// Color codes for terminal output
		const colors = {
			error: '\x1b[31m', // Red
			warning: '\x1b[33m', // Yellow
			info: '\x1b[36m', // Cyan
			log: '\x1b[37m', // White
			reset: '\x1b[0m'
		};

		const color = colors[type] || colors.log;
		const emoji = {
			error: '❌',
			warning: '⚠️ ',
			info: 'ℹ️ ',
			log: '📝'
		}[type] || '📝';

		// Format console output
		console.log(`${color}${emoji} [${type.toUpperCase()}] ${text}${colors.reset}`);

		if (location.url) {
			console.log(`   📍 ${location.url}:${location.lineNumber}`);
		}

		// Try to get the actual error object if available
		try {
			const args = await Promise.all(msg.args().map(arg => arg.jsonValue()));
			if (args.length > 1 || (args[0] && typeof args[0] === 'object')) {
				console.log(`   📦 Details:`, JSON.stringify(args, null, 2));
			}
		} catch (e) {
			// Ignore if we can't serialize
		}
	});

	// Capture page errors (uncaught exceptions)
	page.on('pageerror', error => {
		console.log('\n🚨 UNCAUGHT EXCEPTION:');
		console.log(`   ${error.message}`);
		console.log(`   Stack: ${error.stack}\n`);
	});

	// Capture network errors
	page.on('requestfailed', request => {
		console.log(`\n🔴 NETWORK FAILURE:`);
		console.log(`   URL: ${request.url()}`);
		console.log(`   Method: ${request.method()}`);
		console.log(`   Error: ${request.failure().errorText}\n`);
	});

	// Capture network requests (for debugging data loading)
	page.on('response', async response => {
		const url = response.url();
		const status = response.status();

		// Only log relevant files
		if (url.includes('.json.gz') || url.includes('timetable')) {
			const statusEmoji = status === 200 ? '✅' : status === 304 ? '♻️ ' : '❌';
			console.log(`${statusEmoji} ${status} ${url.split('/').pop()}`);

			// If it's a timetable file, show size
			if (url.includes('timetable')) {
				const headers = response.headers();
				const size = headers['content-length'] || 'unknown';
				console.log(`   📦 Size: ${size} bytes`);
			}
		}
	});

	try {
		console.log('🌐 Loading http://localhost:8080...');
		console.log('📊 Monitoring console, network, and errors...\n');
		console.log('=' . repeat(80));
		console.log('\n');

		await page.goto('http://localhost:8080', {
			waitUntil: 'domcontentloaded',
			timeout: 60000
		});

		// Wait a bit to see loading behavior
		await page.waitForTimeout(5000);

		// Check current state
		console.log('\n');
		console.log('=' . repeat(80));
		console.log('\n🔎 Checking app state after 5 seconds...\n');

		const state = await page.evaluate(() => {
			try {
				return {
					mapExists: !!window.map,
					initialized: window.map?.initialized,
					railways: window.map?.railways ? Array.from(window.map.railways.getAll?.() || []).length : 'error',
					stations: window.map?.stations ? Array.from(window.map.stations.getAll?.() || []).length : 'error',
					timetables: window.map?.timetables?.getAll?.()?.length || 'error',
					activeTrains: window.map?.activeTrainLookup?.size,
					errors: window.__errors || []
				};
			} catch (e) {
				return { error: e.message, stack: e.stack };
			}
		});

		console.log('App State:');
		console.log(JSON.stringify(state, null, 2));

		console.log('\n✨ Browser and DevTools are open.');
		console.log('💡 Check the Console tab in DevTools for detailed errors.');
		console.log('💡 Check the Network tab to see which files loaded/failed.');
		console.log('\n⏸️  Keeping browser open. Press Ctrl+C to close.\n');

	} catch (error) {
		console.error('\n💥 Failed to load page:', error.message);
		console.error(error.stack);
	}

	// Don't close - let user inspect
	// await browser.close();
}

// Handle Ctrl+C gracefully
process.on('SIGINT', () => {
	console.log('\n\n👋 Closing browser...');
	process.exit(0);
});

debugApp().catch(error => {
	console.error('💥 Script error:', error);
	process.exit(1);
});
