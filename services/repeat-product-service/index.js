const Queue = require('bull');
const { DateTime } = require('luxon');
const { Product, Image } = require('./../../models');
const sequelize = require('./../../database');
const { Op } = require('sequelize');

const getTimeString = () => {
	const now = DateTime.now();
	const formattedTime = now.toUTC().toFormat('HH:mm');
	return formattedTime;
};

const repeatProducts = async () => {
	const time = getTimeString();
	let products;

	try {
		products = await Product.findAll({
			include: Image,
			where: {
				primaryId: null,
				repeat: true,
				publishTime: time,
				createdAt: {
					[Op.lt]: new Date(new Date() - 10 * 60 * 60 * 1000),
				},
			},
		});
	} catch (e) {
		return;
	}

	for await (const product of products) {
		const productTransaction = await sequelize.transaction();

		const {
			title,
			description,
			availableCountPerPerson,
			initialCount,
			fullPrice,
			discountPercent,
			priceWithDiscount,
			takeTimeFrom,
			takeTimeTo,
			PlaceId,
			productType,
			category,
			CompanyId,
			id,
			publishTime,
		} = product;

		try {
			const newProduct = await Product.create(
				{
					title,
					description,
					availableCount: initialCount,
					initialCount: initialCount,
					availableCountPerPerson,
					fullPrice,
					discountPercent,
					priceWithDiscount,
					takeTimeFrom,
					takeTimeTo,
					availableForSale: true,
					PlaceId,
					CompanyId,
					productType,
					category,
					repeat: true,
					publishTime,
					primaryId: id,
				},
				{
					transaction: productTransaction,
				}
			);

			for await (const image of product.Images || []) {
				const url = image.url;

				await Image.create(
					{
						ProductId: newProduct.id,
						url: url,
					},
					{
						transaction: productTransaction,
					}
				);
			}
		} catch (e) {
			console.log(e);
			await productTransaction.rollback();
			return;
		}

		await productTransaction.commit();
	}
};

const newProductsQueue = new Queue('newProductsQueue');

newProductsQueue.process(async () => {
	repeatProducts();
});

newProductsQueue.add(null, { repeat: { cron: '0,15,30 * * * *' } });

// for testing, runs each minute
// newProductsQueue.add(null, { repeat: { cron: '* * * * *' } });
