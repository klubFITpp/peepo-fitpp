import { Events, Message } from 'discord.js';
import { addMinutes, log } from '../../utils/helpers.js';
import cache from '../../config/cache.js';

export default {
	event: Events.MessageCreate,
	/**
	 * Execute the thread event
	 *
	 * @param {Message} message
	 */
	async execute(message) {
		const channel = message.channel;

		if (message.author.bot || !channel.isThread() || channel.parentId != process.env.THREAD_CHANNEL_ID || !cache.has(channel.id) || message.member.roles.valueOf().has(process.env.THREAD_ROLE_ID)) return;

		const unlockTime = cache.get(channel.id).unlockTime;

		if (unlockTime.getTime() < Date.now()) {
			cache.del(channel.id);
			return;
		}

		if (!channel.permissionsFor(channel.guild.members.me).has('ManageMessages')) {
			await log(message.client, `[ERROR] Missing 'Manage messages' permission at ` + channel.url);
			return;
		}

		const role = await channel.guild.roles.fetch(process.env.THREAD_ROLE_ID);

		try {
			await message.member.send({
				content: `🇨🇿 | Vaše zpráva v ${channel.url} byla smazána, neb vlákno je až do <t:${Math.floor(unlockTime.getTime() / 1000)}> určeno pouze pro \`${role.name}\`. Zprávu vám pro případ potřeby zachování obsahu přeposíláme.\n🇬🇧 | Your message at ${channel.url} was deleted, as the thread is restricted to \`${role.name}\` until <t:${Math.floor(unlockTime.getTime() / 1000)}>. We are forwarding the message to you in case you need the content preserved.`
			});

			await message.forward(message.member.dmChannel);

			await message.delete();
		} catch (err) {
			await log(message.client, '[ERROR] Could not delete ' + message.url + '\n' + err);
		}
	},
};