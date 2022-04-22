const express = require('express');
const getUserDetails = require('./../controllers/user/getUserDetails.js');
const createUser = require('./../controllers/user/createUser.js');
const checkIfUserExist = require('./../controllers/user/checkIfUserExist.js');
const login = require('./../controllers/user/login.js');
const createUserWithPhone = require('./../controllers/user/createUserWithPhone.js');
const logout = require('./../controllers/user/logout.js');
const updateDetails = require('./../controllers/user/updateDetails.js');
const getUserSavedCards = require('./../controllers/user/getUserSavedCards.js');
const updateUserSettings = require('./../controllers/user/updateUserSettings.js');
const router = express.Router();

const isLoggedIn = require('../middleware/isLoggedIn.js');

/* GET users listing. */
router.get('/logout', logout);
router.post('/create', createUser);
router.post('/create/phone', createUserWithPhone);
router.post('/check', checkIfUserExist);
router.post('/login', login);
router.put('/update', isLoggedIn, updateDetails);
router.put('/settings/update', isLoggedIn, updateUserSettings);
router.get('/mine/cards', isLoggedIn, getUserSavedCards);
router.get('/mine', isLoggedIn, getUserDetails);

module.exports = router;
