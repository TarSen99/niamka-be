'use strict';
const { USER_ROLES } = require('./../constants/index.js');

module.exports = {
	async up(queryInterface, Sequelize) {
		/**
		 * Add seed commands here.
		 *
		 * Example:
		 * await queryInterface.bulkInsert('People', [{
		 *   name: 'John Doe',
		 *   isBetaMember: false
		 * }], {});
		 */

		const companies = await queryInterface.bulkInsert(
			'Companies',
			[
				{
					createdAt: new Date(),
					updatedAt: new Date(),
					name: 'Niamka',
					type: 'restaurant',
					balance: 0,
				},
			],
			{
				returning: true,
			}
		);

		const users = await queryInterface.bulkInsert(
			'Users',
			[
				{
					createdAt: new Date(),
					updatedAt: new Date(),
					name: 'SUPERADMIN',
					email: 'superadmin@niamka.com',
					isEmailVerified: true,
					registerType: 'email',
				},
				{
					createdAt: new Date(),
					updatedAt: new Date(),
					name: 'OWNER',
					email: 'owner@niamka.com',
					isEmailVerified: true,
					registerType: 'email',
				},
			],
			{
				returning: true,
			}
		);

		await queryInterface.bulkInsert(
			'UsersAndCompanies',
			[
				{
					createdAt: new Date(),
					updatedAt: new Date(),
					role: USER_ROLES.OWNER,
					UserId: users[1].id,
					CompanyId: companies[0].id,
				},
				{
					createdAt: new Date(),
					updatedAt: new Date(),
					role: USER_ROLES.ADMIN,
					UserId: users[0].id,
					CompanyId: companies[0].id,
				},
			],
			{}
		);
	},

	async down(queryInterface, Sequelize) {
		/**
		 * Add commands to revert seed here.
		 *
		 * Example:
		 * await queryInterface.bulkDelete('People', null, {});
		 */
	},
};
