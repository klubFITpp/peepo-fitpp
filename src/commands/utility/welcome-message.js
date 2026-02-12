import { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, ActionRowBuilder, TextInputBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { sep } from 'path';
import path from 'path';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('shows or sets the welcome message')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => subcommand
			.setName('show')
			.setDescription('shows the welcome message')
		)
		.addSubcommand(subcommand => subcommand
			.setName('set')
			.setDescription('sets the welcome message')
		),
	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const subcommandGroup = interaction.options.getSubcommandGroup();
		const subcommand = interaction.options.getSubcommand();

		const command = await import(path.join(import.meta.dirname, commandName, (subcommandGroup ? subcommandGroup + '_' + subcommand : subcommand) + '.js'));
		const commandExecutable = command.default || command;

		await commandExecutable(interaction);
	},
};