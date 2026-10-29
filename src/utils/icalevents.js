import 'dotenv/config';
import ical from 'node-ical';
import { ICalEvent } from '../config/database.js';
import { Client, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from 'discord.js';

/**
 * Sync ical events
 *
 * @param {Client} client
 */
export async function syncEvents(client) {
	const data = await ical.fromURL(process.env.ICAL_URL);
	const icalEvents = Object.values(data).filter(event => (event.type == 'VEVENT' && event.start > new Date())).sort((eventA, eventB) => eventA.start.getTime() - eventB.start.getTime());

	const currentEvents = await ICalEvent.findAll();
	
	const guild = await client.guilds.fetch(process.env.ICAL_EVENTS_GUILD_ID);

	for (const event of icalEvents) {
		const eventOptions = {
			name: event.summary,
			description: event.description,
			scheduledStartTime: event.start,
			scheduledEndTime: event.end,
			privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
			entityType: GuildScheduledEventEntityType.External,
			entityMetadata: {
				location: event.location || 'TBA',
			},
		};

		const curEvent = currentEvents.find(curEvent => curEvent.uId == event.uid)

		if (!curEvent) {
			guild.scheduledEvents.create(eventOptions).then(scheduledEvent => 
				ICalEvent.upsert({
					uId: event.uid,
					eventId: scheduledEvent.id,
				})
			);
		} else {
			guild.scheduledEvents.edit(curEvent.eventId, eventOptions);
		}
	}

	return;
};