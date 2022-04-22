const { DataTypes } = require('sequelize');

const sequelize = require('../../database');
const User = require('./../User');

const PushToken = sequelize.define(
	'PushToken',
	{
		id: {
			type: DataTypes.INTEGER,
			autoIncrement: true,
			primaryKey: true,
		},
		token: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		// IOS or Android
		type: {
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
	},
	{
		sequelize,
	}
);

User.hasMany(PushToken);

module.exports = PushToken;
