'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.changeColumn('Requests', 'email', {
				type: Sequelize.STRING,
				allowNull: true,
			}),
			queryInterface.changeColumn('Requests', 'mobile', {
				type: Sequelize.STRING,
				allowNull: true,
			}),
		]);

		/**
		 * Add altering commands here.
		 *
		 * Example:
		 * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
		 */
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
