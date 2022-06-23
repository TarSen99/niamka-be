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

const getTime = (timeValue, add = 0) => {
	// const timeValue = DateTime.fromJSDate(new Date(time));
	const hours = timeValue.get('hour');
	const minutes = timeValue.get('minute');

	const now = DateTime.now();
	const withTime = now.set({
		hour: hours,
		minute: minutes,
		day: now.get('day') + add,
	});

	return withTime;
};

const getTimeValues = (from, to) => {
	const timeFrom = DateTime.fromJSDate(new Date(from));
	const timeTo = DateTime.fromJSDate(new Date(to));

	const dayFrom = timeFrom.get('day');
	const dayTo = timeTo.get('day');
	// if take time to is different day
	let addDay = dayFrom === dayTo ? 0 : 1;

	const nowFrom = getTime(timeFrom).toISO();
	const nowTo = getTime(timeTo, addDay).toISO();

	return {
		from: nowFrom,
		to: nowTo,
	};
};

const repeatProducts = async () => {
	const time = getTimeString();
	let products;

	try {
		products = await Product.findAll({
			include: [
				{
					model: Image,
					required: false,
				},
			],
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
		console.log(e);
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
			const { from, to } = getTimeValues(takeTimeFrom, takeTimeTo);

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
					takeTimeFrom: from,
					takeTimeTo: to,
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

const run = async () => {
	let jobs = await newProductsQueue.getJobs(['delayed']);
	let jobToDelete = jobs.find(
		(delayedJob) => delayedJob.opts.repeat.jobId == 'newProductsQueue'
	);
	if (jobToDelete) {
		await jobToDelete.remove();
	}

	newProductsQueue.add(null, { repeat: { cron: '0,15,30 * * * *' } });

	// for testing, runs each minute
	// newProductsQueue.add(null, { repeat: { cron: '* * * * *' } });
};

run();
