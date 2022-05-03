const { Company } = require('./../../models');
const yup = require('yup');
const validate = require('./../../helpers/validate');

const validationSchema = yup.object().shape({
	id: yup.string().required('Field is required').nullable(),
	name: yup
		.string()
		.required('Field is required')
		.nullable()
		.max(40, 'Max length is 100'),
	instagram: yup.string().nullable().max(100, 'Max length is 100'),
	facebook: yup.string().nullable().max(100, 'Max length is 100'),
});

const updateCompany = async (req, res) => {
	const { name, instagram, facebook, id: companyId } = req.body;
	const image = req.file;

	const v = await validate(validationSchema, {
		name,
		instagram,
		facebook,
		id: companyId,
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
