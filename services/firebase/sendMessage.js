const { getMessaging } = require('firebase-admin/messaging');
const app = require('./index.js');
const { isNull } = require('./../../helpers/index.js');

const getImage = (image) => {
	const imageUrl = isNull(image) ? null : image;

	if (imageUrl) {
		return {
			imageUrl,
		};
	}

	return {};
};

const sendMessage = async ({ token, title, body, data, image }) => {
	return await getMessaging(app).sendAll([
		{
			apns: {
				headers: {
					'mutable-content': '1',
				},
				payload: {
					aps: {
						mutableContent: true,
						contentAvailable: true,
						sound: 'default',
					},
				},
				fcmOptions: {
					...getImage(image),
				},
			},
			data,
			android: {
				notification: {
					sound: 'default',
				},
			},
			notification: {
				title,
				body,
				...getImage(image),
			},
			token: token,
		},
	]);
};

module.exports = sendMessage;
