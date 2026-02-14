import { Events } from 'discord.js';
import { WelcomeMessage } from '../../config/database.js';
import { log } from '../../utils/helpers.js';

export default {
	event: Events.GuildMemberAdd,
	/**
	 * Execute the member event
	 *
	 * @param {GuildMember} interaction
	 */
	async execute(member) {
		if (member.guild.id !== process.env.WELCOME_GUILD_ID) return;

		let displayName = '';

		if (member.user.discriminator === '0') displayName = member.user.username;
		else displayName = member.user.tag;

		const welcomeMessage = await WelcomeMessage.findByPk('main');

		const content = welcomeMessage.message;

		const result = await content.replaceAll('${userId}', member.id);

		await member.send(result)
			.catch(() => {
				log(member.client, `[ERROR] Unable to message user ${displayName}, ${member.id}`);
			});
	},
};