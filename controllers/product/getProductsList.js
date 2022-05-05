const { Product, Company, Place, Image } = require('../../models');
const { getPagDetails } = require('../../helpers/pagination');
const { getLocationData } = require('../../helpers/location');
const { Sequelize, Op } = require('sequelize');
const { PRODUCT_STATUSES } = require('../../constants/index.js');
const { addTimeToNow } = require('../../helpers/index.js');

const HOT_DISCOUNT_PERCENT_MIN = 60;

const ORDER_OPTIONS = {
	date: 'id',
	price: 'priceWithDiscount',
	distance: 'distance',
};

const FILTERS = {
	hot: 'hot',
	hurry_to_take: 'hurry_to_take',
	popular: 'popular',
};

const getFilterQuery = (filter) => {
	if (!FILTERS[filter]) {
		return {
			where: {},
			order: [],
		};
	}

	if (filter === FILTERS.hot) {
		return {
			where: {
				discountPercent: {
					[Op.gt]: HOT_DISCOUNT_PERCENT_MIN,
				},
				status: 'active',
			},
			order: [['discountPercent', 'DESC']],
		};
	}

	if (filter === FILTERS.hurry_to_take) {
		const maxTime = addTimeToNow(2);
		return {
			where: {
				takeTimeTo: {
					[Op.lt]: maxTime,
				},
				status: 'active',
			},
			order: [['takeTimeTo', 'ASC']],
		};
	}

	if (filter === FILTERS.popular) {
		return {
			where: {
				availableCount: {
					[Op.lt]: Sequelize.col('initialCount'),
				},
				status: 'active',
			},
			order: [
				[
					Sequelize.literal(
						'("Product"."initialCount" - "Product"."availableCount")'
					),
					'DESC',
				],
			],
		};
	}
};

const getProductsList = async (req, res) => {
	const { offset, limit, meta } = getPagDetails(req.query);
	const { orderBy = 'date', search = '', filter } = req.query;
	const { location, radius } = req.headers;
	const { distanceAttr, hasLocation, withinRadius } = getLocationData(
		location,
		radius
	);

	let filters = {
		where: {},
		order: [],
	};
	let order;
	let dir = 'DESC';
	let orderObj = [];
	let searchReq = {};

	if (filter) {
		filters = getFilterQuery(filter);
	}

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

	let orderResult = [orderObj];

	if (filters.order.length) {
		orderResult = filters.order;
	}

	try {
		data = await Product.findAndCountAll({
			distinct: true,
			offset,
			limit,
			attributes: {
				...distanceAttr,
			},
			where: {
				[Op.and]: [
					{
						createdAt: {
							[Op.gt]: new Date(new Date() - 24 * 60 * 60 * 1000),
						},
					},
					{
						status: {
							[Op.in]: [
								PRODUCT_STATUSES.ACTIVE,
								PRODUCT_STATUSES.OUT_OF_STOCK,
								PRODUCT_STATUSES.EXPIRED,
							],
						},
					},
					{
						...searchReq,
					},
					withinRadius,
					{
						...filters.where,
					},
				],
			},
			include: [
				{ model: Company, required: true, duplicating: false },
				{
					model: Place,
					required: true,
					duplicating: false,
					attributes: {
						// ...distanceAttr,
					},
				},
				Image,
			],
			order: orderResult,
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
