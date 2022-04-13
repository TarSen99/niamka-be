const express = require('express');
const router = express.Router();
const registerCompany = require('./../controllers/company/registerCompany.js');
const getCompanyDetails = require('./../controllers/company/getCompanyDetails.js');
const addEmployee = require('./../controllers/company/addEmployee.js');
const updateEmployee = require('./../controllers/company/updateEmployee.js');
const removeEmployee = require('./../controllers/company/removeEmployee.js');
const getCompanyProductsList = require('../controllers/product/getCompanyProductsList.js');
const getAllOrders = require('../controllers/order/getAllOrders.js');
const upload = require('./../helpers/upload-files/multer.js');

const isLoggedIn = require('../middleware/isLoggedIn.js');

const handleUploadFiles = (req, res, next) => {
	upload.single('logo')(req, res, (err) => {
		if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
			throw new Error(err.text);
		}

		next();
	});
};

router.post('/register', isLoggedIn, handleUploadFiles, registerCompany);
router.get('/:companyId/products', isLoggedIn, getCompanyProductsList);
router.get('/:companyId/orders', isLoggedIn, getAllOrders);
router.get('/:companyId', isLoggedIn, getCompanyDetails);
router.post('/employee/add', isLoggedIn, addEmployee);
router.put('/employee/:employeeId/update', isLoggedIn, updateEmployee);
router.delete('/employees/:employeeId', isLoggedIn, removeEmployee);

module.exports = router;
