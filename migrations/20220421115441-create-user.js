'use strict';
module.exports = {
	up: (queryInterface, Sequelize) => {
		return Promise.all([
			queryInterface.changeColumn('Users', 'longtitude', {
				type: Sequelize.FLOAT,
				allowNull: true,
			}),
			queryInterface.changeColumn('Users', 'latitude', {
				type: Sequelize.FLOAT,
				allowNull: true,
			}),
		]);
	},
	down: (queryInterface, Sequelize) => {
		return queryInterface.sequelize.transaction((t) => {
			return Promise.all([
				queryInterface.removeColumn('Users', 'ProfileSettingsId', {
					transaction: t,
				}),
			]);
		});
	},
};
