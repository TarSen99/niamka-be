const yup = require('yup');
const validate = require('./../../helpers/validate');
const { Request } = require('./../../models');

const schema = yup.object().shape({
	firstName: yup.string().required("Поле є обо'язковим"),
	lastName: yup.string().required("Поле є обо'язковим"),
	email: yup.string().required("Поле є обо'язковим").email('Некоректний емейл'),
	mobile: yup.string().nullable(),
	establishmentName: yup.string().required("Поле є обо'язковим"),
	establishmentType: yup.string().required("Поле є обо'язковим"),
	city: yup.string().required("Поле є обо'язковим"),
});

const addRequest = async (req, res) => {
	const {
		firstName,
		lastName,
		email,
		mobile,
		establishmentName,
		establishmentType,
		city,
	} = req.body;

	const v = await validate(schema, {
		firstName,
		lastName,
		email,
		mobile,
		establishmentName,
		establishmentType,
		city,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let requestData;

	try {
		requestData = await Request.create({
			firstName,
			lastName,
			email,
			mobile,
			establishmentName,
			establishmentType,
			city,
			type: 'request',
		});
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			success: false,
			errors: [
				{
					field: 'e',
					error: e,
				},
			],
		});
	}

	return res.status(200).json({
		success: true,
		data: requestData.toJSON(),
	});
};

module.exports = addRequest;
