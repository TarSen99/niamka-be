const { getAuth } = require('firebase-admin/auth');
const app = require('./../services/firebase');
const { decrypt } = require('./../helpers/encrypt');

const isNull = (v) => {
	if (!v) {
		return true;
	}

	return v === 'null' || v === 'undefined' || v === 'NaN';
};

const isLoggedIn = async (req, res, next) => {
	const token = req.headers.token || '';
	const encrypted = JSON.parse(req.headers.encrypted || '{}');

	let decrypted;

	try {
		decrypted = decrypt(encrypted);
	} catch (e) {
		return res.status(401).json({
			id: 'User is not authenticated',
		});
	}

	const userData = JSON.parse(decrypted || '{}');

	if (!Object.keys(userData).length) {
		return res.status(401).json({
			id: 'User is not authenticated',
		});
	}

	const auth = getAuth(app);

	try {
		await auth.verifyIdToken(token);
	} catch (e) {
		if (e.code !== 'auth/id-token-expired') {
			return res.status(401).json({
				id: 'User is not authenticated',
			});
		}
	}

	const userId = req.headers.userid || userData.userId;
	const companyId = userData.companyId;
	const role = userData.role;

	if (isNull(userId)) {
		return res.status(401).json({
			id: 'User is not authenticated',
		});
	}

	req.headers.id = userId;
	req.headers.companyId = companyId;
	req.headers.role = role;

	next();
};

module.exports = isLoggedIn;
