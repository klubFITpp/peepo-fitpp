import { DataTypes, Sequelize } from 'sequelize';

/**
 * Return a Sequelize model
 *
 * @param {Sequelize} sequelize
 * @param {DataTypes} DataTypes
 */
export default (sequelize, DataTypes) => {
	return sequelize.define('icalevent', {
		uId: {
			type: DataTypes.STRING(200),
			primaryKey: true,
		},
		eventId: {
			type: DataTypes.STRING(200),
		},
	}, {
		timestamps: false,
	});
};
