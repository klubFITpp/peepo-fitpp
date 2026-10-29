import { Client, Events } from 'discord.js';
import { syncEvents } from '../../utils/icalevents.js';
import Scheduler from '../../config/scheduler.js';

export default {
	event: Events.ClientReady,
	once: true,

	/**
	 * Execute the client event
	 *
	 * @param {Client} client
	 */
	async execute(client) {
		Scheduler.scheduleJob('ical', '0 2 * * *', async () => syncEvents(client));
	},
};
