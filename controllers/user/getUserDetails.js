const User = require('./../../models/User');
const Company = require('./../../models/Company');

const getUserDetails = async (req, res) => {
	const { id } = req.headers;

	const user = await User.findByPk(id, {
		include: Company,
	});

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
