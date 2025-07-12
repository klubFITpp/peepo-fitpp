import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { sep } from 'path';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('react to a message')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(option => option
			.setName('link')
			.setDescription('message link')
			.setRequired(true)
		)
		.addStringOption(option => option
			.setName('emoji')
			.setDescription('emote to react with')
			.setRequired(true)
		),

	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		const link = interaction.options.getString('link');
		const emoji = interaction.options.getString('emoji');

		const iDs = link.split('/');

		const guild = await interaction.client.guilds.fetch(iDs[iDs.length - 3]).catch(() => { throw new Error('peepo: invalid guild'); });
		const channel = await guild.channels.fetch(iDs[iDs.length - 2]).catch(() => { throw new Error('peepo: invalid channel'); });
		const message = await channel.messages.fetch(iDs[iDs.length - 1]).catch(() => { throw new Error('peepo: invalid message'); });

		await message.react(emoji).catch(() => { throw new Error('peepo: invalid emote/lacking reaction permissions'); });

		await interaction.editReply(`reacted with ${emoji} to ${link}`);
	},
};