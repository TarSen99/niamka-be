const { SECRET, MERCHANT_ID } = require('../../constants');
const CloudIpsp = require('cloudipsp-node-js-sdk');

const fondy = new CloudIpsp({
	merchantId: MERCHANT_ID,
	secretKey: SECRET,
});

const reverseOrder = async ({ orderId, amount, currency, order_status }) => {
	if (order_status === 'approved') {
		return fondy.Reverse({
			order_id: orderId,
			amount,
			currency,
		});
	}

	return Promise.resolve();
};

module.exports = reverseOrder;
