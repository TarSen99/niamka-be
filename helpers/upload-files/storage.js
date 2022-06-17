const fs = require('fs');
const sharp = require('sharp');
const { signup, upload } = require('./s3.js');
const path = require('path');

const s3 = signup();

function getDestination(req, file, cb) {
	cb(null, '/dev/null');
}

function MyCustomStorage(opts) {
	this.getDestination = opts.destination || getDestination;
}

MyCustomStorage.prototype._handleFile = function (req, file, cb) {
	this.getDestination(req, file, function (err, bucketname) {
		const name = path.join(
			__dirname,
			`../../public/images/${+Date.now()}-${file.originalname}.jpeg`
		);

		const outStream = fs.createWriteStream(name);
		const resized = sharp()
			.flatten({ background: 'white' })
			.resize(512, 512)
			.jpeg();

		file.stream.pipe(resized).pipe(outStream);

		outStream.on('error', cb);

		outStream.on('finish', function () {
			const readStream = fs.createReadStream(name);

			upload(s3, {
				file: readStream,
				name: `images/${+Date.now()}-${file.originalname}.jpeg`,
				bucket: bucketname,
			})
				.then(async (result) => {
					await fs.unlink(name, (err) => {
						if (err) {
							return cb(err);
						}

						cb(null, result);
					});
				})
				.catch((err) => {
					cb(err);
				});
		});
	});
};

MyCustomStorage.prototype._removeFile = function _removeFile(req, file, cb) {
	fs.unlink(file.path, cb);
};

module.exports = function (opts) {
	return new MyCustomStorage(opts);
};
