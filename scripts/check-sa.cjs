const fs = require('fs');
const lines = fs.readFileSync('.env.local', 'utf8').split('\n');
const line = lines.find(l => l.startsWith('FIREBASE_SERVICE_ACCOUNT='));
// Strip surrounding quotes and literal \n at end added by vercel cli
let val = line.replace(/^FIREBASE_SERVICE_ACCOUNT="/, '').replace(/"$/, '').replace(/\\n$/, '');
console.log('Has whitespace in base64:', /\s/.test(val));
console.log('Length:', val.length);
try {
    const decoded = Buffer.from(val, 'base64').toString('utf8');
    JSON.parse(decoded);
    console.log('JSON: VALID ✅');
} catch (e) {
    console.log('JSON PARSE ERROR:', e.message);
}
