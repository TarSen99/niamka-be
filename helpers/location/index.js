const sequelize = require('../../database');

const getLocationData = (locationData) => {
	const currLocation = JSON.parse(locationData || '{}') || {};

	let distanceAttr = {};
	const hasLocation = Object.keys(currLocation).length;

	if (currLocation && hasLocation) {
		distanceAttr = {
			include: [
				[
					sequelize.fn(
						'ST_DistanceSphere',
						sequelize.fn(
							'ST_SetSRID',
							sequelize.fn(
								'ST_MakePoint',
								currLocation.longtitude,
								currLocation.latitude
							),
							4326
						),
						sequelize.col('Place.location')
					),
					'distance',
				],
			],
		};
	}

	return { distanceAttr, hasLocation };
};

module.exports = {
	getLocationData,
};
