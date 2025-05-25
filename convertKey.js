// convertKey.js
const fs = require('fs');

const raw = fs.readFileSync('./uploads/bloodlife-bc66b-firebase-adminsdk-fbsvc-86f8e3f36e.json', 'utf8');
const parsed = JSON.parse(raw);

parsed.private_key = parsed.private_key.replace(/\n/g, '\\n');

console.log(JSON.stringify(parsed, null, 2));
