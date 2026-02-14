import { ChatInputCommandInteraction } from 'discord.js';
import { createEventEmbed } from '../../../utils/events.js';
import { iconUrl } from '../../../utils/helpers.js';
import cache from '../../../config/cache.js';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	await interaction.deferReply();

	const scheduleId = interaction.options.getString('id');
	if (!cache.has(scheduleId)) throw new Error('peepo: No such event.');

	const { embed, imageObject } = createEventEmbed(scheduleId, interaction);

	await interaction.editReply({
		embeds: [embed],
		files: imageObject ? [imageObject, iconUrl] : [iconUrl],
	});
};