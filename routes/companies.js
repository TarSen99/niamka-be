const express = require('express');
const router = express.Router();
const registerCompany = require('./../controllers/company/registerCompany.js');
const getCompanyDetails = require('./../controllers/company/getCompanyDetails.js');
const addEmployee = require('./../controllers/company/addEmployee.js');
const updateEmployee = require('./../controllers/company/updateEmployee.js');
const removeEmployee = require('./../controllers/company/removeEmployee.js');
const getCompanyProductsList = require('../controllers/product/getCompanyProductsList.js');
const getAllOrders = require('../controllers/order/getAllOrders.js');
const updateCompany = require('../controllers/company/updateCompany.js');
const getCompaniesList = require('../controllers/company/getCompaniesList.js');
const processPayment = require('../controllers/company/processPayment.js');
const upload = require('./../helpers/upload-files/multer.js');
const hasRole = require('./../middleware/hasRole.js');
const { USER_ROLES } = require('./../constants');

const isLoggedIn = require('../middleware/isLoggedIn.js');

const handleUploadFiles = (req, res, next) => {
	upload.single('logo')(req, res, (err) => {
		if (err && err.code !== 'LIMIT_UNEXPECTED_FILE') {
			throw new Error(err.text);
		}

		next();
	});
};

router.get('/', isLoggedIn, hasRole(USER_ROLES.ADMIN), getCompaniesList);
router.put(
	'/:companyId/payment',
	isLoggedIn,
	hasRole(USER_ROLES.ADMIN),
	processPayment
);
router.post(
	'/register',
	isLoggedIn,
	handleUploadFiles,
	hasRole(USER_ROLES.ADMIN),
	registerCompany
);
router.put(
	'/update/:companyId',
	isLoggedIn,
	hasRole(USER_ROLES.OWNER, { field: 'companyId', urlField: 'companyId' }),
	handleUploadFiles,
	updateCompany
);
router.get('/:companyId/products', isLoggedIn, getCompanyProductsList);
router.get(
	'/:companyId/orders',
	isLoggedIn,
	hasRole(
		[
			USER_ROLES.OWNER,
			USER_ROLES.EMPLOYEE,
			USER_ROLES.MANAGER,
			USER_ROLES.ADMIN,
		],
		{
			field: 'companyId',
			urlField: 'companyId',
		}
	),
	getAllOrders
);
router.get('/:companyId', isLoggedIn, getCompanyDetails);
router.post(
	'/:companyId/employee/add',
	isLoggedIn,
	hasRole([USER_ROLES.OWNER, USER_ROLES.MANAGER, USER_ROLES.ADMIN], {
		field: 'companyId',
		urlField: 'companyId',
	}),
	addEmployee
);
router.put(
	'/:companyId/employee/:employeeId/update',
	isLoggedIn,
	hasRole([USER_ROLES.OWNER, USER_ROLES.MANAGER, USER_ROLES.ADMIN], {
		field: 'companyId',
		urlField: 'companyId',
	}),
	updateEmployee
);
router.delete(
	'/:companyId/employees/:employeeId',
	isLoggedIn,
	hasRole([USER_ROLES.OWNER, USER_ROLES.MANAGER, USER_ROLES.ADMIN], {
		field: 'companyId',
		urlField: 'companyId',
	}),
	removeEmployee
);

module.exports = router;
