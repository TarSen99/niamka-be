const yup = require('yup');
const validate = require('./../../helpers/validate');
const { Request } = require('./../../models');

const schema = yup.object().shape({
	firstName: yup.string().required("Поле є обо'язковим"),
	email: yup.string().required("Поле є обо'язковим").email('Некоректний емейл'),
	mobile: yup.string().required("Поле є обо'язковим"),
	message: yup.string().required("Поле є обо'язковим").max(250, 'Max is 250'),
});

const addRequest = async (req, res) => {
	const { firstName, email, mobile, message, type = 'contact' } = req.body;

	const v = await validate(schema, {
		firstName,
		email,
		mobile,
		message,
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
			email,
			mobile,
			message,
			type,
		});
	} catch (e) {
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
