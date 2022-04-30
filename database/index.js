const { Sequelize } = require('sequelize');

console.log('----');
console.log(process.env.DB_HOST);

const sequelize = new Sequelize(
	process.env.DB_NAME,
	process.env.DB_USER,
	process.env.DB_PASSWORD,
	{
		host: process.env.DB_HOST,
		dialect: 'postgres',
	}
);

// const sequelize = new Sequelize({
// 	dialect: 'sqlite',
// 	storage: './database.sqlite',
// }); // Example for sqlite

const initSequelize = async () => {
	try {
		await sequelize.authenticate();
		await sequelize.sync();
		console.log('Connection has been established successfully.');
	} catch (error) {
		console.error('Unable to connect to the database:', error);
	}
};

initSequelize();

module.exports = sequelize;
