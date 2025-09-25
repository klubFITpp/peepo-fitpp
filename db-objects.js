import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.MYSQL_URI, {
	define: {
		charset: 'utf8mb4',
		collate: 'utf8mb4_general_ci',
	},
	logging: false,
});

sequelize.authenticate()
	.then(console.log('connection has been established successfully'))
	.catch((error) => {
		console.error('\nunable to connect to the database:', error);
	});

import schedule from './models/Schedule.js';
import welcomeMessage from './models/WelcomeMessage.js';
const Schedule = schedule(sequelize, Sequelize.DataTypes);
const WelcomeMessage = welcomeMessage(sequelize, Sequelize.DataTypes);

export { Schedule, WelcomeMessage };