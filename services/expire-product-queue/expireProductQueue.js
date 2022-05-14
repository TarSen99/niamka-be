const jobService = require('./../jobService');
const { ORDER_STATUSES, PRODUCT_STATUSES } = require('../../constants');
const { Product, Order, OrderProduct } = require('../../models');
const { DateTime } = require('luxon');
const sequelize = require('./../../database');
const expireOrder = require('./../../services/expire-order');

const handler = async (data) => {
	let product;

	try {
		product = await Product.findByPk(data.id, {
			include: [
				{
					model: OrderProduct,
					include: Order,
				},
			],
		});
	} catch (e) {
		throw e;
	}

	// if (product.status === PRODUCT_STATUSES.OUT_OF_STOCK) {
	// 	return;
	// }

	const transaction = await sequelize.transaction();

	product.status = PRODUCT_STATUSES.EXPIRED;

	try {
		await product.save({ transaction });
	} catch (e) {
		await transaction.rollback();
		throw e;
	}

	for await (const orderProduct of product.OrderProducts) {
		let order = orderProduct.Order;

		try {
			if (
				order.status === ORDER_STATUSES.ACTIVE ||
				order.status === ORDER_STATUSES.TO_TAKE ||
				order.status === ORDER_STATUSES.PAYED
			) {
				expireOrder(order.toJSON());
			}
		} catch (e) {
			await transaction.rollback();

			throw e;
		}
	}

	await transaction.commit();
};

const config = {
	name: 'expire-product',
	callback: handler,
};

jobService.registerCallback(config);

Product.addHook('afterCreate', async (product) => {
	const { takeTimeTo } = product;
	const takeTimeToDate = DateTime.fromJSDate(new Date(takeTimeTo));
	const now = DateTime.now();
	const diff = takeTimeToDate.diff(now).toObject();
	const { milliseconds } = diff;

	jobService.pushToQueue({
		...product.toJSON(),
		_config: { name: config.name, delay: milliseconds },
	});
});
