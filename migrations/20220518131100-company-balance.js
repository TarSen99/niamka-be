'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn(
			'Companies', // table name
			'balance', // new field name
			{
				type: Sequelize.FLOAT,
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
		return queryInterface.removeColumn('Companies', 'balance');
	},
};
