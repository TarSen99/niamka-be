'use strict';

module.exports = {
	up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.addColumn(
				'Companies', // table name
				'instagram', // new field name
				{
					type: Sequelize.STRING,
					allowNull: true,
				}
			),
			queryInterface.addColumn(
				'Companies', // table name
				'facebook', // new field name
				{
					type: Sequelize.STRING,
					allowNull: true,
				}
			),
		]);
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	},
};
