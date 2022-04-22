const { ORDER_STATUSES, PRODUCT_STATUSES } = require('../../constants');
const { Product, Order, OrderProduct } = require('../../models');
const Queue = require('bull');
const { DateTime } = require('luxon');

class ExpireProductService {
	constructor() {
		this.queue = new Queue('ExpireProductService');

		this.queue.process('expire-product', async (job) => {
			return this.expireProduct(job);
		});
	}

	async addProductToExpireQueue(data) {
		const { takeTimeTo } = data;
		const takeTimeToDate = DateTime.fromJSDate(new Date(takeTimeTo));

		const now = DateTime.now();
		// plus({ minutes: 5 })
		const diff = takeTimeToDate.diff(now).toObject();
		const { milliseconds } = diff;

		await this.queue.add('expire-product', data, {
			delay: milliseconds,
			removeOnComplete: true,
			// removeOnFail: true,
		});
	}

	async expireProduct(job) {
		const data = job.data;

		let product;

		try {
			product = await Product.findByPk(data.productId, {
				include: [
					{
						model: OrderProduct,
						include: Order,
					},
				],
			});
		} catch (e) {
			console.log(e);
			return await job.moveToFailed({ message: e });
		}

		if (product.status === PRODUCT_STATUSES.OUT_OF_STOCK) {
			return await job.moveToCompleted('done', true);
		}

		product.status = PRODUCT_STATUSES.EXPIRED;
		await product.save();

		for await (const orderProduct of product.OrderProducts) {
			let order = orderProduct.Order;
			try {
				if (
					order.status === ORDER_STATUSES.ACTIVE ||
					order.status === ORDER_STATUSES.TO_TAKE ||
					order.status === ORDER_STATUSES.PAYED
				) {
					order.status = ORDER_STATUSES.EXPIRED;
					await order.save();
				}
			} catch (e) {
				return await job.moveToFailed({ message: 'Failed' });
			}
		}

		return await job.moveToCompleted('done', true);
	}
}

const expireProductService = new ExpireProductService();

Product.addHook('afterCreate', ({ id, takeTimeTo }) => {
	expireProductService.addProductToExpireQueue({ productId: id, takeTimeTo });
});

module.exports = expireProductService;
