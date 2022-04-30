const { Product, Place, Image } = require('./../../models');
const sequelize = require('./../../database');
const validationSchema = require('./../../helpers/product/schema.js');
const validate = require('./../../helpers/validate');

const createProduct = async (req, res) => {
	const {
		title,
		description,
		availableCount,
		availableCountPerPerson,
		fullPrice,
		discountPercent,
		priceWithDiscount,
		takeTimeFrom,
		takeTimeTo,
		placeId,
		imagesAsUrl = [],
	} = req.body;

	const v = await validate(validationSchema, {
		title,
		description,
		availableCount,
		availableCountPerPerson,
		fullPrice,
		discountPercent,
		priceWithDiscount,
		takeTimeFrom,
		takeTimeTo,
		placeId,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let product;

	const productTransaction = await sequelize.transaction();

	const place = await Place.findByPk(placeId);

	if (!place || place.disabled) {
		await productTransaction.rollback();

		return res.status(404).json({
			success: false,
			errors: [
				{
					field: 'placeId',
					error: 'Not found',
				},
			],
		});
	}

	try {
		product = await Product.create(
			{
				title,
				description,
				availableCount,
				initialCount: availableCount,
				availableCountPerPerson,
				fullPrice,
				discountPercent,
				priceWithDiscount,
				takeTimeFrom,
				takeTimeTo,
				availableForSale: true,
				PlaceId: placeId,
				CompanyId: place.CompanyId,
			},
			{
				transaction: productTransaction,
			}
		);
	} catch (e) {
		console.log(e);
		await productTransaction.rollback();
		return res.status(500).json({
			success: false,
			errors: [{ error: e }],
		});
	}

	const imagesUrls = imagesAsUrl.map((el) => {
		return JSON.parse(el);
	});

	const images = [...req.files, ...imagesUrls];
	const files = [];

	for await (const image of images) {
		try {
			const url = image.path || image.url;

			const imageData = await Image.create(
				{
					ProductId: product.id,
					url: url,
				},
				{
					transaction: productTransaction,
				}
			);

			files.push(imageData.toJSON());
		} catch (e) {
			await productTransaction.rollback();

			return res.status(404).json({
				success: false,
				errors: [
					{
						field: null,
						error: e,
					},
				],
			});
		}
	}

	await productTransaction.commit();

	return res.status(201).json({
		success: true,
		data: {
			...product.toJSON(),
			images: files,
		},
	});
};

module.exports = createProduct;