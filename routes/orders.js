const express = require('express');
const router = express.Router();
const { ORDER_STATUSES } = require('./../constants');

const createOrder = require('./../controllers/order/createOrder.js');
const getOrderDetails = require('./../controllers/order/getOrderDetails.js');
const changeOrderStatus = require('./../controllers/order/changeOrderStatus.js');
const getAllOrders = require('./../controllers/order/getAllOrders.js');
const createPayment = require('./../controllers/order/createPayment.js');
const markOrderAsPayed = require('./../controllers/order/markOrderAsPayed.js');

const orderStatus = require('./../middleware/orderStatus.js');
const isLoggedIn = require('../middleware/isLoggedIn.js');

router.get('/checkout/:orderId', isLoggedIn, createPayment);
router.post('/create', isLoggedIn, createOrder);
router.get('/mine', isLoggedIn, getAllOrders);
router.get('/:id', isLoggedIn, getOrderDetails);
router.get('/payed', markOrderAsPayed);
router.post('/payed', markOrderAsPayed);

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
