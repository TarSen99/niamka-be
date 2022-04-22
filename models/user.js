'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
	class User extends Model {
		/**
		 * Helper method for defining associations.
		 * This method is not a part of Sequelize lifecycle.
		 * The `models/index` file will call this method automatically.
		 */
		static associate(models) {
			models.Company.belongsToMany(this, {
				through: models.UsersAndCompanies,
			});

			this.belongsToMany(models.Company, { through: models.UsersAndCompanies });
			this.hasOne(models.ProfileSettings);

			// define association here
		}
	}
	User.init(
		{
			name: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			address: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			latitude: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			longtitude: {
				type: DataTypes.FLOAT,
				allowNull: true,
			},
			logo: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			phone: {
				type: DataTypes.STRING,
				unique: true,
			},
			email: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: true,
			},
			isEmailVerified: {
				type: DataTypes.BOOLEAN,
				allowNull: true,
			},
			registerType: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			sequelize,
			modelName: 'User',
			tableName: 'Users',
		}
	);
	return User;
};
