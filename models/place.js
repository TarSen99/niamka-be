'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class Place extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			this.belongsTo(models.Company);
		}
	}
	Place.init(
		{
			location: {
				type: DataTypes.GEOMETRY('POINT', 4326),
				allowNull: false,
			},
			address: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			disabled: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			sequelize,
			modelName: 'Place',
			tableName: 'Places',
		}
	);
	return Place;
};
