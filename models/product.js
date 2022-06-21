'use strict';
const { Model } = require('sequelize');
const { PRODUCT_STATUSES } = require('./../constants');

module.exports = (sequelize, DataTypes) => {
	class Product extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.Place);
			models.Place.hasMany(this);

			this.belongsTo(models.Company);

			this.hasMany(models.Image);

			this.hasMany(models.OrderProduct);
			models.OrderProduct.belongsTo(this);
		}
	}
	Product.init(
		{
			title: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			description: {
				type: DataTypes.STRING,
			},
			category: {
				type: DataTypes.STRING,
				defaultValue: 'meal',
				allowNull: false,
			},
			productType: {
				type: DataTypes.STRING,
				defaultValue: 'regular',
			},
			initialCount: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			availableCount: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			availableCountPerPerson: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			fullPrice: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			discountPercent: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			priceWithDiscount: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			takeTimeFrom: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			takeTimeTo: {
				type: DataTypes.DATE,
				allowNull: false,
			},
			availableForSale: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: PRODUCT_STATUSES.ACTIVE,
			},
			repeat: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			publishTime: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			primaryId: {
				type: DataTypes.INTEGER,
				allowNull: true,
			},
			// CompanyId: {
			// 	type: DataTypes.INTEGER,
			// 	unique: false,
			// 	allowNull: false,
			// 	references: {
			// 		model: Company,
			// 		key: 'id',
			// 	},
			// },
		},
		{
			sequelize,
			modelName: 'Product',
		}
	);
	return Product;
};
