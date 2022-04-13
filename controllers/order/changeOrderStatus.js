const Order = require('../../models/Order');

const changeOrderStatus = async (req, res) => {
	const { orderId } = req.params;
	const status = req.orderStatus;

	const order = await Order.findByPk(orderId);

	order.status = status;

	await order.save();

	return res.status(200).json({
		success: true,
		data: order.toJSON(),
	});
};

module.exports = changeOrderStatus;
