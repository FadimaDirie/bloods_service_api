const admin = require('firebase-admin');
const serviceAccount = require('./uploads/bloodlife-bc66b-firebase-adminsdk-fbsvc-<...>.json'); // write full name

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
