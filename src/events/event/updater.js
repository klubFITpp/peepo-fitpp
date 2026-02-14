import { Events, GuildScheduledEvent } from 'discord.js';
import cache from '../../config/cache.js';
import { upsertScheduledEvent } from '../../utils/events.js';
import { sleep } from '../../utils/helpers.js';

export default {
	event: Events.GuildScheduledEventUpdate,

	/**
	 * Execute the events event
	 *
	 * @param {GuildScheduledEvent} oldEvent
	 * @param {GuildScheduledEvent} newEvent
	 */
	async execute(oldEvent, newEvent) {
		await sleep(3000);

		if (newEvent.guildId != process.env.EVENT_GUILD_ID) return;

		let schedule = (Object.entries(cache.data).find(([key, value]) => ('scheduleId' in value.v && value.v.eventId == newEvent.id)));
		if (!schedule) return;
		schedule = schedule[1].v;

		await upsertScheduledEvent(schedule, newEvent.guild);
	},
};