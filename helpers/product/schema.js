const yup = require('yup');

const validationSchema = yup.object().shape({
	title: yup
		.string()
		.when('productType', (productType, schema) => {
			if (productType === 'regular') {
				return schema.required('Field is required');
			}

			return schema;
		})
		.nullable(true),
	description: yup
		.string()
		.required('Field is required')
		.max(200, 'Max length 200 characters')
		.nullable(),
	category: yup
		.string()
		.required('Field is required')
		.max(50, 'Max length 50 characters')
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
	productType: yup
		.string()
		.required('Field is required')
		.max(30, 'Max length 30 characters')
		.nullable(),
	takeTimeFrom: yup.string().required('Field is required').nullable(),
	takeTimeTo: yup.string().required('Field is required').nullable(),
	placeId: yup.string().required('Field is required').nullable(),
});

module.exports = validationSchema;
