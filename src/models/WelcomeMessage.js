import { DataTypes, Sequelize } from 'sequelize';

/**
 * Return a Sequelize model
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
	const WelcomeMessage = sequelize.define('welcomeMessage', {
		name: {
			type: DataTypes.STRING(200),
			primaryKey: true,
		},
		message: {
			type: DataTypes.STRING(3000),
			allowNull: false,
		},
	}, {
		timestamps: false,
	});

	return WelcomeMessage;
};