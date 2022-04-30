const { Order } = require('../../models');
const { ORDER_STATUSES } = require('../../constants/');
const { Op } = require('sequelize');
const writeToDb = require('./../../services/firebase/realTimeDb.js');

const changeOrderStatus = async (req, res) => {
	const { customerNumber } = req.body;
	const { orderId } = req.params;

	let order;

	try {
		order = await Order.findOne({
			where: {
				id: +orderId,
				customerNumber,
				status: {
					[Op.or]: [ORDER_STATUSES.PAYED, ORDER_STATUSES.TO_TAKE],
				},
			},
		});
	} catch (e) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'id',
					error: 'Order not found',
				},
			],
		});
	}

	if (!order) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'id',
					error: 'Order not found',
				},
			],
		});
	}

	order.status = ORDER_STATUSES.COMPLETED;

	try {
		await order.save();
	} catch (e) {
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

	try {
		writeToDb(`users/_${order.CustomerId}/orders/_${order.id}`, {
			data: {
				...order.toJSON(),
			},
			createdAt: new Date(),
		});
	} catch (e) {}

	return res.status(200).json({
		success: true,
		data: order.toJSON(),
	});
};

module.exports = changeOrderStatus;
