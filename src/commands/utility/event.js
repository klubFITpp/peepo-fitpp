import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import path, { sep } from 'path';
import cache from '../../config/cache.js';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Manage scheduling of events')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => subcommand
			.setName('create')
			.setDescription('Create an event.')
			.addStringOption(option => option
				.setName('announce-time')
				.setDescription('Date and time to publish announcement message. (format: DD.MM.YYYY HH:MM)')
				.setMinLength(13)
				.setMaxLength(16)
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('begin-time')
				.setDescription('Time when the event begins. (format: DD.MM.YYYY HH:MM)')
				.setMinLength(13)
				.setMaxLength(16)
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('name')
				.setDescription('Name of the event.')
				.setMaxLength(100)
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('location')
				.setDescription('Location of the event.')
				.setMaxLength(100)
				.setRequired(true)
			)
			.addAttachmentOption(option => option
				.setName('graphics')
				.setDescription('Graphics to use in the event. (default: none)')
			)
			.addStringOption(option => option
				.setName('end-time')
				.setDescription('Time when the event ends. (format: DD.MM.YYYY HH:MM) (default: 5 hours after begin-time)')
				.setMinLength(13)
				.setMaxLength(16)
			)
			.addBooleanOption(option => option
				.setName('description')
				.setDescription('Whether to add description different than the announce message. (default: false)')
			)
			.addBooleanOption(option => option
				.setName('create-now')
				.setDescription('Whether the server event should be created right now. (default: false)')
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('edit')
			.setDescription('Edit a scheduled event.')
			.addStringOption(option => option
				.setName('id')
				.setDescription('ID of the event.')
				.setAutocomplete(true)
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('announce-time')
				.setDescription('Date and time to publish announcement message. (format: DD.MM.YYYY HH:MM)')
				.setMinLength(13)
				.setMaxLength(16)
			)
			.addStringOption(option => option
				.setName('begin-time')
				.setDescription('Time when the event begins. (format: DD.MM.YYYY HH:MM)')
				.setMinLength(13)
				.setMaxLength(16)
			)
			.addStringOption(option => option
				.setName('name')
				.setDescription('Name of the event.')
				.setMaxLength(100)
			)
			.addBooleanOption(option => option
				.setName('message')
				.setDescription('Whether to update the message.')
			)
			.addStringOption(option => option
				.setName('location')
				.setDescription('Location of the event.')
				.setMaxLength(100)
			)
			.addAttachmentOption(option => option
				.setName('graphics')
				.setDescription('Graphics to use in the event. (default: none)')
			)
			.addStringOption(option => option
				.setName('end-time')
				.setDescription('Time when the event ends. (format: DD.MM.YYYY HH:MM) (default: 5 hours after begin-time)')
				.setMinLength(13)
				.setMaxLength(16)
			)
			.addBooleanOption(option => option
				.setName('description')
				.setDescription('Whether to edit the description. (default: message)')
			)
			.addBooleanOption(option => option
				.setName('create-now')
				.setDescription('Whether the server event should be created right now. (default: false)')
			)
		)
		.addSubcommandGroup(subcommand => subcommand
			.setName('delete')
			.setDescription('Delete a scheduled event.')
			.addSubcommand(subcommand => subcommand
				.setName('whole')
				.setDescription('Delete a scheduled event completely.')
				.addStringOption(option => option
					.setName('id')
					.setDescription('ID of the event.')
					.setAutocomplete(true)
					.setRequired(true)
				)
			)
			.addSubcommand(subcommand => subcommand
				.setName('part')
				.setDescription('Delete a part of a scheduled event.')
				.addStringOption(option => option
					.setName('id')
					.setDescription('ID of the event.')
					.setAutocomplete(true)
					.setRequired(true)
				)
				.addStringOption(option => option
					.setName('part')
					.setDescription('Part to delete.')
					.addChoices(
						{ name: 'Graphics', value: 'image' },
						{ name: 'End-time (apply default value)', value: 'endTime' },
						{ name: 'Description (apply default value)', value: 'description' },
						{ name: 'Event (remove already created event)', value: 'eventId' },
					)
					.setRequired(true)
				)
			)
		)
		.addSubcommand(subcommand => subcommand
			.setName('show')
			.setDescription('Show settings for the selected scheduled event.')
			.addStringOption(option => option
				.setName('id')
				.setDescription('ID of the event.')
				.setAutocomplete(true)
				.setRequired(true)
			)
		)
		.addSubcommand(subcommand => subcommand
			.setName('list')
			.setDescription('List all scheduled events.')
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

	/**
	 * Complete option autocomplete
	 *
	 * @param {AutocompleteInteraction} interaction
	 */
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();

		const cacheArray = Object.entries(cache.data).filter(([key, value]) => 'scheduleId' in value.v);
		cacheArray.sort(([aKey, aValue], [bKey, bValue]) => { return aValue.v.announceTime.getTime() - bValue.v.announceTime.getTime(); });

		const filtered = cacheArray.filter(([key, value]) => (value.v.name.toLocaleLowerCase().includes(focusedValue) || key.toLocaleLowerCase().includes(focusedValue)));

		await interaction.respond(
			filtered.map(([key, value]) => ({ name: `${value.v.name} (${key})`.substring(0, 97).concat('...'), value: key })),
		);
	},
};