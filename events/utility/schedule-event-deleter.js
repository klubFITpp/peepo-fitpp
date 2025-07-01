import { Events, GuildScheduledEvent } from 'discord.js';
import cache from '../../cache.js';
import { Schedule } from '../../db-objects.js';

export default {
	event: Events.GuildScheduledEventDelete,

	/**
	 * Execute the event event
	 *
	 * @param {GuildScheduledEvent} event
	 */
	async execute(event) {
		if (event.guildId != process.env.EVENT_GUILD_ID) return;

		let schedule = (Object.entries(cache.data).find(([key, value]) => ('scheduleId' in value.v && value.v.eventId == event.id)));
		if (!schedule) return;
		schedule = schedule[1].v;

		await Schedule.update({
			eventId: null,
		}, {
			where: {
				scheduleId: schedule.scheduleId,
			},
		});

		const response = await Schedule.findByPk(schedule.scheduleId);

		cache.set(schedule.scheduleId, response);
	},
};