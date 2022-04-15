const Product = require('../../models/Product');
const Company = require('../../models/Company');
const Place = require('../../models/Place');
const Image = require('../../models/Image');
const { getPagDetails } = require('../../helpers/pagination');
const { getLocationData } = require('../../helpers/location');
const { Sequelize, Op } = require('sequelize');
const { PRODUCT_STATUSES } = require('../../constants/index.js');

const RADIUS = 10000;

const ORDER_OPTIONS = {
	date: 'id',
	price: 'priceWithDiscount',
	distance: 'distance',
};

const getProductsList = async (req, res) => {
	const { offset, limit, meta } = getPagDetails(req.query);
	const { orderBy = 'date', search = '' } = req.query;
	const { location } = req.headers;
	const { distanceAttr, hasLocation } = getLocationData(location);

	let order;
	let dir = 'DESC';
	let orderObj = [];
	let searchReq = {};

	if (ORDER_OPTIONS[orderBy]) {
		order = ORDER_OPTIONS[orderBy];
	}

	if (order !== 'id') {
		dir = 'ASC';
	}

	orderObj = [order, dir];

	if (order === 'distance') {
		if (hasLocation) {
			orderObj = [Sequelize.literal('distance'), dir];
		} else {
			orderObj = ['id', 'DESC'];
		}
	}

	if (search && search !== null && search !== 'null') {
		searchReq = {
			[Op.or]: {
				title: {
					[Op.iLike]: `%${search}%`,
				},
				description: {
					[Op.iLike]: `%${search}%`,
				},
				'$Company.name$': {
					[Op.iLike]: `%${search}%`,
				},
			},
		};
	}

	let data;

	try {
		data = await Product.findAndCountAll({
			distinct: true,
			offset,
			limit,
			attributes: {
				...distanceAttr,
			},
			where: {
				createdAt: {
					[Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000),
				},
				status: {
					[Op.in]: [PRODUCT_STATUSES.ACTIVE, PRODUCT_STATUSES.OUT_OF_STOCK],
				},
				...searchReq,
			},
			include: [
				{ model: Company, required: true, duplicating: false },
				{
					model: Place,
					required: true,
					duplicating: false,
				},
				Image,
			],
			order: [orderObj],
		});
	} catch (e) {
		console.log(e);
		return res.status(500).json({
			success: true,
		});
	}

	const asData = data.rows.map((item) => {
		return item.toJSON();
	});

	return res.status(200).json({
		success: true,
		data: asData,
		meta: {
			...meta,
			count: data.count,
		},
	});
};

module.exports = getProductsList;
