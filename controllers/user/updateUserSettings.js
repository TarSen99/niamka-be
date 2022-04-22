const { User, ProfileSettings } = require('./../../models');
const yup = require('yup');
const validate = require('./../../helpers/validate');

const validationSchema = yup.object().shape({
	searchRadius: yup
		.number('Should be a radius')
		.typeError('Field must be a number')
		.positive('Must be more than 0')
		.min(1)
		.max(60)
		.required('Field is required')
		.nullable(),
	sendNewProductNotifications: yup
		.boolean('Type is not valid')
		.required('Field is required')
		.nullable(),
});

const updateUserSettings = async (req, res) => {
	const { userid } = req.headers;
	const { searchRadius, sendNewProductNotifications } = req.body;

	const v = await validate(validationSchema, {
		searchRadius,
		sendNewProductNotifications,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let user;

	try {
		user = await User.findByPk(userid, {
			include: [ProfileSettings],
		});
	} catch (e) {
		console.log(e);

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

	user.ProfileSetting.searchRadius = searchRadius;
	user.ProfileSetting.sendNewProductNotifications = sendNewProductNotifications;

	try {
		await user.ProfileSetting.save();
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
		data: user.ProfileSetting.toJSON(),
	});
};

module.exports = updateUserSettings;
