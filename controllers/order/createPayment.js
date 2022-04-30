const CloudIpsp = require('cloudipsp-node-js-sdk');
const { genSignature } = require('cloudipsp-node-js-sdk/lib/util.js');
const { Order, Transaction, User } = require('../../models');
const {
	SECRET,
	TRANSACTION_STATUSES,
	CURRENCY,
	MERCHANT_ID,
} = require('../../constants/index.js');

const fondy = new CloudIpsp({
	merchantId: MERCHANT_ID,
	secretKey: SECRET,
});

const createPayment = async (req, res) => {
	const { orderId } = req.params;

	const order = await Order.findByPk(orderId, {
		include: [Transaction, { model: User, as: 'Customer' }],
	});

	if (!order) {
		return res.status(404).json({
			field: 'orderId',
			error: 'Order not found',
		});
	}

	const { orderNumber, totalPrice } = order;
	const priceToFixed = totalPrice.toFixed(2);

	const requestData = {
		server_callback_url: 'https://27e7-93-175-201-145.eu.ngrok.io/orders/payed',
		order_id: `#${orderNumber}/${orderId}`,
		order_desc: `Order #${orderNumber}`,
		currency: CURRENCY,
		amount: `${(priceToFixed * 100).toFixed(0)}`,
		required_rectoken: 'Y',
		delayed: 'Y',
		merchant_id: MERCHANT_ID,
		lifetime: '600000', // 10 min
	};

	if (order.Customer.email) {
		requestData.sender_email = order.Customer.email;
	}

	const signature = genSignature(requestData, SECRET);

	requestData.signature = signature;

	let transaction = order.Transaction;

	let token;

	if (!transaction) {
		try {
			const data = await fondy.CheckoutToken(requestData);
			token = data.token;
		} catch (e) {
			console.log(e);
			return res.status(400).json({
				success: false,
				e,
			});
		}
	} else {
		token = transaction.token;
	}

	if (!transaction) {
		try {
			transaction = await Transaction.create({
				paymentId: requestData.order_id,
				orderDescription: requestData.order_desc,
				amount: requestData.amount,
				token: token,
				OrderId: orderId,
				status: TRANSACTION_STATUSES.PENDING,
				currency: CURRENCY,
			});
		} catch (e) {
			console.log(e);
			return res.status(400).json({
				success: false,
				e,
			});
		}
	}

	return res.status(200).json({
		success: true,
		data: { token },
		transaction: transaction.toJSON(),
	});
};

module.exports = createPayment;
