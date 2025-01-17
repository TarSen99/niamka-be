const { DataTypes } = require('sequelize');

const sequelize = require('../../../database');

const OrderProduct = sequelize.define(
	'OrderProduct',
	{
		quantity: {
			type: DataTypes.INTEGER,
			allowNull: false,
		},
	},
	{
		sequelize,
	}
);

module.exports = OrderProduct;
