const { Product, Company, Place, Image } = require('../../models');
const { getPagDetails } = require('../../helpers/pagination');
const { getLocationData } = require('../../helpers/location');
const { Sequelize, Op } = require('sequelize');
const { PRODUCT_STATUSES } = require('../../constants/index.js');
const { isNull } = require('../../helpers');
const sequelize = require('../../database');

const getNearestProducts = async (req, res) => {
	const { offset, limit, meta } = getPagDetails(req.query);
	const dir = 'ASC';
	const orderObj = [Sequelize.literal('distance'), dir];

	const { location, radius } = req.headers;

	if (isNull(location)) {
		return res.status(200).json({
			success: true,
			data: [],
			meta: {
				...meta,
				count: 0,
			},
		});
	}

	const { distanceAttr, currRadius, currLocation } = getLocationData(
		location,
		radius
	);

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
					// sequelize.literal(
					// 	`(SELECT ST_Distance(ST_SetSRID(ST_MakePoint(${currLocation.longtitude}, ${currLocation.latitude}), 4326), "Place"."location") +
					// 		 (SELECT ST_Distance(ST_SetSRID(ST_MakePoint(${currLocation.longtitude}, ${currLocation.latitude}), 4326), "Place"."location") * 0.2) )`
					// ),
					sequelize.where(
						sequelize.literal(
							`(SELECT ST_Distance(ST_SetSRID(ST_MakePoint(${currLocation.longtitude}, ${currLocation.latitude}), 4326), "Place"."location") )`
						),
						'>',
						currRadius
					),
				],
			},
			include: [
				{
					model: Company,
					required: true,
					duplicating: false,
					attributes: {
						exclude: ['balance'],
					},
				},
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

module.exports = getNearestProducts;
