const express = require('express');
const router = express.Router();
const upload = require('./../helpers/upload-files/multer.js');

const createProduct = require('./../controllers/product/createProduct.js');
const updateProduct = require('./../controllers/product/updateProduct.js');
const toggleAvailability = require('./../controllers/product/toggleAvailability.js');
const viewProductDetails = require('./../controllers/product/viewProductDetails.js');
const getProductsList = require('./../controllers/product/getProductsList.js');
const DeletePlace = require('./../controllers/place/DeletePlace.js');
const getNearestProducts = require('./../controllers/product/getNearestProducts.js');

const isLoggedIn = require('../middleware/isLoggedIn.js');

const handleUploadFiles = (req, res, next) => {
	upload.array('images', 5)(req, res, (err) => {
		if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
			throw new Error(err.text);
		}

		next();
	});
};

/* GET users listing. */
router.get('/nearest', getNearestProducts);
router.get('/', getProductsList);

router.post('/add', isLoggedIn, handleUploadFiles, createProduct);
router.put('/:productId/update', isLoggedIn, handleUploadFiles, updateProduct);
router.put('/toggle/:id', isLoggedIn, toggleAvailability);
router.get('/:id', isLoggedIn, viewProductDetails);
router.delete('/:placeId', isLoggedIn, DeletePlace);

module.exports = router;
