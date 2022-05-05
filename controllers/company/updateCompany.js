const { Company } = require('./../../models');
const yup = require('yup');
const validate = require('./../../helpers/validate');
const { ESTABLISHMENT_TYPES_AS_ARRAY } = require('./../../constants');

const validationSchema = yup.object().shape({
	id: yup.string().required('Field is required').nullable(),
	name: yup
		.string()
		.required('Field is required')
		.nullable()
		.max(40, 'Max length is 40'),
	description: yup.string().max(250, 'Max length is 250 characters').nullable(),
	instagram: yup.string().nullable().max(100, 'Max length is 100'),
	facebook: yup.string().nullable().max(100, 'Max length is 100'),
	type: yup
		.string()
		.required('Field is required')
		.oneOf(ESTABLISHMENT_TYPES_AS_ARRAY, 'Type is not valid'),
});

const updateCompany = async (req, res) => {
	const {
		name,
		instagram,
		facebook,
		id: companyId,
		type,
		description,
	} = req.body;
	const image = req.file;

	const v = await validate(validationSchema, {
		name,
		instagram,
		facebook,
		id: companyId,
		type,
		description,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	try {
		await Company.update(
			{
				name,
				instagram,
				facebook,
				type,
				description,
			},
			{
				where: {
					id: companyId,
				},
			}
		);
	} catch (e) {
		console.log(e);
		return res.status(400).json({
			success: false,
		});
	}

	return res.status(200).json({
		success: true,
	});
};

module.exports = updateCompany;
