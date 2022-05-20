const { User, Company, ProfileSettings } = require('./../../models');

const getUserDetails = async (req, res) => {
	const { userid } = req.headers;

	let user;

	try {
		user = await User.findByPk(userid, {
			include: [
				{
					model: Company,
					attributes: {
						exclude: ['balance'],
					},
				},
				ProfileSettings,
			],
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

	return res.status(200).json({
		success: true,
		data: user.toJSON(),
	});
};

module.exports = getUserDetails;
