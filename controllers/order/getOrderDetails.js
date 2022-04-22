const { Order, User, Product, OrderProduct } = require('./../../models');

const getOrderDetails = async (req, res) => {
	const { id } = req.params;

	const order = await Order.findByPk(id, {
		include: { model: User, as: 'Customer' },
	});

	const orderProducts = await OrderProduct.findAll({
		where: {
			OrderId: id,
		},
		include: [Product],
	});

	if (!order) {
		return res.status(404).json({
			success: false,
			errors: [
				{
					field: 'id',
					message: 'Order not found',
				},
			],
		});
	}

	return res.status(200).json({
		success: true,
		data: {
			...order.toJSON(),
			orderProducts: orderProducts.map((o) => o.toJSON()),
		},
	});
};

module.exports = getOrderDetails;
