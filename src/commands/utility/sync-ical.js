import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { sep } from 'path';
import { syncEvents } from '../../utils/icalevents.js';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Sync upcoming ical events.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.reply('⏩ Started syncing...');

		await syncEvents(interaction.client);

		await interaction.editReply('✅ Synced succesfully (the events might take some time to show up).')
	},
};