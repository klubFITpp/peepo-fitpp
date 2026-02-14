import { ChatInputCommandInteraction } from 'discord.js';
import { Schedule } from '../../../config/database.js';
import Scheduler from '../../../config/scheduler.js';
import cache from '../../../config/cache.js';
import fs from 'fs';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	await interaction.deferReply();

	const scheduleId = interaction.options.getString('id');
	if (!cache.has(scheduleId)) throw new Error('peepo: no such event');

	await Schedule.destroy({
		where: {
			scheduleId,
		}
	});

	const event = cache.take(scheduleId);

	if(Scheduler.scheduledJobs[scheduleId]) Scheduler.scheduledJobs[scheduleId].cancel();

	const guild = await interaction.client.guilds.fetch(process.env.EVENT_GUILD_ID);

	if (event.eventId) await guild.scheduledEvents.delete(event.eventId);
	if (event.image) fs.unlinkSync(event.image);

	await interaction.editReply(`✅ deleted event **${event.name}** | \`${scheduleId}\``);
};