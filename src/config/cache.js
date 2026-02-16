import NodeCache from 'node-cache';
import { Schedule } from './database.js';
import { Op } from 'sequelize';

const schedules = await Schedule.findAll({
	where: {
		posted: false,
		announceTime: { [Op.gt]: Date.now() },
	}
});

const cache = new NodeCache();

schedules.forEach(element => {
	cache.set(element.scheduleId, element);
});

cache.set('schedule-lock', true);

export default cache;
