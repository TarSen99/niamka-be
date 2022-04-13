const app = require('./../../services/firebase');
const { getAuth } = require('firebase-admin/auth');

const checkIfUserExistsInFirebase = async ({ email, phone }) => {
	const auth = getAuth(app);
	const findValue = email || phone;

	const method = email ? 'getUserByEmail' : 'getUserByPhoneNumber';

	try {
		const userRecord = await auth[method](findValue);

		return userRecord.uid;
	} catch (e) {
		return false;
	}
};

module.exports = checkIfUserExistsInFirebase;
