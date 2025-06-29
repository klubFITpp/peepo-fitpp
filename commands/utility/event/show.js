import { ChatInputCommandInteraction } from 'discord.js';
import cache from '../../../cache.js';
import { iconUrl } from '../../../global.js';
import { createEventEmbed } from '../../../events/utility/schedule-poster.js';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	const scheduleId = interaction.options.getString('id');
	if (!cache.has(scheduleId)) throw new Error('peepo: no such event');

	const { embed, imageObject } = createEventEmbed(scheduleId);

	await interaction.editReply({
		embeds: [embed],
		files: imageObject ? [imageObject, iconUrl] : [iconUrl],
	});
};