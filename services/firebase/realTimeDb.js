const { getDatabase } = require('firebase-admin/database');

const writeToDb = async (path, data) => {
	const db = getDatabase();
	const ref = db.ref(path);

	try {
		return new Promise((resolve, reject) => {
			ref.update(data, (error) => {
				if (error) {
					return reject(error);
				}

				resolve();
			});
		});
	} catch (e) {}
};

module.exports = writeToDb;
