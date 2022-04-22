const { initializeApp, cert } = require('firebase-admin/app');
const serviceAccount = require('./../../bin/niamka-a6087-firebase-adminsdk-qd0xj-2e5cac0adb.json');

const app = initializeApp({
	credential: cert(serviceAccount),
	databaseURL:
		'https://niamka-a6087-default-rtdb.europe-west1.firebasedatabase.app',
});

module.exports = app;
