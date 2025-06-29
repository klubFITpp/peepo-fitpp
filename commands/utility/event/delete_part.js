import { ChatInputCommandInteraction } from 'discord.js';
import cache from '../../../cache.js';
import fs from 'fs';
import { addMinutes, iconUrl } from '../../../global.js';
import { scheduleEvent } from '../../../events/utility/schedule-poster.js';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	const scheduleId = interaction.options.getString('id');
	const part = interaction.options.getString('part');

	if (!cache.has(scheduleId)) throw new Error('peepo: no such event');

	const event = cache.get(scheduleId);
	if (!event[part]) throw new Error('peepo: event doesn\'t have property');

	if (part === 'image') fs.unlinkSync(event.image);

	const guild = await interaction.client.guilds.fetch(process.env.EVENT_GUILD_ID);
	if (part === 'eventId') await guild.scheduledEvents.delete(event.eventId);

	event[part] = null;
	if (part === 'endTime') event.endTime = addMinutes(event.beginTime, 5 * 60);

	const { embed, imageObject } = await scheduleEvent(interaction, event);

	await interaction.editReply({
		content: '✅ event now has following settings:',
		embeds: [embed],
		files: imageObject ? [imageObject, iconUrl] : [iconUrl],
	});
};