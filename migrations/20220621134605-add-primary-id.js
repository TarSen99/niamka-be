'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		queryInterface.addColumn('Products', 'primaryId', {
			type: Sequelize.INTEGER,
			allowNull: true,
		});
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
