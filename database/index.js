const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('tarasseniv', 'tarasseniv', '', {
	host: 'localhost',
	dialect: 'postgres',
});

// const sequelize = new Sequelize({
// 	dialect: 'sqlite',
// 	storage: './database.sqlite',
// }); // Example for sqlite

const initSequelize = async () => {
	try {
		await sequelize.authenticate();
		await sequelize.sync({
			alter: true,
		});
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
};

initSequelize();

module.exports = sequelize;
