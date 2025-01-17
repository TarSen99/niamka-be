const yup = require('yup');
const validate = require('./../../helpers/validate');
const { PushToken } = require('./../../models');
const { FIREBASE_SERVER_KEY } = require('./../../constants');
const axios = require('axios').default;

const validationSchema = yup.object().shape({
	type: yup.string().required('Field is required').nullable(),
	token: yup.string().required('Field is required').nullable(),
});

const AddPushToken = async (req, res) => {
	const { type, token } = req.body;
	const { id } = req.headers;

	const v = await validate(validationSchema, {
		type,
		token,
	});

	if (!v.valid) {
		return res.status(400).json({
			success: false,
			errors: v.errors,
		});
	}

	let tokenValue = token;

	if (type === 'ios') {
		try {
			const response = await axios.post(
				'https://iid.googleapis.com/iid/v1:batchImport',
				{
					application: 'app.niamka.com',
					sandbox: false,
					apns_tokens: [token],
				},
				{
					headers: {
						Authorization: `key=${FIREBASE_SERVER_KEY}`,
					},
				}
			);

			const results = response.data.results;
			tokenValue = results[0].registration_token;
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
	}

	let tokenInstance;

	try {
		await PushToken.destroy({
			where: {
				token: tokenValue,
			},
		});
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

	try {
		tokenInstance = await PushToken.create({
			type,
			token: tokenValue,
			UserId: id,
		});
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
		data: tokenInstance.toJSON(),
	});
};

module.exports = AddPushToken;
