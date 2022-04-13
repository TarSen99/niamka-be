const { clearCookie } = require('./../../helpers/cookie');

const logout = async (req, res) => {
	clearCookie(res, 'token');
	clearCookie(res, 'data');
	clearCookie(res, 'role');
	clearCookie(res, 'companyId');

	return res.status(200).json({
		success: true,
	});
};

module.exports = logout;
