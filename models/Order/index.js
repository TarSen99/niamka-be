const { DataTypes } = require('sequelize');
const User = require('./../User');
const { ORDER_STATUSES } = require('./../../constants');
const OrderProduct = require('./OrderProduct');
const Place = require('./../Place');
const Company = require('./../Company');

const sequelize = require('./../../database');

const Order = sequelize.define(
	'Order',
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
		CompanyId: {
			type: DataTypes.INTEGER,
			unique: false,
			allowNull: false,
			references: {
				model: Company,
				key: 'id',
			},
		},
		PlaceId: {
			type: DataTypes.INTEGER,
			unique: false,
			allowNull: false,
			references: {
				model: Place,
				key: 'id',
			},
		},
		CustomerId: {
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

Order.hasMany(OrderProduct);

// User.hasMany(Order, { as: 'customer' });
Order.belongsTo(User, { as: 'Customer' });

// Place.hasMany(Order, { as: 'place' });
Order.belongsTo(Place);
Order.belongsTo(Company);

module.exports = Order;
