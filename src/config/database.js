import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USERNAME, process.env.DATABASE_PASSWORD, {
	host: process.env.DATABASE_HOST,
	dialect: 'postgres',
	define: {
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci',
	},
	logging: false,
});

sequelize.authenticate()
	.then(() => console.log('Connection has been established successfully!'))
	.catch((error) => {
		console.error('\n[ERROR] Unable to connect to the database:', error);
	});

// Import models
import schedule from '../models/Schedule.js';
import welcomeMessage from '../models/WelcomeMessage.js';

const Schedule = schedule(sequelize, Sequelize.DataTypes);
const WelcomeMessage = welcomeMessage(sequelize, Sequelize.DataTypes);

export { sequelize, Schedule, WelcomeMessage };
