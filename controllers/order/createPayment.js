const CloudIpsp = require('cloudipsp-node-js-sdk');
const { genSignature } = require('cloudipsp-node-js-sdk/lib/util.js');
const Order = require('../../models/Order');
const Transaction = require('../../models/Transaction');

const SECRET = 'TQKfQnUpj5WDo4aCJCDwmLMffCEcsaIB';

const fondy = new CloudIpsp({
	merchantId: 1445132,
	secretKey: SECRET,
});

const createPayment = async (req, res) => {
	const { orderId } = req.params;

	const order = await Order.findByPk(orderId, {
		include: Transaction,
	});

	if (!order) {
		return res.status(404).json({
			field: 'orderId',
			error: 'Order not found',
		});
	}

	const { orderNumber, totalPrice, CustomerId } = order;
	const priceToFixed = totalPrice.toFixed(2);

	const requestData = {
		server_callback_url: 'https://tricky-wasp-32.loca.lt/orders/payed',
		order_id: `#${orderNumber}`,
		order_desc: `Order #${orderNumber}`,
		currency: 'UAH',
		// In cents
		amount: `${priceToFixed * 100}`,
		required_rectoken: 'Y',
		delayed: 'N',
		merchant_id: '1445132',
	};

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
