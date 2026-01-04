#!/usr/bin/env node

/**
 * Process HTML files and replace environment variable placeholders
 * Usage: node scripts/process-html.js
 */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env files in priority order so CI (.vercel) values override defaults
const envFiles = [
	'.env.local',
	'.env',
	'.vercel/.env.production.local'
];
for (const envFile of envFiles) {
	const fullPath = path.join(__dirname, '..', envFile);
	if (fs.existsSync(fullPath)) {
		dotenv.config({path: fullPath, override: true});
	}
}

// Read the source HTML
const htmlPath = path.join(__dirname, '../public/index.html');
const outputPath = path.join(__dirname, '../build/index.html');

let html = fs.readFileSync(htmlPath, 'utf8');

// Replace placeholders with environment variables
html = html.replace(/__GOOGLE_ANALYTICS_ID__/g, process.env.GOOGLE_ANALYTICS_ID || 'G-XXXXXXXXXX');
html = html.replace(/__MAPBOX_ACCESS_TOKEN__/g, process.env.MAPBOX_ACCESS_TOKEN || '');
html = html.replace(/__SHARE_URL__/g, process.env.SHARE_URL || 'http://localhost:8080');

// Ensure build directory exists
const buildDir = path.dirname(outputPath);
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir, { recursive: true });
}

// Write processed HTML
fs.writeFileSync(outputPath, html);

console.log('✓ Processed index.html with environment variables');
console.log(`  Output: ${outputPath}`);
