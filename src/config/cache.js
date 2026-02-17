import NodeCache from 'node-cache';
import { Schedule, Thread } from './database.js';
import { Op } from 'sequelize';

const cache = new NodeCache();

// Load schedules

const schedules = await Schedule.findAll({
	where: {
		posted: false,
		announceTime: { [Op.gt]: Date.now() },
	}
});

schedules.forEach(element => {
	cache.set(element.scheduleId, element);
});

cache.set('schedule-lock', { locked: false });

// Load threads

const threads = await Thread.findAll({
	where: {
		unlockTime: { [Op.gt]: Date.now() },
	}
});

threads.forEach(element => {
	cache.set(element.threadId, element);
});

export default cache;
