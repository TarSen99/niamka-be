const aws = require('aws-sdk');

const ACCESS_KEY_ID = 'AKIARCRBO2E4RE5BOX5B';
const SECRET = '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';
const REGION = 'eu-central-1';
const BUCKET_NAME = 'niamka';

module.exports = {
	BUCKET_NAME,
	signup() {
		aws.config.setPromisesDependency();
		aws.config.update({
			accessKeyId: ACCESS_KEY_ID,
			secretAccessKey: SECRET,
			region: REGION,
		});

		return new aws.S3();
	},

	upload(s3, { file, name, bucket }) {
		const params = {
			ACL: 'public-read',
			Bucket: bucket,
			Body: file,
			Key: name,
			ContentType: 'image/jpeg',
		};

		return new Promise((resolve, reject) => {
			s3.upload(params, (err, data) => {
				if (err) {
					reject(err);
				}

				resolve({
					path: data.Location,
				});

				// if (data) {
				// 	resolve(data.Location);
				// }

				// if (data) {
				// 	fs.unlinkSync(req.file.path); // Empty temp folder
				// 	const locationUrl = data.Location;
				// 	let newUser = new Users({ ...req.body, avatar: locationUrl });
				// 	newUser
				// 		.save()
				// 		.then((user) => {
				// 			res.json({ message: 'User created successfully', user });
				// 		})
				// 		.catch((err) => {
				// 			console.log('Error occured while trying to save to DB');
				// 		});
				// }
			});
		});
	},
};
