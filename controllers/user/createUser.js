const app = require('./../../services/firebase');
const User = require('./../../models/User');
const { writeCookie } = require('./../../helpers/cookie');
const { getAuth } = require('firebase-admin/auth');
const yup = require('yup');
const validate = require('./../../helpers/validate');
const getDbErrors = require('./../../helpers/validate/getDbErrors.js');

const validationSchema = yup.object().shape({
	name: yup.string().required('Field is required').nullable(),
	token: yup.string().required('Field is required').nullable(),
	registerType: yup.string().required('Field is required').nullable(),
	address: yup.string().nullable(),
	email: yup
		.string()
		.email('Email is not valid')
		.when('registerType', (registerType, schema) => {
			if (registerType === 'email') {
				return schema.required('Field is required').nullable();
			}

			return schema.nullable();
		}),
	phone: yup.string().when('registerType', (registerType, schema) => {
		if (registerType === 'phone') {
			return schema
				.min(10, 'Phone must contain 10 characters')
				.max(10, 'Phone must contain 10 characters')
				.required('Field is required')
				.nullable();
		}

		return schema.nullable();
	}),
});

const creatUser = async (req, res) => {
	const { name, address, phone, email, token, registerType } = req.body;

	const v = await validate(validationSchema, {
		name,
		address,
		phone,
		email,
		token,
		registerType,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	const auth = getAuth(app);

	try {
		await auth.verifyIdToken(token);
	} catch (e) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'token',
					error: 'Token is not valid',
				},
			],
		});
	}

	let user;

	try {
		user = await User.create({
			name,
			address,
			phone,
			email,
			registerType: registerType,
			isEmailVerified: false,
		});
	} catch (e) {
		return res.status(400).json({
			success: false,
			errors: getDbErrors(e),
		});
	}

	writeCookie(res, 'data', user.id);

	return res.status(200).json({
		success: true,
		data: user.toJSON(),
	});
};

module.exports = creatUser;
