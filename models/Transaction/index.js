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
		hooks: {
			beforeCreate() {
				// AFTER 10 min need to destroy transaction
			},
		},
	}
);

Order.hasOne(Transaction);

module.exports = Transaction;
