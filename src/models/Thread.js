import { DataTypes, Sequelize } from 'sequelize';

/**
 * Return a Sequelize model
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
	return sequelize.define('thread', {
		threadId: {
			primaryKey: true,
			type: DataTypes.STRING(200),
		},
		unlockTime: {
			type: DataTypes.DATE,
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};