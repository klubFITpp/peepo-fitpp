import Scheduler from '../config/scheduler.js';
import { log } from './helpers.js'
import cache from '../config/cache.js';

export async function scheduleJob(client, thread) {
	const { threadId, unlockTime } = thread;

	if (Scheduler.scheduledJobs[threadId]) Scheduler.scheduledJobs[threadId].cancel();

	if (unlockTime.getTime() <= Date.now()) return;

	Scheduler.scheduleJob(threadId, unlockTime, async () => {
		const guild = await client.guilds.fetch(process.env.THREAD_GUILD_ID);
		const channel = await guild.channels.fetch(threadId);

		await channel.send({
			content: `🇨🇿 | Vlákno bylo odemčeno.\n🇬🇧 | Thread has been unlocked.`,
		}).catch(async err => await log(client, '[ERROR] Could not send message to ' + channel.url + '\n' + err));

		cache.del(threadId);
	});
}