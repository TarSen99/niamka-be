const { getMessaging } = require('firebase-admin/messaging');
const app = require('./index.js');

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
					imageUrl: image,
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
				imageUrl: image,
			},
			token: token,
		},
	]);
};

module.exports = sendMessage;
