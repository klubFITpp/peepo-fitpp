import { Events } from 'discord.js';
import { Thread } from '../../config/database.js';
import { addMinutes, log } from '../../utils/helpers.js';
import cache from '../../config/cache.js';
import { scheduleJob } from '../../utils/locks.js';

export default {
	event: Events.ThreadCreate,
	/**
	 * Execute the thread event
	 *
	 * @param {import('discord.js').AnyThreadChannel} thread
	 */
	async execute(thread) {
		if (thread.parentId != process.env.THREAD_CHANNEL_ID) return;

		const unlockTime = addMinutes(new Date(), 2 * 24 * 60);

		const response = await Thread.create({
			threadId: thread.id,
			unlockTime,
		});

		cache.set(thread.id, response);

		await scheduleJob(thread.client, response);

		await thread.send({
			content: `🇨🇿 | Vlákno je otevřeno pouze pro <@&${process.env.THREAD_ROLE_ID}> až do <t:${Math.floor(unlockTime.getTime() / 1000)}>.\n🇬🇧 | Thread is open only to <@&${process.env.THREAD_ROLE_ID}> until <t:${Math.floor(unlockTime.getTime() / 1000)}>.`,
			allowedMentions: {
				users: [],
				roles: [],
				everyone: [],
			},
		}).catch(async err => await log(thread.client, '[ERROR] Could not send message to ' + thread.url + '\n' + err));
	},
};