'use strict';
const { Model } = require('sequelize');
const { DEFAULT_RADIUS } = require('./../constants');

module.exports = (sequelize, DataTypes) => {
	class ProfileSettings extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.User);
		}
	}
	ProfileSettings.init(
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
			modelName: 'ProfileSettings',
			tableName: 'ProfileSettings',
		}
	);
	return ProfileSettings;
};
