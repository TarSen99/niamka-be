const Product = require('../../models/Product');
const Company = require('../../models/Company');
const Place = require('../../models/Place');
const Image = require('../../models/Image');
const { getPagDetails } = require('../../helpers/pagination');
const sequelize = require('../../database');
const { Sequelize } = require('sequelize');

const RADIUS = 10000;

const ORDER_OPTIONS = {
	date: 'id',
	price: 'priceWithDiscount',
	distance: 'distance',
};

const getProductsList = async (req, res) => {
	const { offset, limit, meta } = getPagDetails(req.query);
	const { orderBy = 'date' } = req.query;

	let order;
	let dir = 'DESC';
	let orderObj = [];

	if (ORDER_OPTIONS[orderBy]) {
		order = ORDER_OPTIONS[orderBy];
	}

	if (order !== 'id') {
		dir = 'ASC';
	}

	orderObj = [order, dir];

	if (order === 'distance') {
		orderObj = [Sequelize.literal('distance'), dir];
	}

	let data;

	try {
		data = await Product.findAndCountAll({
			distinct: true,
			offset,
			limit,
			attributes: {
				include: [
					[
						sequelize.fn(
							'ST_DistanceSphere',
							sequelize.fn(
								'ST_SetSRID',
								sequelize.fn('ST_MakePoint', 24.7048009, 48.9220978),
								4326
							),
							sequelize.col('Place.location')
						),
						'distance',
					],
				],
			},
			include: [
				Image,
				Company,
				{
					model: Place,
					required: true,
					duplicating: false,
					// attributes: {
					// 	include: [
					// 		[
					// 			Sequelize.fn(
					// 				'ST_DistanceSphere',
					// 				Sequelize.fn(
					// 					'ST_SetSRID',
					// 					Sequelize.fn('ST_MakePoint', 24.7048009, 48.9220978),
					// 					4326
					// 				),
					// 				Sequelize.col('location')
					// 			),
					// 			'distance',
					// 		],
					// 	],
					// },
				},
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
