const { Order, Place } = require('./../../models');
const { Sequelize, Op } = require('sequelize');
const { ORDER_STATUSES } = require('./../../constants/index.js');
const { DateTime } = require('luxon');

const getOrderDetails = async (req, res) => {
	const { companyId } = req.headers;
	const { from, to } = req.query;
	const now = DateTime.now();

	let fromValue;
	let toValue;

	if (from) {
		fromValue = from;
	} else {
		fromValue = now.startOf('month').toFormat('yyyy-MM-dd');
	}

	if (to) {
		toValue = to;
	} else {
		toValue = now.endOf('month').toFormat('yyyy-MM-dd');
	}

	let allOrders;
	let totalComission;

	try {
		allOrders = await Order.findAll({
			include: [
				{
					model: Place,
					attributes: ['city', 'id', 'address'],
				},
			],
			where: {
				CompanyId: companyId,
				status: ORDER_STATUSES.COMPLETED,
				createdAt: {
					[Op.gte]: fromValue,
					[Op.lte]: toValue,
				},
			},
			attributes: [
				[Sequelize.fn('SUM', Sequelize.col('totalPrice')), 'total'],
				[Sequelize.fn('COUNT', Sequelize.col('status')), 'totalCount'],
			],
			group: ['Place.id', 'status'],
		});

		totalComission = await Order.findAll({
			where: {
				CompanyId: companyId,
				status: ORDER_STATUSES.COMPLETED,
				createdAt: {
					[Op.gte]: fromValue,
					[Op.lte]: toValue,
				},
			},
			attributes: [
				[
					Sequelize.literal(
						'"Order"."totalPrice" - ("Order"."totalPrice" / 100 * "Order"."comission")'
					),
					'withComission',
				],
			],
		});
	} catch (e) {
		console.log(e);
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'id',
					error: 'Something went wrong',
				},
			],
		});
	}

	return res.status(200).json({
		success: true,
		data: {
			all: allOrders,
			commission: totalComission,
		},
	});
};

module.exports = getOrderDetails;
