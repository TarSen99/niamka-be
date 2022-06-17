const express = require('express');
const router = express.Router();
const getCompanyPayments = require('../controllers/payments/getCompanyPayments.js');

const isLoggedIn = require('../middleware/isLoggedIn.js');
const hasRole = require('./../middleware/hasRole.js');
const { USER_ROLES } = require('./../constants');

router.get('/', isLoggedIn, hasRole([USER_ROLES.OWNER]), getCompanyPayments);

module.exports = router;
