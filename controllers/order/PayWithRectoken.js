const CloudIpsp = require('cloudipsp-node-js-sdk');
const {
	SECRET,
	TRANSACTION_STATUSES,
	CURRENCY,
	ORDER_STATUSES,
	MERCHANT_ID,
} = require('../../constants');
const { Transaction, Order } = require('../../models');
const sequelize = require('./../../database');
const reverseOrder = require('./../../controllers/order/reverseOrder.js');

const validate = require('./../../helpers/validate');
const yup = require('yup');
const { genSignature } = require('cloudipsp-node-js-sdk/lib/util.js');

const fondy = new CloudIpsp({
	merchantId: MERCHANT_ID,
	secretKey: SECRET,
});

const validationSchema = yup.object().shape({
	orderId: yup.number().required('Field is required').nullable(),
	rectoken: yup.string().required('Field is required').nullable(),
});

const payWithRectoken = async (req, res) => {
	const { orderId, rectoken } = req.body;

	const v = await validate(validationSchema, {
		orderId,
		rectoken,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	const order = await Order.findByPk(orderId, {
		include: Transaction,
	});

	if (!order) {
		return res.status(404).json({
			field: 'orderId',
			error: 'Order not found',
		});
	}

	const { orderNumber, totalPrice } = order;
	// const priceToFixed = totalPrice.toFixed(2);

	const requestData = {
		order_id: `#${orderNumber}/${orderId}`,
		order_desc: `Order #${orderNumber}`,
		currency: CURRENCY,
		amount: `${(totalPrice * 100).toFixed(0)}`,
		merchant_id: MERCHANT_ID,
		rectoken,
	};

	const payTransaction = await sequelize.transaction();
	const signature = genSignature(requestData, SECRET);

	requestData.signature = signature;

	let payment;
	try {
		payment = await fondy.Recurring(requestData);
	} catch (e) {
		console.log(e);
		payTransaction.rollback();
		return res.status(500).json({
			field: 'error',
			error: e,
		});
	}

	let transaction = order.Transaction;

	if (!transaction) {
		try {
			transaction = await Transaction.create(
				{
					paymentId: requestData.order_id,
					orderDescription: requestData.order_desc,
					amount: requestData.amount,
					OrderId: orderId,
					currency: CURRENCY,
				},
				{
					transaction: payTransaction,
				}
			);
		} catch (e) {
			payTransaction.rollback();
			await reverseOrder({
				orderId: requestData.order_id,
				amount: requestData.amount,
				currency: requestData.CURRENCY,
				order_status: payment.order_status,
			});

			return res.status(500).json({
				field: 'error',
				error: e,
			});
		}
	}

	if (payment.order_status !== 'approved') {
		transaction.status = TRANSACTION_STATUSES.REJECTED;
	} else {
		transaction.status = TRANSACTION_STATUSES.COMPLETED;
		order.status = ORDER_STATUSES.PAYED;
	}

	try {
		await transaction.save({ transaction: payTransaction });
		await order.save({ transaction: payTransaction });
	} catch (e) {
		await payTransaction.rollback();
		await reverseOrder({
			orderId: requestData.order_id,
			amount: requestData.amount,
			currency: requestData.CURRENCY,
			order_status: payment.order_status,
		});

		return res.status(500).json({
			field: 'error',
			error: e,
		});
	}

	await payTransaction.commit();

	return res.status(200).json({
		success: true,
		data: {
			transaction,
			order,
		},
	});
};

module.exports = payWithRectoken;
