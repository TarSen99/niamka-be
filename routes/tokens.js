const express = require('express');
const addPushToken = require('./../controllers/push/addPushToken.js');
const sendMessage = require('./../services/firebase/sendMessage.js');
const router = express.Router();

const isLoggedIn = require('../middleware/isLoggedIn.js');

router.post('/create', isLoggedIn, addPushToken);

module.exports = router;
