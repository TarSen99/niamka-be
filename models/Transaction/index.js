const { DataTypes } = require('sequelize');

const sequelize = require('../../database');
const Order = require('../Order');

const Transaction = sequelize.define(
	'Transaction',
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
			allowNull: false,
		},
	},
	{
		sequelize,
		modelName: 'Transaction',
	}
);

Order.hasOne(Transaction);

module.exports = Transaction;
