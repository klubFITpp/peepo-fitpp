import { ChatInputCommandInteraction } from 'discord.js';
import cache from '../../../cache.js';
import { dateToString, downloadFile, iconUrl } from '../../../global.js';
import { parseEventTimes, scheduleEvent } from '../../../events/utility/schedule-poster.js';
import fs from 'fs';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	const scheduleId = interaction.options.getString('id');
	if (!cache.has(scheduleId)) throw new Error('peepo: no such event');

	const original = cache.get(scheduleId);

	if (
		!interaction.options.getString('announce-time') &&
		!interaction.options.getString('begin-time') &&
		!interaction.options.getString('name') &&
		!interaction.options.getString('message') &&
		!interaction.options.getString('location') &&
		!interaction.options.getAttachment('graphics') &&
		!interaction.options.getString('end-time') &&
		!interaction.options.getString('description') &&
		!interaction.options.getBoolean('create-now')
	) throw new Error('peepo: nothing to edit');

	const announceTimeStr = interaction.options.getString('announce-time') || dateToString(original.announceTime);
	const beginTimeStr = interaction.options.getString('begin-time') || dateToString(original.beginTime);
	const name = interaction.options.getString('name') || original.name;
	const message = interaction.options.getString('message') || original.message;
	const location = interaction.options.getString('location') || original.location;
	const graphics = interaction.options.getAttachment('graphics');
	let endTimeStr = interaction.options.getString('end-time');
	const description = interaction.options.getString('description') || original.description;
	const createNow = interaction.options.getBoolean('create-now');

	if (interaction.options.getString('end-time')) endTimeStr = interaction.options.getString('end-time');
	else if (interaction.options.getString('begin-time') && !interaction.options.getString('end-time')) endTimeStr = null;
	else endTimeStr = dateToString(original.endTime);

	const { announceTime, beginTime, endTime } = parseEventTimes(announceTimeStr, beginTimeStr, endTimeStr);

	let image = original.image;

	if (graphics) {
		if (image) fs.unlinkSync(image);

		const sourceType = graphics.contentType;
		if (!sourceType || !sourceType.includes('image')) throw new Error('peepo: not an image file');

		image = await downloadFile(graphics.url, scheduleId, sourceType.split('/')[1]);
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