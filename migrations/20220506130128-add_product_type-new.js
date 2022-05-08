'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.addColumn(
				'Products', // table name
				'productType', // new field name
				{
					type: Sequelize.STRING,
					allowNull: true,
					defaultValue: 'regular',
				}
			),
		]);
	},

	async down(queryInterface, Sequelize) {
		return Promise.all([
			queryInterface.removeColumn('Products', 'productType'),
		]);
		/**
		 * Add reverting commands here.
		 *
		 * Example:
		 * await queryInterface.dropTable('users');
		 */
	},
};
