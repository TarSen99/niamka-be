const app = require('./../../services/firebase');
const { User, Company, ProfileSettings } = require('./../../models');
const { getAuth } = require('firebase-admin/auth');
const yup = require('yup');
const validate = require('./../../helpers/validate');
const { writeCookie } = require('./../../helpers/cookie');
const { Op } = require('sequelize');

const validationSchema = yup.object().shape({
	loginValue: yup
		.string()
		.email('Email is not valid')
		.required('Field is required'),
	token: yup.string().required('Field is required'),
});

const login = async (req, res) => {
	const { token, loginValue } = req.body;

	const v = await validate(validationSchema, {
		loginValue,
		token,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}
	let user;

	try {
		user = await User.findOne({
			where: {
				[Op.or]: [{ email: loginValue }, { phone: loginValue }],
			},
			include: [Company, ProfileSettings],
		});
	} catch (e) {
		console.log(e);
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'loginValue',
					error: 'User does not exist',
				},
			],
		});
	}

	if (!user) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'loginValue',
					error: 'User does not exist',
				},
			],
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

	const company = (user.Companies && user.Companies[0]) || {};
	const role = company.UsersAndCompanies?.role;

	writeCookie(res, 'data', user.id);
	writeCookie(res, 'role', role);
	writeCookie(res, 'companyId', company.id);

	return res.status(200).json({
		success: true,
		data: user.toJSON(),
	});
};

module.exports = login;
