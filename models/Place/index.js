const { DataTypes } = require('sequelize');

const sequelize = require('../../database');

const Place = sequelize.define(
	'Place',
	{
		location: {
			type: DataTypes.GEOMETRY('POINT', 4326),
			allowNull: false,
		},
		// latitude: {
		// 	type: DataTypes.STRING,
		// 	allowNull: false,
		// },
		// longtitude: {
		// 	type: DataTypes.STRING,
		// 	allowNull: false,
		// },
		address: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		disabled: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
		},
	},
	{
		sequelize,
		modelName: 'Place',
	}
);

module.exports = Place;
