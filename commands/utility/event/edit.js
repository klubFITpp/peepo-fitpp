import { ActionRowBuilder, ChatInputCommandInteraction, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import cache from '../../../cache.js';
import { dateToString, downloadFile, iconUrl, randomNumber } from '../../../global.js';
import { parseEventTimes, scheduleEvent } from '../../../events/utility/schedule-poster.js';
import fs from 'fs';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	const scheduleId = interaction.options.getString('id');
	if (!cache.has(scheduleId)) return interaction.reply(`❌ error: no such event${!randomNumber(0, 2) ? '\n\ntip: did you know you can press ⬆️ "ARROW_UP" on your keyboard to reuse your last command input?' : ''}`);

	const original = cache.get(scheduleId);

	if (
		!interaction.options.getString('announce-time') &&
		!interaction.options.getString('begin-time') &&
		!interaction.options.getString('name') &&
		!interaction.options.getBoolean('message') &&
		!interaction.options.getString('location') &&
		!interaction.options.getAttachment('graphics') &&
		!interaction.options.getString('end-time') &&
		!interaction.options.getBoolean('description') &&
		!interaction.options.getBoolean('create-now')
	) return interaction.reply(`❌ error: nothing to edit${!randomNumber(0, 2) ? '\n\ntip: did you know you can press ⬆️ "ARROW_UP" on your keyboard to reuse your last command input?' : ''}`);

	const announceTimeStr = interaction.options.getString('announce-time') || dateToString(original.announceTime);
	const beginTimeStr = interaction.options.getString('begin-time') || dateToString(original.beginTime);
	const name = interaction.options.getString('name') || original.name;
	let message = interaction.options.getBoolean('message');
	const location = interaction.options.getString('location') || original.location;
	const graphics = interaction.options.getAttachment('graphics');
	let endTimeStr = interaction.options.getString('end-time');
	let description = interaction.options.getBoolean('description');
	const createNow = interaction.options.getBoolean('create-now');

	if (interaction.options.getString('end-time')) endTimeStr = interaction.options.getString('end-time');
	else if (interaction.options.getString('begin-time') && !interaction.options.getString('end-time')) endTimeStr = null;
	else endTimeStr = dateToString(original.endTime);

	if (message || description) {
		const modal = new ModalBuilder()
			.setCustomId(`${interaction.id}_modal`)
			.setTitle('text input');

		if (message) modal.addComponents(
			new ActionRowBuilder().addComponents(
				new TextInputBuilder()
					.setCustomId('message')
					.setLabel('message')
					.setStyle(TextInputStyle.Paragraph)
					.setMinLength(1)
					.setMaxLength(1000)
					.setRequired(true)
			)
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

		if (message) message = response.fields.getTextInputValue('message');
		else message = original.message;

		if (description) description = response.fields.getTextInputValue('description');
		else description = original.description;

		interaction = response;
	}
	else {
		message = original.message;
		description = original.description;
	}

	await interaction.deferReply();

	let announceTime, beginTime, endTime;

	try {
		({ announceTime, beginTime, endTime } = parseEventTimes(announceTimeStr, beginTimeStr, endTimeStr));
	}
	catch (error) {
		return interaction.editReply(`❌ error: ${error.message.substring(7)}${!randomNumber(0, 2) ? '\n\ntip: did you know you can press ⬆️ "ARROW_UP" on your keyboard to reuse your last command input?' : ''}`);
	}

	let image = original.image;

	if (graphics) {
		if (image) fs.unlinkSync(image);

		const sourceType = graphics.contentType;
		if (!sourceType || !sourceType.includes('image')) throw new Error('peepo: not an image file');

		try {
			image = await downloadFile(graphics.url, scheduleId, sourceType.split('/')[1]);
		}
		catch (error) {
			return interaction.editReply(`❌ error: ${error.message.substring(7)}${!randomNumber(0, 2) ? '\n\ntip: did you know you can press ⬆️ "ARROW_UP" on your keyboard to reuse your last command input?' : ''}`);
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
		eventId: original.eventId,
		createNow,
	};

	const { embed, imageObject } = await scheduleEvent(interaction, event);

	await interaction.editReply({
		content: '✅ event now has following settings:',
		embeds: [embed],
		files: imageObject ? [imageObject, iconUrl] : [iconUrl],
	});
};