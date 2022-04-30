const yup = require('yup');

const validationSchema = yup.object().shape({
	title: yup.string().required('Field is required').nullable(),
	description: yup
		.string()
		.required('Field is required')
		.max(200, 'Max length 200 characters')
		.nullable(),
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

module.exports = validationSchema;
