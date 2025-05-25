// convertKey.js

const fs = require('fs');

// 1. Akhri file-ka JSON
const rawData = fs.readFileSync('./uploads/bloodlife-bc66b-firebase-adminsdk-fbsvc-86f8e3f36e.json', 'utf8');

// 2. Parse JSON-ka
const data = JSON.parse(rawData);

// 3. Badal \n line breaks ee private_key ku jira
data.private_key = data.private_key.replace(/\n/g, '\\n');

// 4. Daabac output-ka saxda ah (JSON string oo diyaarsan)
console.log(JSON.stringify(data, null, 2));
