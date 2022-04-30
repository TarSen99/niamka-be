'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		queryInterface.addColumn(
			'Products', // table name
			'initialCount', // new field name
			{
				type: Sequelize.INTEGER,
				allowNull: true,
				defaultValue: 10,
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
		// return Promise.all([
		// 	queryInterface.removeColumn('Products', 'initialCount'),
		// ]);
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	},
};
