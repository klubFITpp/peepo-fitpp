import 'dotenv/config';
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.MYSQL_URI, {
	define: {
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

schedule(sequelize, Sequelize.DataTypes);
welcomeMessage(sequelize, Sequelize.DataTypes);

await sequelize.sync({ alter: { drop: false } })
	.then(console.log('Models have been synchronized successfully!'))
	.catch((error) => {
		console.error('\n[ERROR] Unable to synchronize models:', error);
	});

sequelize.close();