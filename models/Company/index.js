const { DataTypes } = require('sequelize');
const Place = require('./../Place');

const sequelize = require('../../database');

const Company = sequelize.define(
	'Company',
	{
		name: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		logo: {
			type: DataTypes.STRING,
		},
	},
	{
		sequelize,
	}
);

Company.hasMany(Place);
Place.belongsTo(Company);

module.exports = Company;
