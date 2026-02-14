import { ChatInputCommandInteraction } from 'discord.js';
import { scheduleEvent } from '../../../utils/events.js';
import { addMinutes, iconUrl } from '../../../utils/helpers.js';
import cache from '../../../config/cache.js';
import fs from 'fs';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	await interaction.deferReply();

	const scheduleId = interaction.options.getString('id');
	const part = interaction.options.getString('part');

	if (!cache.has(scheduleId)) throw new Error('peepo: No such event.');

	const event = cache.get(scheduleId);
	if (!event[part]) throw new Error('peepo: The event doesn\'t have the selected property.');

	if (part === 'image') fs.unlinkSync(event.image);

	const guild = await interaction.client.guilds.fetch(process.env.EVENT_GUILD_ID);
	if (part === 'eventId') await guild.scheduledEvents.delete(event.eventId);

	event[part] = null;
	if (part === 'endTime') event.endTime = addMinutes(event.beginTime, 5 * 60);

	const { embed, imageObject } = await scheduleEvent(interaction.client, event);

	await interaction.editReply({
		content: '✅ The event now has following settings:',
		embeds: [embed],
		files: imageObject ? [imageObject, iconUrl] : [iconUrl],
	});
};