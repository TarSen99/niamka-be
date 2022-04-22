const reverseOrder = require('../../controllers/order/reverseOrder.js');
const {
	ORDER_STATUSES,
	TRANSACTION_STATUSES,
	PAYMENT_METHODS,
} = require('../../constants/');

const refundOrder = async ({ order, transaction }) => {
	if (
		order.paymentMethod !== PAYMENT_METHODS.CARD ||
		order.status !== ORDER_STATUSES.PAYED
	) {
		return Promise.resolve();
	}

	const result = await reverseOrder({
		orderId: order.Transaction.paymentId,
		currency: order.Transaction.currency,
		order_status: order.Transaction.status,
		amount: order.Transaction.amount,
	});

	if (result.reverse_status !== 'approved') {
		throw new Error('Error on payment system');
	}

	order.Transaction.status = TRANSACTION_STATUSES.CANCELLED;
	return await order.Transaction.save({ transaction });
};

module.exports = refundOrder;
