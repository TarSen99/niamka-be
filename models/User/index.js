const { DataTypes } = require('sequelize');

const sequelize = require('../../database');
const Company = require('./../Company');
const UsersAndCompanies = require('./../UsersAndCompanies');

const User = sequelize.define(
	'User',
	{
		name: {
			type: DataTypes.STRING,
		},
		address: {
			type: DataTypes.STRING,
		},
		latitude: {
			type: DataTypes.STRING,
		},
		longtitude: {
			type: DataTypes.STRING,
		},
		logo: {
			type: DataTypes.STRING,
		},
		phone: {
			type: DataTypes.STRING,
			unique: true,
		},
		email: {
			type: DataTypes.STRING,
			unique: true,
		},
		isEmailVerified: {
			type: DataTypes.BOOLEAN,
		},
		registerType: {
			type: DataTypes.STRING,
			allowNull: false,
		},
	},
	{
		sequelize,
		tableName: 'User',
	}
);

Company.belongsToMany(User, { through: UsersAndCompanies });
User.belongsToMany(Company, { through: UsersAndCompanies });

module.exports = User;
