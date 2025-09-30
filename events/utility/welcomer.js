import { Events } from 'discord.js';
import { WelcomeMessage } from '../../db-objects.js';

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

		const result = await content.replace('${userId}', member.id);

		await member.send(result)
			.catch(() => {
				console.log(`unable to message user ${displayName}, ${member.id}`);
			});
	},
};