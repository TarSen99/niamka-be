const { Order, Company } = require('../../models');
const { ORDER_STATUSES, PAYMENT_METHODS } = require('../../constants/');
const { Op } = require('sequelize');
const writeToDb = require('./../../services/firebase/realTimeDb.js');
const sequelize = require('./../../database');

const changeOrderStatus = async (req, res) => {
	const { customerNumber } = req.body;
	const { orderId } = req.params;

	let order;

	try {
		order = await Order.findOne({
			include: [
				{
					model: Company,
				},
			],
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

	const transaction = await sequelize.transaction();

	order.status = ORDER_STATUSES.COMPLETED;

	const commissionSumm = (order.totalPrice / 100) * order.comission;
	const curr = order.Company.balance || 0;
	// let finalSumm = 0;

	if (order.paymentMethod === PAYMENT_METHODS.CARD) {
		const finalSumm = order.totalPrice - commissionSumm;
		order.Company.balance = curr + finalSumm;
	}

	if (order.paymentMethod === PAYMENT_METHODS.CASH) {
		// finalSumm = curr - commissionSumm;
		order.Company.balance = curr - commissionSumm;
	}

	try {
		await order.save({ transaction });
		await order.Company.save({ transaction });
	} catch (e) {
		await transaction.rollback();
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

	await transaction.commit();

	return res.status(200).json({
		success: true,
		data: order.toJSON(),
	});
};

module.exports = changeOrderStatus;
