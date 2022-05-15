const express = require('express');
const create = require('./../controllers/request/create.js');
const contact = require('./../controllers/request/contact.js');
const router = express.Router();

router.post('/create', create);
router.post('/contact', contact);

module.exports = router;
