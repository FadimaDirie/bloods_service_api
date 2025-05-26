const admin = require("firebase-admin");
const serviceAccount = require("./uploads/bloodlife-bc66b-firebase-adminsdk-fbsvc-86f8e3f36e.json")
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
