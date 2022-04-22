const Queue = require('bull');
const {
	PENDING_ORDER_TIMEOUT,
	ORDER_STATUSES,
	REDIS_URL,
} = require('../../constants');

const { Order, OrderProduct, Product } = require('../../models');
const rollbackProductData = require('../../helpers/product/rollbackProductData.js');
const sequelize = require('./../../database');

class ClearOrderQueueService {
	constructor() {
		this.queue = new Queue('ClearOrdersService');

		this.queue.process('clear-order', async (job) => {
			return this.clearOrder(job);
		});
	}

	async addOrderToClear(data) {
		await this.queue.add('clear-order', data, {
			delay: PENDING_ORDER_TIMEOUT,
			removeOnComplete: true,
			// removeOnFail: true,
		});
	}

	async clearOrder(job) {
		const { orderId } = job.data;

		let order;

		try {
			order = await Order.findByPk(orderId, {
				include: [
					{
						model: OrderProduct,
						include: Product,
					},
				],
			});
		} catch (e) {
			return await job.moveToFailed({ message: 'Failed' });
		}

		if (order.status !== ORDER_STATUSES.ACTIVE) {
			return await job.moveToCompleted('done', true);
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

			return await job.moveToFailed({ message: 'Failed' });
		}

		try {
			await order.save({ transaction });
			await transaction.commit();

			return await job.moveToCompleted('done', true);
		} catch (e) {
			await transaction.rollback();
			return await job.moveToFailed({ message: 'Failed' });
		}
	}
}

const clearOrderQueueService = new ClearOrderQueueService();

Order.addHook('afterCreate', ({ id }) => {
	clearOrderQueueService.addOrderToClear({ orderId: id });
});

module.exports = clearOrderQueueService;
