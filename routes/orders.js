const express = require('express');
const router = express.Router();
const { ORDER_STATUSES } = require('./../constants');

const createOrder = require('./../controllers/order/createOrder.js');
const getOrderDetails = require('./../controllers/order/getOrderDetails.js');
const changeOrderStatus = require('./../controllers/order/changeOrderStatus.js');
const getAllOrders = require('./../controllers/order/getAllOrders.js');
const createPayment = require('./../controllers/order/createPayment.js');
const markOrderAsPayed = require('./../controllers/order/markOrderAsPayed.js');
const PayWithRectoken = require('./../controllers/order/PayWithRectoken.js');
const updateOrderPaymentType = require('./../controllers/order/updateOrderPaymentType.js');
const completeOrder = require('./../controllers/order/completeOrder.js');

const orderStatus = require('./../middleware/orderStatus.js');
const isLoggedIn = require('../middleware/isLoggedIn.js');
const writeToDb = require('./../services/firebase/realTimeDb.js');

router.get('/test', async (req, res) => {
	try {
		writeToDb('users/_8/orders/_1', {
			status: 'completed',
			createdAt: new Date(),
		});
	} catch (e) {
		console.log('---');
		console.log(e);
	}

	return res.status(200).json({ success: true });
});

router.put('/:orderId/complete-order', isLoggedIn, completeOrder);
router.get('/checkout/:orderId', isLoggedIn, createPayment);
router.post('/pay', isLoggedIn, PayWithRectoken);
router.post('/create', isLoggedIn, createOrder);
router.get('/mine', isLoggedIn, getAllOrders);
router.get('/:id', isLoggedIn, getOrderDetails);
router.post('/payed', markOrderAsPayed);
router.put('/:orderId/payment-type/update', updateOrderPaymentType);

router.delete(
	'/:orderId/cancel',
	isLoggedIn,
	orderStatus(ORDER_STATUSES.CANCELLED),
	changeOrderStatus
);

module.exports = router;
