const app = require('../../services/firebase');
const User = require('../../models/User');
const { writeCookie } = require('../../helpers/cookie');
const { getAuth } = require('firebase-admin/auth');
const yup = require('yup');
const validate = require('../../helpers/validate');
const getDbErrors = require('../../helpers/validate/getDbErrors.js');

const validationSchema = yup.object().shape({
	token: yup.string().required('Field is required').nullable(),
	phone: yup
		.string()
		.min(13, 'Phone must contain 13 characters')
		.max(13, 'Phone must contain 13 characters')
		.required('Field is required')
		.nullable(),
});

const loginUserWithPhone = async (req, res) => {
	const { phone, token } = req.body;

	const v = await validate(validationSchema, {
		phone,
		token,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	// without "+"
	const withoutStartPhone = phone.slice(1, phone.length);

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
		[row, created] = await User.findOrCreate({
			where: {
				phone: withoutStartPhone,
			},
			defaults: {
				phone: withoutStartPhone,
				registerType: 'phone',
				isEmailVerified: true,
			},
		});

		user = row;
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

module.exports = loginUserWithPhone;
