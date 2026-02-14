import { ChatInputCommandInteraction } from 'discord.js';
import { relativeTime } from '../../../utils/helpers.js';
import cache from '../../../config/cache.js';

/**
 * Execute the command
 *
 * @param {ChatInputCommandInteraction} interaction
 */
export default async (interaction) => {
	await interaction.deferReply();

	const cacheArray = Object.entries(cache.data).filter(([key, value]) => 'scheduleId' in value.v);
	if (cacheArray.length === 0) throw new Error('peepo: No scheduled events.');

	let content = '✅ currently scheduled events:\n';

	cacheArray.sort(([aKey, aValue], [bKey, bValue]) => { return aValue.v.announceTime.getTime() - bValue.v.announceTime.getTime(); });

	cacheArray.forEach(([key, value]) => {
		content += `\n${relativeTime(value.v.announceTime)} | **${value.v.name}** | \`${key}\``;
	});

	await interaction.editReply(content);
};