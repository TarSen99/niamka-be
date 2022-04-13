const User = require('./../../models/User');
const app = require('./../../services/firebase');
const { getAuth } = require('firebase-admin/auth');

const checkAndDeleteIfUserExistsInFirebase = async ({ email, phone }) => {
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

const checkIfUserExists = async (req, res) => {
	const { email, phone } = req.body;

	const filter = {};

	if (email) {
		filter.email = email;
	} else {
		filter.phone = phone;
	}

	if (!Object.keys(filter).length) {
		return res.status(400).json({
			success: false,
			errors: [
				{
					field: 'email',
					error: 'Email is required',
				},
			],
		});
	}

	const user = await User.findOne({
		where: filter,
	});

	if (!user) {
		const uid = await checkAndDeleteIfUserExistsInFirebase({ email, phone });

		if (uid) {
			try {
				const auth = getAuth(app);
				await auth.deleteUser(uid);
			} catch (e) {
				console.log(e);
			}
		}
	}

	return res.status(200).json({
		success: true,
		data: !!user,
	});
};

module.exports = checkIfUserExists;
