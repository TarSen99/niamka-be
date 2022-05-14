const jobService = require('./../jobService');
const sequelize = require('./../../database');
const { ORDER_STATUSES } = require('../../constants');
const { Order, OrderProduct, Transaction } = require('../../models');
const refundOrder = require('../../controllers/order/refundOrder.js');

const handler = async (data) => {
	let order;

	try {
		order = await Order.findByPk(data.id, {
			include: [
				{
					model: OrderProduct,
				},
				{
					model: Transaction,
				},
			],
		});
	} catch (e) {
		throw e;
	}

	if (
		order.status === ORDER_STATUSES.COMPLETED ||
		order.status === ORDER_STATUSES.CANCELLED ||
		order.status === ORDER_STATUSES.EXPIRED
	) {
		return true;
	}

	const transaction = await sequelize.transaction();

	try {
		await refundOrder({ order, transaction });
		order.status = ORDER_STATUSES.EXPIRED;
		await order.save({ transaction });

		await transaction.commit();
	} catch (e) {
		await transaction.rollback();
		throw e;
	}
};

const config = {
	name: 'expire-order',
	callback: handler,
};

jobService.registerCallback(config);

const pushToQueue = (order) => {
	jobService.pushToQueue({
		...order,
		// cancel order after 2 hours
		_config: { name: config.name, delay: 1000 },
	});
};

module.exports = pushToQueue;
