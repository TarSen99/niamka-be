'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Payment extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.Company);
			models.Company.hasMany(this);
		}
	}
	Payment.init(
		{
			cashIncome: DataTypes.FLOAT,
			cashCommission: DataTypes.FLOAT,
			cashRevenue: DataTypes.FLOAT,

			cardIncome: DataTypes.FLOAT,
			cardCommission: DataTypes.FLOAT,
			cardRevenue: DataTypes.FLOAT,
			status: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Payment',
		}
	);
	return Payment;
};
