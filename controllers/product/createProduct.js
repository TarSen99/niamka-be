const Product = require('./../../models/Product');
const Place = require('./../../models/Place');
const Image = require('./../../models/Image');
const sequelize = require('./../../database');

const yup = require('yup');
const validate = require('./../../helpers/validate');

const validationSchema = yup.object().shape({
	title: yup.string().required('Field is required').nullable(),
	description: yup.string().required('Field is required').nullable(),
	availableCount: yup
		.number()
		.typeError('Field must be a number')
		.positive('Must be more than 0')
		.integer('Must be more than 0')
		.required('Field is required')
		.nullable(true),
	availableCountPerPerson: yup
		.number()
		.typeError('Field must be a number')
		.positive('Must be more than 0')
		.integer('Must be more than 0')
		.required('Field is required')
		.nullable(true),
	fullPrice: yup
		.number()
		.typeError('Field must be a number')
		.positive('Must be more than 0')
		.required('Field is required')
		.nullable(true),
	discountPercent: yup
		.number()
		.typeError('Field must be a number')
		.positive('Must be more than 0')
		.required('Field is required')
		.nullable(),
	priceWithDiscount: yup
		.number()
		.typeError('Field must be a number')
		.positive('Must be more than 0')
		.required('Field is required')
		.nullable(),
	takeTimeFrom: yup.string().required('Field is required').nullable(),
	takeTimeTo: yup.string().required('Field is required').nullable(),
	placeId: yup.string().required('Field is required').nullable(),
});

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
		productTransaction.rollback();

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
		productTransaction.rollback();
		return res.status(500).json({
			success: false,
			errors: [{ error: e }],
		});
	}

	const images = req.files;
	const files = [];

	// if (!images.length) {
	// 	productTransaction.rollback();

	// 	return res.status(400).json({
	// 		success: false,
	// 		errors: [
	// 			{
	// 				field: 'Images',
	// 				error: 'Images are required',
	// 			},
	// 		],
	// 	});
	// }

	for await (const image of images) {
		try {
			const imageData = await Image.create(
				{
					ProductId: product.id,
					url: image.path,
				},
				{
					transaction: productTransaction,
				}
			);

			files.push(imageData.toJSON());
		} catch (e) {
			productTransaction.rollback();

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

	productTransaction.commit();

	return res.status(201).json({
		success: true,
		data: {
			...product.toJSON(),
			images: files,
		},
	});
};

module.exports = createProduct;
