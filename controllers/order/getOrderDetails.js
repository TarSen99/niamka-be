const { Order, User, Product, OrderProduct, Image } = require('./../../models');

const getOrderDetails = async (req, res) => {
	const { id } = req.params;

	if (!id) {
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

	let order;

	try {
		order = await Order.findByPk(id, {
			include: [{ model: User, as: 'Customer' }, OrderProduct],
		});
	} catch (e) {
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

	// const orderProducts = await OrderProduct.findAll({
	// 	where: {
	// 		OrderId: id,
	// 	},
	// 	include: [Product],
	// });

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

	const productsData = {};

	try {
		for await (const productData of order.OrderProducts) {
			if (productsData[productData.ProductId]) {
				continue;
			}

			const product = await Product.findByPk(productData.ProductId, {
				include: Image,
			});

			productsData[product.id] = product.toJSON();
		}
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			errors: [
				{
					field: 'error',
					error: e,
				},
			],
		});
	}

	// return {
	// 	...el.toJSON(),
	// 	OrderProducts: el.OrderProducts.map((op) => {
	// 		return {
	// 			...op.toJSON(),
	// 			productData: productsData[op.ProductId],
	// 		};
	// 	}),
	// };

	return res.status(200).json({
		success: true,
		data: {
			...order.toJSON(),
			OrderProducts: order.OrderProducts.map((op) => {
				return {
					...op.toJSON(),
					productData: productsData[op.ProductId],
				};
			}),
		},
	});
};

module.exports = getOrderDetails;
