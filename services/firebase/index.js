const { initializeApp, cert } = require('firebase-admin/app');
const serviceAccount = require('./../../bin/niamka-a6087-firebase-adminsdk-qd0xj-a1e0db6f63.json');

const app = initializeApp({ credential: cert(serviceAccount) });

module.exports = app;
