import { Client, Events } from 'discord.js';
import cache from '../../config/cache.js';
import { scheduleJob } from '../../utils/events.js';

export default {
	event: Events.ClientReady,
	once: true,

	/**
	 * Execute the client event
	 *
	 * @param {Client} client
	 */
	async execute(client) {
		const cacheArray = Object.entries(cache.data).filter(([key, value]) => 'scheduleId' in value.v);

		cacheArray.forEach(async ([key, value]) => {
			await scheduleJob(client, value.v);
		});
	},
};
