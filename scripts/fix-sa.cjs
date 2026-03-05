/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const { execSync } = require('child_process');

const jsonFile = 'aerofren-6aac6-800d36ad5444.json';
const raw = fs.readFileSync(jsonFile, 'utf8').trim();

// Validate it's real JSON first
let parsed;
try {
    parsed = JSON.parse(raw);
    console.log('✅ JSON valid. project_id:', parsed.project_id);
    console.log('   client_email:', parsed.client_email);
} catch (e) {
    console.error('❌ JSON invalid:', e.message);
    process.exit(1);
}

// Encode cleanly
const cleanB64 = Buffer.from(raw).toString('base64');

// Verify round-trip
try {
    JSON.parse(Buffer.from(cleanB64, 'base64').toString('utf8'));
    console.log('✅ Round-trip validation passed');
} catch (e) {
    console.error('❌ Round-trip failed:', e.message);
    process.exit(1);
}

// Update .env.local
const envPath = '.env.local';
let envContent = fs.readFileSync(envPath, 'utf8');
envContent = envContent.replace(
    /^FIREBASE_SERVICE_ACCOUNT=.*$/m,
    `FIREBASE_SERVICE_ACCOUNT="${cleanB64}"`
);
fs.writeFileSync(envPath, envContent, 'utf8');
console.log('✅ .env.local updated');

// Write value to temp file for vercel CLI piping
fs.writeFileSync('.sa-tmp', cleanB64);

// Remove old corrupted value from all environments
console.log('Removing old Vercel env...');
['production', 'preview', 'development'].forEach(env => {
    try { execSync(`vercel env rm FIREBASE_SERVICE_ACCOUNT ${env} --yes`, { stdio: 'pipe' }); } catch { }
});

// Add clean value to all environments
console.log('Adding clean value to Vercel...');
['production', 'preview', 'development'].forEach(env => {
    try {
        execSync(`echo ${cleanB64}| vercel env add FIREBASE_SERVICE_ACCOUNT ${env}`, { stdio: 'inherit' });
        console.log(`✅ Vercel ${env} updated`);
    } catch (e) {
        console.error(`❌ Vercel ${env} failed:`, e.message);
    }
});

fs.unlinkSync('.sa-tmp');

// Delete the JSON file from project root (security)
fs.unlinkSync(jsonFile);
console.log('✅ Service account JSON removed from project dir');
console.log('\n🎉 Done! Restart the dev server to pick up the new env.');
