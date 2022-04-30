'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		queryInterface.addColumn(
			'UsersAndCompanies', // table name
			'placeId', // new field name
			{
				type: Sequelize.INTEGER,
				allowNull: true,
			}
		);
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
