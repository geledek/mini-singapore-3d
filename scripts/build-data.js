#!/usr/bin/env node

/**
 * Master script to build all Singapore transport data files
 *
 * This script orchestrates the conversion of various data sources
 * into the format required by Mini Singapore 3D.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('==================================================');
console.log('  Mini Singapore 3D - Data Build Script');
console.log('==================================================\n');

const scripts = [
    {
        name: 'Operators',
        script: 'convert-operators.js',
        output: 'operators.json'
    },
    {
        name: 'Railways',
        script: 'convert-railways.js',
        output: 'railways.json'
    },
    {
        name: 'Stations',
        script: 'convert-stations.js',
        output: 'stations.json'
    }
];

let successCount = 0;
let errorCount = 0;

for (const item of scripts) {
    console.log(`\n[${ item.name}]`);
    console.log('─'.repeat(50));

    try {
        const scriptPath = path.join(__dirname, item.script);
        execSync(`node "${scriptPath}"`, {
            stdio: 'inherit',
            cwd: __dirname
        });

        // Verify output file was created
        const outputPath = path.join(__dirname, '../data', item.output);
        if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log(`  ✓ Created ${item.output} (${stats.size} bytes)`);
            successCount++;
        } else {
            console.log(`  ✗ Failed to create ${item.output}`);
            errorCount++;
        }
    } catch (error) {
        console.error(`  ✗ Error running ${item.script}:`, error.message);
        errorCount++;
    }
}

console.log('\n' + '='.repeat(50));
console.log('  Build Summary');
console.log('='.repeat(50));
console.log(`  Success: ${successCount}/${scripts.length}`);
console.log(`  Errors:  ${errorCount}`);
console.log('='.repeat(50));

if (errorCount > 0) {
    console.log('\n⚠️  Some data files failed to generate.');
    process.exit(1);
} else {
    console.log('\n✓ All data files generated successfully!');
    console.log('\nNext steps:');
    console.log('  1. Review the generated files in the data/ directory');
    console.log('  2. Add route coordinates (coordinates.json)');
    console.log('  3. Generate timetable data');
    console.log('  4. Compress files with gzip');
    console.log('  5. Update src/loader.js to use Singapore data\n');
}
