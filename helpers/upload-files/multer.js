const multer = require('multer');
const customStorage = require('./storage.js');
const { BUCKET_NAME } = require('./s3.js');

const storage = customStorage({
	destination: function (req, file, cb) {
		cb(null, BUCKET_NAME);
	},
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype == 'image/png' ||
			file.mimetype == 'image/jpg' ||
			file.mimetype == 'image/jpeg'
		) {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error('Only .png, .jpg and .jpeg format allowed!'));
		}
	},
});

const upload = multer({ storage: storage });
module.exports = upload;
