const express = require('express');
const router = express.Router();
const { ORDER_STATUSES } = require('./../constants');

const createOrder = require('./../controllers/order/createOrder.js');
const getOrderDetails = require('./../controllers/order/getOrderDetails.js');
const changeOrderStatus = require('./../controllers/order/changeOrderStatus.js');
const getAllOrders = require('./../controllers/order/getAllOrders.js');

const orderStatus = require('./../middleware/orderStatus.js');
const isLoggedIn = require('../middleware/isLoggedIn.js');

router.post('/create', isLoggedIn, createOrder);
router.get('/mine', isLoggedIn, getAllOrders);
router.get('/:id', isLoggedIn, getOrderDetails);

router.delete(
	'/:orderId/cancel',
	isLoggedIn,
	orderStatus(ORDER_STATUSES.CANCELLED),
	changeOrderStatus
);

router.put(
	'/:orderId/complete',
	isLoggedIn,
	orderStatus(ORDER_STATUSES.COMPLETED),
	changeOrderStatus
);

module.exports = router;
