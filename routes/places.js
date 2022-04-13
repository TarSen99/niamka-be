const express = require('express');
const router = express.Router();

const getPlaceProductsList = require('../controllers/product/getPlaceProductsList.js');
const getAllOrders = require('../controllers/order/getAllOrders.js');
const AddNewPlace = require('../controllers/place/AddNewPlace.js');
const DeletePlace = require('../controllers/place/DeletePlace.js');

const isLoggedIn = require('../middleware/isLoggedIn.js');

router.get('/:placeId/products', isLoggedIn, getPlaceProductsList);
router.get('/:placeId/orders', isLoggedIn, getAllOrders);
router.post('/new', isLoggedIn, AddNewPlace);
router.delete('/:placeId', isLoggedIn, DeletePlace);

module.exports = router;
