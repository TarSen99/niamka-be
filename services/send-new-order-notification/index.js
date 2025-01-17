const jobService = require('./../jobService');
const { Order, PushToken, UsersAndCompanies } = require('./../../models');
const sendMessage = require('./../firebase/sendMessage.js');

const handler = async (data) => {
	const employeesData = await UsersAndCompanies.findAll({
		where: {
			placeId: data.PlaceId,
		},
	});

	try {
		let tokens = [];

		for await (const entity of employeesData) {
			const tokensValue = await PushToken.findAll({
				where: {
					UserId: entity.UserId,
				},
			});

			tokens.push(...tokensValue);
		}

		for (const token of tokens) {
			sendMessage({
				token: token.token,
				title: `Нове замовлення #${data.orderNumber}`,
				body: `Відкрийте додаток, щоб перевірити деталі`,
				data: {
					type: 'new_order',
					id: '' + data.id,
				},
			});
		}
	} catch (e) {
		console.log('Error');
		console.log(e);
		throw e;
	}
};

const config = {
	name: 'new-order-notification',
	callback: handler,
	delay: 10000,
};

jobService.registerCallback(config);

Order.addHook('afterCreate', async (order) => {
	jobService.pushToQueue({
		...order.toJSON(),
		_config: { name: config.name },
	});
});
