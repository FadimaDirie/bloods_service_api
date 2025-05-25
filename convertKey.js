const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, './uploads/bloodlife-bc66b-firebase-adminsdk-fbsvc-86f8e3f36e.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

data.private_key = data.private_key.replace(/\n/g, '\\n');

console.log(JSON.stringify(data, null, 2)); // Copy this output only!
