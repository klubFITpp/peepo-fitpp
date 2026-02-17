import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
	host: process.env.DATABASE_HOST,
	dialect: 'postgres',define: {
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci',
	},
	logging: false,
});

await sequelize.authenticate()
	.then(console.log('Connection has been established successfully!'))
	.catch((error) => {
		console.error('\n[ERROR] Unable to connect to the database:', error);
	});

import schedule from '../src/models/Schedule.js';
import welcomeMessage from '../src/models/WelcomeMessage.js';
import thread from '../src/models/Thread.js';

schedule(sequelize, Sequelize.DataTypes);
welcomeMessage(sequelize, Sequelize.DataTypes);
thread(sequelize, Sequelize.DataTypes);

await sequelize.sync({ alter: { drop: false } })
	.then(console.log('Models have been synchronized successfully!'))
	.catch((error) => {
		console.error('\n[ERROR] Unable to synchronize models:', error);
	});

sequelize.close();