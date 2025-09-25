import { ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import WelcomeMessage from '../../../db-objects.js';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	await interaction.deferReply({
		flags: MessageFlags.Ephemeral,
	});

	const message = await WelcomeMessage.findByPk('main');

	const result = await message.message.replace('${userId}', interaction.user.id);

	await interaction.editReply(`the **current welcome message** is:\n\n${result}`);
};