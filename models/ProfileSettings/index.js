const { DataTypes } = require('sequelize');
const { DEFAULT_RADIUS } = require('./../constants');

const sequelize = require('../../database');
const User = require('./../User');

const ProfileSettings = sequelize.define(
	'ProfileSettings',
	{
		searchRadius: {
			type: DataTypes.INTEGER,
			defaultValue: DEFAULT_RADIUS,
		},
		sendNewProductNotifications: {
			type: DataTypes.BOOLEAN,
			defaultValue: true,
		},
	},
	{
		sequelize,
		tableName: 'ProfileSettings',
	}
);

ProfileSettings.belongsTo(User);

module.exports = ProfileSettings;
