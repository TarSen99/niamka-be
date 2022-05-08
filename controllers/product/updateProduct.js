const { Product, Image } = require('./../../models');
const sequelize = require('./../../database');
const validationSchema = require('./../../helpers/product/schema.js');
const validate = require('./../../helpers/validate');
const { PRODUCT_TYPES } = require('./../../constants/index.js');

const fields = [
	'title',
	'description',
	'availableCount',
	'availableCountPerPerson',
	'fullPrice',
	'discountPercent',
	'priceWithDiscount',
];

const updateProduct = async (req, res) => {
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
		productType,
		placeId,
		imagesAsUrl = [],
	} = req.body;
	const { productId } = req.params;

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
		productType,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let product;

	const productTransaction = await sequelize.transaction();

	try {
		product = await Product.findByPk(productId, {
			include: Image,
		});
	} catch (e) {
		await productTransaction.rollback();
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'id',
					error: 'Product not found',
				},
			],
		});
	}

	if (product.productType === PRODUCT_TYPES.NIAMBOX) {
		delete fields.title;
	}

	try {
		fields.forEach((field) => {
			product[field] = req.body[field];
		});

		await product.save({ transaction: productTransaction });
	} catch (e) {
		console.log(e);
		await productTransaction.rollback();
		return res.status(400).json({
			success: false,
			errors: [{ error: e }],
		});
	}

	const files = [];

	try {
		for await (const image of product.Images) {
			const exists = imagesAsUrl.find((el) => {
				const imageData = JSON.parse(el);
				return imageData.id === image.id;
			});

			if (!exists) {
				await image.destroy({ transaction: productTransaction });
			} else {
				files.push(image.toJSON());
			}
		}
	} catch (e) {
		console.log(e);
		await productTransaction.rollback();
		return res.status(500).json({
			success: false,
			errors: [{ error: e }],
		});
	}

	const images = [...req.files];

	for await (const image of images) {
		try {
			const url = image.path;

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

	return res.status(200).json({
		success: true,
		data: {
			...product.toJSON(),
			images: files,
		},
	});
};

module.exports = updateProduct;
