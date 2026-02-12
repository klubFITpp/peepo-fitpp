import NodeCache from 'node-cache';
import { Schedule } from '../config/database.js';

const schedules = await Schedule.findAll({
	where: {
		posted: false,
	}
});

const cache = new NodeCache();

schedules.forEach(element => {
	cache.set(element.scheduleId, element);
});

export default cache;
