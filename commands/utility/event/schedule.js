import { ActionRowBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import { downloadFile, iconUrl, errorMessage } from '../../../global.js';
import { parseEventTimes, scheduleEvent } from '../../../events/utility/schedule-poster.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	const scheduleId = uuidv4();

	const announceTimeStr = interaction.options.getString('announce-time');
	const beginTimeStr = interaction.options.getString('begin-time');
	const name = interaction.options.getString('name');
	const location = interaction.options.getString('location');
	const graphics = interaction.options.getAttachment('graphics');
	const endTimeStr = interaction.options.getString('end-time');
	let description = interaction.options.getBoolean('description');
	const createNow = interaction.options.getBoolean('create-now');

	const modal = new ModalBuilder()
		.setCustomId(`${interaction.id}_modal`)
		.setTitle('text input')
		.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId('message')
					.setLabel('message')
					.setStyle(TextInputStyle.Paragraph)
					.setMinLength(1)
					.setMaxLength(1000)
					.setRequired(true),
			),
		);

	if (description) modal.addComponents(
		new ActionRowBuilder().addComponents(
			new TextInputBuilder()
				.setCustomId('description')
				.setLabel('description')
				.setStyle(TextInputStyle.Paragraph)
				.setMinLength(1)
				.setMaxLength(1000)
				.setRequired(true)
		)
	);

	await interaction.showModal(modal);

	const filter = (m) => m.customId === `${interaction.id}_modal`;

	const response = await interaction.awaitModalSubmit({ filter, time: 600_000 });

	await response.deferReply();

	const message = response.fields.getTextInputValue('message');
	if (description) description = response.fields.getTextInputValue('description');

	let announceTime, beginTime, endTime;

	try {
		({ announceTime, beginTime, endTime } = parseEventTimes(announceTimeStr, beginTimeStr, endTimeStr));
	}
	catch (error) {
		if (error.message.startsWith('peepo: ')) return response.editReply(errorMessage(error.message.substring(7)));
		else throw error;
	}

	let image = null;

	if (graphics) {
		const sourceType = graphics.contentType;
		if (!sourceType || !sourceType.includes('image')) return response.editReply(errorMessage('not an image file'));

		try {
			image = await downloadFile(graphics.url, scheduleId, sourceType.split('/')[1]);
		}
		catch (error) {
			if (error.message.startsWith('peepo: ')) return response.editReply(errorMessage(error.message.substring(7)));
			else throw error;
		}
	}

	const event = {
		scheduleId,
		announceTime,
		beginTime,
		name,
		message,
		location,
		image,
		endTime,
		description,
		createNow,
	};

	const { embed, imageObject } = await scheduleEvent(interaction, event);

	await response.editReply({
		content: '✅ scheduled an event with the following settings:',
		embeds: [embed],
		files: imageObject ? [imageObject, iconUrl] : [iconUrl],
	});
};