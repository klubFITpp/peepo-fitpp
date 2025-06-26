import dotenv from 'dotenv';
dotenv.config();
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.MYSQL_URI, {
	define: {
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci',
	},
	logging: false,
});

await sequelize.authenticate()
	.then(console.log('connection has been established successfully'))
	.catch((error) => {
		console.error('\nunable to connect to the database:', error);
	});

import schedule from './models/Schedule.js';
schedule(sequelize, Sequelize.DataTypes);

await sequelize.sync({ alter: true })
	.then(console.log('models have been synchronized successfully'))
	.catch((error) => {
		console.error('\nunable to synchronize models:', error);
	});

sequelize.close();