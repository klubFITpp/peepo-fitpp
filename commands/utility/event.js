import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, AutocompleteInteraction } from 'discord.js';
import path, { sep } from 'path';
import cache from '../../cache.js';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('manage scheduling of events')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => subcommand
			.setName('schedule')
			.setDescription('schedule an event')
			.addStringOption(option => option
				.setName('announce-time')
				.setDescription('date and time to publish announcement message (dd.mm.yyyy hh:mm)')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('begin-time')
				.setDescription('time when the event begins (dd.mm.yyyy hh:mm)')
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('name')
				.setDescription('name of the event')
				.setMaxLength(100)
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('location')
				.setDescription('location of the event')
				.setMaxLength(100)
				.setRequired(true)
			)
			.addAttachmentOption(option => option
				.setName('graphics')
				.setDescription('graphics to use in the event (default: none)')
			)
			.addStringOption(option => option
				.setName('end-time')
				.setDescription('time when the event ends (dd.mm.yyyy hh:mm) (default: 5 hours after begin-time)')
			)
			.addBooleanOption(option => option
				.setName('description')
				.setDescription('whether to add description different than the announce message (default: false)')
			)
			.addBooleanOption(option => option
				.setName('create-now')
				.setDescription('whether the server event should be created right now (default: false)')
			),
		)
		.addSubcommand(subcommand => subcommand
			.setName('edit')
			.setDescription('edit a scheduled event')
			.addStringOption(option => option
				.setName('id')
				.setDescription('id of the event')
				.setAutocomplete(true)
				.setRequired(true)
			)
			.addStringOption(option => option
				.setName('announce-time')
				.setDescription('date and time to publish announcement message (dd.mm.yyyy hh:mm)')
			)
			.addStringOption(option => option
				.setName('begin-time')
				.setDescription('time when the event begins (dd.mm.yyyy hh:mm)')
			)
			.addStringOption(option => option
				.setName('name')
				.setDescription('name of the event')
				.setMaxLength(100)
			)
			.addBooleanOption(option => option
				.setName('message')
				.setDescription('whether to update the message')
			)
			.addStringOption(option => option
				.setName('location')
				.setDescription('location of the event')
				.setMaxLength(100)
			)
			.addAttachmentOption(option => option
				.setName('graphics')
				.setDescription('graphics to use in the event (default: none)')
			)
			.addStringOption(option => option
				.setName('end-time')
				.setDescription('time when the event ends (dd.mm.yyyy hh:mm) (default: 5 hours after begin-time)')
			)
			.addBooleanOption(option => option
				.setName('description')
				.setDescription('whether to edit the description (default: message)')
			)
			.addBooleanOption(option => option
				.setName('create-now')
				.setDescription('whether the server event should be created right now (default: false)')
			)
		)
		.addSubcommandGroup(subcommand => subcommand
			.setName('delete')
			.setDescription('delete a scheduled event')
			.addSubcommand(subcommand => subcommand
				.setName('whole')
				.setDescription('delete a scheduled event completely')
				.addStringOption(option => option
					.setName('id')
					.setDescription('id of the event')
					.setAutocomplete(true)
					.setRequired(true)
				)
			)
			.addSubcommand(subcommand => subcommand
				.setName('part')
				.setDescription('delete a part of a scheduled event')
				.addStringOption(option => option
					.setName('id')
					.setDescription('id of the event')
					.setAutocomplete(true)
					.setRequired(true)
				)
				.addStringOption(option => option
					.setName('part')
					.setDescription('part to delete')
					.addChoices(
						{ name: 'graphics', value: 'image' },
						{ name: 'end-time (apply default value)', value: 'endTime' },
						{ name: 'description (apply default value)', value: 'description' },
						{ name: 'event (remove already created event)', value: 'eventId' },
					)
					.setRequired(true)
				)
			)
		)
		.addSubcommand(subcommand => subcommand
			.setName('show')
			.setDescription('show setting for the selected scheduled event')
			.addStringOption(option => option
				.setName('id')
				.setDescription('id of the event')
				.setAutocomplete(true)
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
			filtered.map(([key, value]) => ({ name: `${value.v.name} (${key})`, value: key })),
		);
	},
};