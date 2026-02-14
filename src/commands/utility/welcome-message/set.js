import { ActionRowBuilder, ChatInputCommandInteraction, MessageFlags, ModalBuilder, TextInputBuilder } from 'discord.js';
import { WelcomeMessage } from '../../../config/database.js';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	const currentMessage = await WelcomeMessage.findByPk('main');

	const modal = new ModalBuilder()
		.setCustomId(`${interaction.id}_welcomeModal`)
		.setTitle('Welcome message updater')
		.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId('welcomeMessage')
					.setLabel('Message')
					.setValue(currentMessage.message)
					.setStyle(2)
					.setRequired(true),
			),
		);

	await interaction.showModal(modal);

	const filter = (m) => m.customId === `${interaction.id}_welcomeModal`;

	const response = await interaction.awaitModalSubmit({ filter, time: 600_000 });

	await response.deferReply({
		flags: MessageFlags.Ephemeral,
	});

	const message = response.fields.getTextInputValue('welcomeMessage');

	await WelcomeMessage.upsert({
		name: 'main',
		message,
	});

	const result = message.replaceAll('${userId}', interaction.user.id);

	await response.editReply(`The **welcome message** has been set to:\n\n${result}`);
};