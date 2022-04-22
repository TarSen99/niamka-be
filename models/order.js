'use strict';
const { ORDER_STATUSES } = require('./../constants');

const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Order extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.hasMany(models.OrderProduct);
			models.OrderProduct.belongsTo(this);

			this.belongsTo(models.User, { as: 'Customer' });

			this.belongsTo(models.Place);
			this.belongsTo(models.Company);

			// define association here
		}
	}
	Order.init(
		{
			orderNumber: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			customerNumber: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			paymentMethod: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.STRING,
				defaultValue: ORDER_STATUSES.ACTIVE,
			},
			totalPrice: {
				type: DataTypes.FLOAT,
				allowNull: false,
			},
			comission: {
				type: DataTypes.FLOAT,
				allowNull: false,
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
			// PlaceId: {
			// 	type: DataTypes.INTEGER,
			// 	unique: false,
			// 	allowNull: false,
			// 	references: {
			// 		model: Place,
			// 		key: 'id',
			// 	},
			// },
			// CustomerId: {
			// 	type: DataTypes.INTEGER,
			// 	unique: false,
			// 	allowNull: false,
			// 	references: {
			// 		model: User,
			// 		key: 'id',
			// 	},
			// },
		},
		{
			sequelize,
			modelName: 'Order',
		}
	);
	return Order;
};
