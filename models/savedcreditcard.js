'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class SavedCreditCard extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			models.User.hasMany(this);
		}
	}
	SavedCreditCard.init(
		{
			rectoken: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			expiration: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			mackedCard: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			cardType: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'SavedCreditCard',
		}
	);
	return SavedCreditCard;
};
