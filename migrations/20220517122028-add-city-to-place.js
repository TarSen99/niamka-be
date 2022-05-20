'use strict';

module.exports = {
	async up(queryInterface, Sequelize) {
		return queryInterface.addColumn(
			'Places', // table name
			'city', // new field name
			{
				type: Sequelize.STRING,
				allowNull: true,
			}
		);
	},

	async down(queryInterface, Sequelize) {
		return queryInterface.removeColumn('Places', 'city');
	},
};
