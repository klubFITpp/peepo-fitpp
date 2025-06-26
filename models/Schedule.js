export default (sequelize, DataTypes) => {
	return sequelize.define('schedule', {
		scheduleId: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		announceTime: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		message: {
			type: DataTypes.STRING(4000),
			allowNull: false,
		},
		beginTime: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		endTime: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		description: {
			type: DataTypes.STRING(4000),
		},
	}, {
		timestamps: false,
	});
};