const { User, ProfileSettings } = require('./../../models');
const yup = require('yup');
const validate = require('./../../helpers/validate');
const getDbErrors = require('./../../helpers/validate/getDbErrors.js');

const validationSchema = yup.object().shape({
	name: yup.string().nullable(),
	address: yup.string().nullable(),
	email: yup.string().email('Email is not valid').nullable(),
	latitude: yup.number().typeError('Field must be a number').nullable(),
	longtitude: yup.number().typeError('Field must be a number').nullable(),
});

const updateUser = async (req, res) => {
	const { name, latitude, longtitude, address, email } = req.body;
	const { id } = req.headers;

	const v = await validate(validationSchema, {
		name,
		latitude,
		longtitude,
		email,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let user;

	try {
		user = await User.findByPk(id, {
			include: ProfileSettings,
		});
	} catch (e) {
		return res.status(400).json({
			success: false,
			errors: getDbErrors(e),
		});
	}

	if (!user) {
		return res.status(404).json({
			success: false,
			errors: [
				{
					field: 'id',
					error: 'User not found',
				},
			],
		});
	}

	if (email) {
		user.email = email;
	}

	if (name) {
		user.name = name;
	}

	if (latitude && longtitude) {
		user.latitude = latitude;
		user.longtitude = longtitude;
		user.address = address;
	}

	try {
		await user.save();
	} catch (e) {
		return res.status(400).json({
			success: false,
			errors: getDbErrors(e),
		});
	}

	return res.status(200).json({
		success: true,
		data: user.toJSON(),
	});
};

module.exports = updateUser;
