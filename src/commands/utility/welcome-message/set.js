import { ChatInputCommandInteraction, LabelBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
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
		.addLabelComponents(
			new LabelBuilder()
				.setLabel('Message')
				.setDescription('The welcome message.')
				.setTextInputComponent(
					new TextInputBuilder()
						.setCustomId('welcomeMessage')
						.setValue(currentMessage.message)
						.setStyle(TextInputStyle.Paragraph)
						.setRequired(true),
				)
		)

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