const { DataTypes } = require('sequelize');

const sequelize = require('../../database');
const Company = require('./../Company');
const User = require('./../User');

const UsersAndCompanies = sequelize.define(
	'UsersAndCompanies',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		role: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		UserId: {
			type: DataTypes.INTEGER,
			unique: false,
			allowNull: false,
			references: {
				model: User,
				key: 'id',
			},
		},
		CompanyId: {
			type: DataTypes.INTEGER,
			unique: false,
			allowNull: false,
			references: {
				model: Company,
				key: 'id',
			},
		},
	},
	{
		sequelize,
	}
);

module.exports = UsersAndCompanies;
