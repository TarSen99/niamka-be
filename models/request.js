'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Request extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {}
	}
	Request.init(
		{
			firstName: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			lastName: {
				type: DataTypes.STRING,
			},
			mobile: {
				type: DataTypes.STRING,
			},
			email: {
				type: DataTypes.STRING,
			},
			establishmentName: {
				type: DataTypes.STRING,
			},
			establishmentType: {
				type: DataTypes.STRING,
			},
			city: {
				type: DataTypes.STRING,
			},
			message: {
				type: DataTypes.STRING,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'Request',
		}
	);
	return Request;
};
