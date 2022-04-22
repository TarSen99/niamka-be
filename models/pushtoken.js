'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class PushToken extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			models.User.hasMany(this);
		}
	}
	PushToken.init(
		{
			token: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			// IOS or Android
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			// UserId: {
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
			modelName: 'PushToken',
		}
	);
	return PushToken;
};
