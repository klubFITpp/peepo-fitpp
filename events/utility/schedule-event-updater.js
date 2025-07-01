import { Events, GuildScheduledEvent } from 'discord.js';
import cache from '../../cache.js';
import { createScheduledEvent } from './schedule-poster.js';

export default {
	event: Events.GuildScheduledEventUpdate,

	/**
	 * Execute the events event
	 *
	 * @param {GuildScheduledEvent} oldEvent
	 * @param {GuildScheduledEvent} newEvent
	 */
	async execute(oldEvent, newEvent) {
		if (newEvent.guildId != process.env.EVENT_GUILD_ID) return;

		let schedule = (Object.entries(cache.data).find(([key, value]) => ('scheduleId' in value.v && value.v.eventId == newEvent.id)));
		if (!schedule) return;
		schedule = schedule[1].v;

		await createScheduledEvent(schedule, newEvent.guild);
	},
};