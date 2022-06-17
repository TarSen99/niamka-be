const express = require('express');
const router = express.Router();

const getPlaceProductsList = require('../controllers/product/getPlaceProductsList.js');
const getAllOrders = require('../controllers/order/getAllOrders.js');
const AddNewPlace = require('../controllers/place/AddNewPlace.js');
const DeletePlace = require('../controllers/place/DeletePlace.js');

const isLoggedIn = require('../middleware/isLoggedIn.js');
const hasRole = require('./../middleware/hasRole.js');
const { USER_ROLES } = require('./../constants');

router.get('/:placeId/products', isLoggedIn, getPlaceProductsList);
router.get(
	'/:placeId/orders',
	isLoggedIn,
	hasRole([USER_ROLES.OWNER, USER_ROLES.EMPLOYEE, USER_ROLES.MANAGER]),
	getAllOrders
);
router.post(
	'/new',
	isLoggedIn,
	hasRole([USER_ROLES.OWNER, USER_ROLES.MANAGER]),
	AddNewPlace
);
router.delete(
	'/:placeId',
	isLoggedIn,
	hasRole([USER_ROLES.OWNER, USER_ROLES.MANAGER]),
	DeletePlace
);

module.exports = router;
