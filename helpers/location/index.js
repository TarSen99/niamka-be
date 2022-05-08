const sequelize = require('../../database');
const { Sequelize } = require('sequelize');
const { oneKMInDegrees } = require('./../../constants/index.js');

const getLocationData = (locationData, radius) => {
	const currLocation = JSON.parse(locationData || '{}') || {};

	let distanceAttr = {};
	let withinRadius = {};
	let currRadius = radius * oneKMInDegrees;

	const hasLocation = Object.keys(currLocation).length;

	if (currLocation && hasLocation) {
		distanceAttr = {
			include: [
				// [
				// 	Sequelize.fn(
				// 		'ST_DistanceSphere',
				// 		Sequelize.fn(
				// 			'ST_SetSRID',
				// 			Sequelize.fn(
				// 				'ST_MakePoint',
				// 				currLocation.longtitude,
				// 				currLocation.latitude
				// 			),
				// 			4326
				// 		),
				// 		Sequelize.col('Place.location')
				// 	),
				// 	'distance',
				// ],
				[
					Sequelize.literal(
						`(SELECT ST_DistanceSphere(ST_SetSRID(ST_MakePoint(${currLocation.longtitude}, ${currLocation.latitude}), 4326), "Place"."location") +
						(SELECT ST_DistanceSphere(ST_SetSRID(ST_MakePoint(${currLocation.longtitude}, ${currLocation.latitude}), 4326), "Place"."location") * 0.2) )`
					),
					'distance',
				],
			],
		};

		// calculates distance in degrees
		withinRadius = sequelize.where(
			sequelize.literal(
				`(SELECT ST_Distance(ST_SetSRID(ST_MakePoint(${currLocation.longtitude}, ${currLocation.latitude}), 4326), "Place"."location") +
				 (SELECT ST_Distance(ST_SetSRID(ST_MakePoint(${currLocation.longtitude}, ${currLocation.latitude}), 4326), "Place"."location") * 0.2) )`
			),
			'<',
			currRadius
			// sequelize.literal(
			// 	`ST_DWithin("Place"."location", ST_SetSRID(ST_MakePoint(${currLocation.longtitude}, ${currLocation.latitude}), 4326), ${currRadius * 0.9})`
			// ),
			// sequelize.fn(
			// 	'ST_DWithin',
			// 	sequelize.col('Place.location'),
			// 	sequelize.fn(
			// 		'ST_SetSRID',
			// 		sequelize.fn(
			// 			'ST_MakePoint',
			// 			currLocation.longtitude,
			// 			currLocation.latitude
			// 		),
			// 		4326
			// 	),
			// 	currRadius * 0.9
			// ),
			// true
		);
	}

	return { distanceAttr, hasLocation, withinRadius, currRadius, currLocation };
};

module.exports = {
	getLocationData,
};
