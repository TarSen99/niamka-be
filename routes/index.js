const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
	return res
		.json({
			success: true,
		})
		.status(200);
});

router.get('/callback', function (req, res, next) {
	return res
		.json({
			success: true,
		})
		.status(200);
});

router.post('/callback', function (req, res, next) {
	return res
		.json({
			success: true,
		})
		.status(200);
});

module.exports = router;