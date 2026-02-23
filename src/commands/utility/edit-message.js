import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags, TextInputStyle, TextInputBuilder, LabelBuilder, ModalBuilder } from 'discord.js';
import { sep } from 'path';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Shows or sets the welcome message.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addStringOption(option => option
			.setName('link')
			.setDescription('Message link.')
			.setRequired(true)
		),
	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		const link = interaction.options.getString('link');

		const ids = link.split('/');

		const guild = await interaction.client.guilds.fetch(ids[ids.length - 3]).catch(() => { throw new Error('peepo: Invalid guild.'); });
		const channel = await guild.channels.fetch(ids[ids.length - 2]).catch(() => { throw new Error('peepo: Invalid channel.'); });
		const message = await channel.messages.fetch(ids[ids.length - 1]).catch(() => { throw new Error('peepo: Invalid message.'); });

		if (message.author.id != interaction.client.user.id) throw new Error('peepo: Not the message author.');

		const modal = new ModalBuilder()
			.setCustomId(`${interaction.id}_updateModal`)
			.setTitle('Message updater')
			.addLabelComponents(
				new LabelBuilder()
					.setLabel('New content')
					.setDescription('The updated content.')
					.setTextInputComponent(
						new TextInputBuilder()
							.setCustomId('contentNew')
							.setValue(message.content)
							.setStyle(TextInputStyle.Paragraph)
							.setRequired(true),
					)
			)

		await interaction.showModal(modal);

		const filter = (m) => m.customId === `${interaction.id}_updateModal`;

		const response = await interaction.awaitModalSubmit({ filter, time: 600_000 }).catch(error => {});

		if (!response) return;

		await response.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		const contentNew = response.fields.getTextInputValue('contentNew');

		await message.edit({
			content: contentNew
		})

		await response.editReply(`${link} has been updated to:\n\n${contentNew}`);
	},
};