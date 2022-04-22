const { DataTypes } = require('sequelize');
const User = require('./../User');

const sequelize = require('../../database');

const SavedCreditCard = sequelize.define(
	'SavedCreditCard',
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

User.hasMany(SavedCreditCard);

module.exports = SavedCreditCard;
