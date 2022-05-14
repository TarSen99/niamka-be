const jobService = require('./../jobService');
const { ORDER_STATUSES } = require('../../constants');
const {
	Order,
	OrderProduct,
	Product,
	User,
	PushToken,
	Company,
} = require('../../models');
const { getProductsPickupDate, waitTime } = require('../../helpers/index.js');
const sendMessage = require('./../firebase/sendMessage.js');

const handler = async (data) => {
	let order;

	try {
		order = await Order.findByPk(data.id, {
			include: [
				Company,
				{
					model: OrderProduct,
					include: Product,
				},
			],
		});
	} catch (e) {
		throw e;
	}

	if (
		order.status !== ORDER_STATUSES.TO_TAKE &&
		order.status !== ORDER_STATUSES.PAYED
	) {
		return true;
	}

	const userId = order.CustomerId;
	let user;

	try {
		user = await User.findByPk(userId, {
			include: [
				{
					model: PushToken,
					required: true,
					duplicating: false,
				},
			],
		});
	} catch (e) {
		throw e;
	}

	if (!user) {
		return;
	}

	try {
		if (!user.PushTokens || !user.PushTokens.length) {
			return;
		}

		for (const currToken of user.PushTokens) {
			sendMessage({
				token: currToken.token,
				title: `Спливає час до закінчення терміну замовлення.`,
				body: `#${order.orderNumber} Поспіши, будь ласка, щоб встигнути забрати свої смаколики.`,
				image: order.Company.logo,
				data: {
					type: 'order',
					id: '' + order.id,
				},
			});
		}
	} catch (e) {
		throw e;
	}
};

const config = {
	name: 'take-order-schedule',
	callback: handler,
};

jobService.registerCallback(config);

Order.addHook('afterCreate', (orderData) => {
	setTimeout(async () => {
		let order;

		try {
			order = await Order.findByPk(orderData.id, {
				include: [
					{
						model: OrderProduct,
						include: Product,
					},
				],
			});
		} catch (e) {
			return;
		}

		if (!order) {
			return;
		}

		const products = order.OrderProducts.map((el) => el.Product);

		const pickupTime = getProductsPickupDate(products);
		const delay = waitTime(pickupTime, 60 * 1000 * 30);

		if (delay < 0) {
			return;
		}

		jobService.pushToQueue({
			...order.toJSON(),
			_config: { name: config.name, delay: delay },
		});
	}, 5000);
});
