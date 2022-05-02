const jobService = require('./../jobService');
const sequelize = require('./../../database');
const { PENDING_ORDER_TIMEOUT, ORDER_STATUSES } = require('../../constants');
const { Order, OrderProduct, Product } = require('../../models');
const rollbackProductData = require('../../helpers/product/rollbackProductData.js');

const handler = async (data) => {
	let order;

	try {
		order = await Order.findByPk(data.id, {
			include: [
				{
					model: OrderProduct,
					include: Product,
				},
			],
		});
	} catch (e) {
		throw e;
	}

	if (order.status !== ORDER_STATUSES.ACTIVE) {
		return true;
	}

	const transaction = await sequelize.transaction();

	order.status = ORDER_STATUSES.CANCELLED;

	try {
		for await (const orderProduct of order.OrderProducts) {
			await rollbackProductData({
				product: orderProduct.Product,
				addCount: orderProduct.quantity,
				transaction,
			});
		}
	} catch (e) {
		await transaction.rollback();

		throw e;
	}

	try {
		await order.save({ transaction });
		await transaction.commit();

		return await job.moveToCompleted('done', true);
	} catch (e) {
		await transaction.rollback();
		throw e;
	}
};

const config = {
	name: 'clear-orders',
	callback: handler,
	delay: PENDING_ORDER_TIMEOUT,
};

jobService.registerCallback(config);

Order.addHook('afterCreate', (order) => {
	jobService.pushToQueue({
		...order.toJSON(),
		_config: { name: config.name },
	});
});
