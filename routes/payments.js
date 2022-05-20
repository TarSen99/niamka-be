const express = require('express');
const router = express.Router();
const getCompanyPayments = require('../controllers/payments/getCompanyPayments.js');

const isLoggedIn = require('../middleware/isLoggedIn.js');

router.get('/', isLoggedIn, getCompanyPayments);

module.exports = router;
