const { getAuth } = require('firebase-admin/auth');
const app = require('./../services/firebase');

const isLoggedIn = async (req, res, next) => {
	const token = req.headers.token || '';

	const auth = getAuth(app);

	try {
		await auth.verifyIdToken(token);
	} catch (e) {
		return res.status(401).json({
			id: 'User is not authenticated',
		});
	}

	const userId = req.headers.userid || req.signedCookies.data;
	const companyId = req.headers.companyid || req.signedCookies.companyId;

	if (!userId) {
		return res.status(401).json({
			id: 'User is not authenticated',
		});
	}

	req.headers.id = userId;
	req.headers.companyId = companyId;

	next();
};

module.exports = isLoggedIn;
