'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.addColumn('Products', 'repeat', {
				type: Sequelize.BOOLEAN,
				defaultValue: false,
			}),
			queryInterface.addColumn('Products', 'publishTime', {
				type: Sequelize.STRING,
				allowNull: true,
			}),
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
