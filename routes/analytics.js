const express = require('express');
const router = express.Router();

const getCompanyAnalytics = require('../controllers/analytics/getCompanyAnalytics.js');
const isLoggedIn = require('../middleware/isLoggedIn.js');

router.get('/general', isLoggedIn, getCompanyAnalytics);

module.exports = router;
