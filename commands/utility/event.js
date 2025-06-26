import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction } from 'discord.js';
import { sep } from 'path';
import { Schedule } from '../../db-objects.js';

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3))
		.setDescription('manage scheduling of events')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => subcommand
			.setName('schedule')
			.setDescription('schedule an event')
			.addStringOption(option => option
				.setName('announce-time')
				.setDescription('date and time to publish announcement message')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('message')
				.setDescription('message to send')
				.setRequired(true)
				.setMaxLength(4000)
			)
			.addStringOption(option => option
				.setName('begin-time')
				.setDescription('time when the event begins')
				.setRequired(true)
			)
			.addAttachmentOption(option => option
				.setName('graphics')
				.setDescription('graphics to use in the event (default: none)')
			)
			.addStringOption(option => option
				.setName('end-time')
				.setDescription('time when the event ends (default: 6 hours after begin-time')
			)
			.addStringOption(option => option
				.setName('description')
				.setDescription('description for the event (default: message)')
				.setMaxLength(4000)
			)
			.addBooleanOption(option => option
				.setName('create-now')
				.setDescription('whether the event should be created right now (default: false)')
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('edit')
			.setDescription('edit a scheduled event')
			.addStringOption(option => option
				.setName('id')
				.setDescription('id of the event')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('announce-time')
				.setDescription('date and time to publish announcement message')
			)
			.addStringOption(option => option
				.setName('message')
				.setDescription('message to send')
				.setMaxLength(4000)
			)
			.addStringOption(option => option
				.setName('begin-time')
				.setDescription('time when the event begins')
			)
			.addAttachmentOption(option => option
				.setName('graphics')
				.setDescription('graphics to use in the event (default: none)')
			)
			.addStringOption(option => option
				.setName('end-time')
				.setDescription('time when the event ends (default: 6 hours after begin-time')
			)
			.addStringOption(option => option
				.setName('description')
				.setDescription('description for the event (default: message)')
				.setMaxLength(4000)
			)
			.addBooleanOption(option => option
				.setName('create-now')
				.setDescription('whether the event should be created right now (default: false)')
			)
		)
		.addSubcommand(subcommand => subcommand
			.setName('delete')
			.setDescription('delete a scheduled event')
			.addStringOption(option => option
				.setName('id')
				.setDescription('id of the event')
				.setRequired(true)
			)
		)
		.addSubcommand(subcommand => subcommand
			.setName('list')
			.setDescription('list all scheduled events')
		),
	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {},
};