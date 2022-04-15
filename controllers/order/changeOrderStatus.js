const Order = require('../../models/Order');
const { ORDER_STATUSES } = require('../../constants/');
const rollbackProductData = require('../../helpers/product/rollbackProductData.js');
const OrderProduct = require('../../models/Order/OrderProduct');

const changeOrderStatus = async (req, res) => {
	const { orderId } = req.params;
	const status = req.orderStatus;

	const order = await Order.findByPk(orderId, {
		include: OrderProduct,
	});

	order.status = status;

	if (status === ORDER_STATUSES.CANCELLED) {
		try {
			for await (const orderProduct of order.OrderProducts) {
				await rollbackProductData({
					productId: orderProduct.ProductId,
					addCount: orderProduct.quantity,
				});
			}
		} catch (e) {
			console.log(e);
			return res.status(500).json({
				success: false,
				errors: [
					{
						field: null,
						error: 'Something went wrong',
					},
				],
			});
		}
	}

	await order.save();

	return res.status(200).json({
		success: true,
		data: order.toJSON(),
	});
};

module.exports = changeOrderStatus;
