import { ChatInputCommandInteraction } from 'discord.js';
import { Schedule } from '../../../db-objects.js';
import cache from '../../../cache.js';
import fs from 'fs';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	const scheduleId = interaction.options.getString('id');
	if (!cache.has(scheduleId)) throw new Error('peepo: no such event');

	await Schedule.destroy({
		where: {
			scheduleId,
		}
	});

	const event = cache.take(scheduleId);

	const guild = await interaction.client.guilds.fetch(process.env.EVENT_GUILD_ID);

	if (event.eventId) await guild.scheduledEvents.delete(event.eventId);
	if (event.image) fs.unlinkSync(event.image);

	await interaction.editReply(`✅ deleted event **${event.name}** | \`${scheduleId}\``);
};