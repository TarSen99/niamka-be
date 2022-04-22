const {
	Product,
	Company,
	Place,
	User,
	Image,
	PushToken,
} = require('../../models');
const sendMessage = require('../../services/firebase/sendMessage.js');

const Queue = require('bull');

class SendProductCreatedNotification {
	constructor() {
		this.queue = new Queue('sendProductNotification');

		this.queue.process('send-product-notification', async (job) => {
			return this.sendProductNotification(job);
		});
	}

	async pushToQueue(data) {
		const { CompanyId, description, id } = data;

		let company;

		try {
			company = await Company.findByPk(CompanyId, {
				include: [Place],
			});
		} catch (e) {
			return;
		}

		let users;

		try {
			users = await User.findAll({
				where: {
					registerType: 'phone',
				},
				include: PushToken,
			});
		} catch (e) {
			return;
		}

		for await (const user of users) {
			await this.queue.add(
				'send-product-notification',
				{
					user,
					companyName: company.name,
					companyLogo: company.logo,
					description,
					id,
				},
				{
					removeOnComplete: true,
					// delays needs to wait for images created
					delay: 10000,
				}
			);
		}
	}

	async sendProductNotification(job) {
		const data = job.data;

		const { description, id, user, companyName, companyLogo } = data;

		let images;
		try {
			images = await Image.findAll({
				where: {
					ProductId: id,
				},
			});
		} catch (e) {
			return await job.moveToFailed({ message: e });
		}

		const image = images[0]?.toJSON()?.url || companyLogo;

		try {
			if (!user.PushTokens || !user.PushTokens.length) {
				return await job.moveToCompleted('done', true);
			}

			for await (const currToken of user.PushTokens) {
				await sendMessage({
					token: currToken.token,
					title: `New product from ${companyName}`,
					body: description,
					image,
					data: {
						type: 'product',
						id: '' + id,
					},
				});
			}
		} catch (e) {
			console.log(e);
			return await job.moveToFailed({ message: 'Failed' });
		}

		return await job.moveToCompleted('done', true);
	}
}

const sendProductCreatedNotification = new SendProductCreatedNotification();

Product.addHook('afterCreate', async (product) => {
	sendProductCreatedNotification.pushToQueue({ ...product.toJSON() });
});

module.exports = sendProductCreatedNotification;
