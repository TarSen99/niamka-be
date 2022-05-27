const jobService = require('./../jobService');
const {
	Product,
	Company,
	Place,
	User,
	PushToken,
	ProfileSettings,
} = require('./../../models');
const sendMessage = require('./../firebase/sendMessage.js');
const { Op } = require('sequelize');
const sequelize = require('./../../database');
const { oneKMInDegrees } = require('./../../constants/index.js');

const handler = async (data) => {
	const { CompanyId, id, PlaceId, discountPercent } = data;

	try {
		company = await Company.findByPk(CompanyId, {
			include: [
				{
					model: Place,
					where: {
						id: PlaceId,
					},
				},
			],
		});
	} catch (e) {
		throw e;
	}

	const placeData = company.Places[0];

	if (!placeData) {
		throw new Error('No place');
	}

	const image = company.logo;

	let users;

	const coords = placeData.location.coordinates;

	try {
		users = await User.findAll({
			include: [
				{
					model: PushToken,
					required: true,
					duplicating: false,
				},
				{
					model: ProfileSettings,
					required: true,
					duplicating: false,
					where: {
						sendNewProductNotifications: true,
					},
				},
			],
			where: {
				[Op.and]: [
					{
						registerType: 'phone',
					},
					{
						longtitude: {
							[Op.not]: null,
						},
					},
					sequelize.where(
						sequelize.literal(
							`(SELECT ST_Distance(ST_SetSRID(ST_MakePoint(${coords[0]}, ${coords[1]}), 4326), ST_SetSRID(ST_MakePoint("longtitude","latitude"), 4326)) )`
						),
						'<',
						sequelize.literal(
							`"ProfileSetting"."searchRadius" * ${oneKMInDegrees} * 0.9`
						)
					),
				],
			},
		});
	} catch (e) {
		console.log(e);
		throw e;
	}

	try {
		for (const user of users) {
			if (!user.PushTokens || !user.PushTokens.length) {
				continue;
			}

			for (const currToken of user.PushTokens) {
				sendMessage({
					token: currToken.token,
					title: `Новий продукт від ${company.name}`,
					body: `Привіт! ${company.name} пропонує продукт зі знижкою ${discountPercent}%. Хутчіш заходь і замовляй!`,
					image,
					data: {
						type: 'product',
						id: '' + id,
					},
				});
			}
		}
	} catch (e) {
		throw e;
	}
};

const config = {
	name: 'notification-service',
	callback: handler,
	delay: 10000,
};

jobService.registerCallback(config);

Product.addHook('afterCreate', async (product) => {
	jobService.pushToQueue({
		...product.toJSON(),
		_config: { name: config.name },
	});
});
