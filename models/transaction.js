'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Transaction extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			models.Order.hasOne(this);
		}
	}
	Transaction.init(
		{
			paymentId: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			orderDescription: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			amount: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			token: {
				type: DataTypes.STRING,
			},
			currency: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
			},
		},
		{
			sequelize,
			modelName: 'Transaction',
		}
	);
	return Transaction;
};
