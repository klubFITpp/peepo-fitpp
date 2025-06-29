import { ChatInputCommandInteraction } from 'discord.js';
import { downloadFile, iconUrl } from '../../../global.js';
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
	const message = interaction.options.getString('message');
	const location = interaction.options.getString('location');
	const graphics = interaction.options.getAttachment('graphics');
	const endTimeStr = interaction.options.getString('end-time');
	const description = interaction.options.getString('description');
	const createNow = interaction.options.getBoolean('create-now');

	const { announceTime, beginTime, endTime } = parseEventTimes(announceTimeStr, beginTimeStr, endTimeStr);

	let image = null;

	if (graphics) {
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
		createNow,
	};

	const { embed, imageObject } = await scheduleEvent(interaction, event);

	await interaction.editReply({
		content: '✅ scheduled an event with the following settings:',
		embeds: [embed],
		files: imageObject ? [imageObject, iconUrl] : [iconUrl],
	});
};