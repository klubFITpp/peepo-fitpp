import { ActionRowBuilder, ChatInputCommandInteraction, MessageFlags, ModalBuilder, TextInputBuilder } from 'discord.js';
import { WelcomeMessage } from '../../../db-objects.js';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	const currentMessage = await WelcomeMessage.findByPk('main');

	const modal = new ModalBuilder()
		.setCustomId(`${interaction.id}_welcomeModal`)
		.setTitle('welcome message updater')
		.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId('welcomeMessage')
					.setLabel('the message')
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

	const result = message.replace('${userId}', interaction.user.id);

	await response.editReply(`the **welcome message** has been set to:\n\n${result}`);
};