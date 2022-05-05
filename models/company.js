'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Company extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.hasMany(models.Place);
			// models.Place.belongsTo(this);
		}
	}
	Company.init(
		{
			name: DataTypes.STRING,
			instagram: DataTypes.STRING,
			facebook: DataTypes.STRING,
			logo: DataTypes.STRING,
			type: DataTypes.STRING,
			description: DataTypes.STRING,
		},
		{
			sequelize,
			modelName: 'Company',
		}
	);
	return Company;
};
