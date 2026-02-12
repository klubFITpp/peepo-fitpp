import { DataTypes, Sequelize } from 'sequelize';

/**
 * Return a Sequelize model
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
	return sequelize.define('schedule', {
		scheduleId: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		posted: {
			type: DataTypes.BOOLEAN,
			defaultValue: false,
			allowNull: false,
		},
		announceTime: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		beginTime: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		name: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		message: {
			type: DataTypes.STRING(1000),
			allowNull: false,
		},
		location: {
			type: DataTypes.STRING(100),
			allowNull: false,
		},
		image: {
			type: DataTypes.STRING(200),
		},
		endTime: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING(1000),
		},
		eventId: {
			type: DataTypes.STRING(200),
		},
	}, {
		timestamps: false,
	});
};