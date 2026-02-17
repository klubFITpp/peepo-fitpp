import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import { sep } from 'path';
import cache from '../../config/cache.js';
import { Thread } from '../../config/database.js';
import { parseDateTime } from '../../utils/helpers.js';
import Scheduler from '../../config/scheduler.js';
import { scheduleJob } from '../../utils/locks.js';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Locks or unlocks a thread.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.addSubcommand(subcommand => subcommand
			.setName('unlock')
			.setDescription('Unlocks the current thread.')
		)
		.addSubcommand(subcommand => subcommand
			.setName('lock')
			.setDescription('Locks the current thread.')
			.addStringOption(option => option
				.setName('unlock-time')
				.setDescription('Date and time to unlock the thread. (format: DD.MM.YYYY HH:MM)')
				.setMinLength(13)
				.setMaxLength(16)
				.setRequired(true)
			)
		),
	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});
		const channel = interaction.channel;

		if (!channel.isThread()) throw new Error('peepo: Not in a thread.')
		if (channel.parentId != process.env.THREAD_CHANNEL_ID) throw new Error('peepo: Not in a configured forum channel.')

		const subcommand = interaction.options.getSubcommand();

		if (subcommand == 'unlock') {
			if (!cache.has(channel.id)) throw new Error(('peepo: Not in a locked thread.'));
			
			const unlockTime = cache.take(channel.id).unlockTime;

			if (unlockTime.getTime() < Date.now()) throw new Error(('peepo: Not in a locked thread.'));

			await Thread.update({
				unlockTime: new Date(),
			}, {
				where: {
					threadId: channel.id,
				},
			});

			if (Scheduler.scheduledJobs[channel.id]) Scheduler.scheduledJobs[channel.id].cancel();

			await channel.send({
				content: `🇨🇿 | Vlákno bylo odemčeno.\n🇬🇧 | Thread has been unlocked.`,
			}).catch(async err => await log(interaction.client, '[ERROR] Could not send message to ' + channel.url + '\n' + err));

			await interaction.editReply({
				content: '✅ The thread has been unlocked.'
			});

		} else if (subcommand == 'lock') {
			const unlockTimeStr = interaction.options.getString('unlock-time');
			const unlockTime = parseDateTime(unlockTimeStr);

			if (unlockTime.getTime() < Date.now()) throw new Error('peepo: Unlock time cannot be set in the past.');

			const response = await Thread.upsert({
				threadId: channel.id,
				unlockTime,
			});

			cache.set(channel.id, response[0]);

			await scheduleJob(interaction.client, response[0]);

			await channel.send({
				content: `🇨🇿 | Vlákno bylo omezeno pro <@&${process.env.THREAD_ROLE_ID}> až do <t:${Math.floor(unlockTime.getTime() / 1000)}>.\n🇬🇧 | Thread has been restricted to <@&${process.env.THREAD_ROLE_ID}> until <t:${Math.floor(unlockTime.getTime() / 1000)}>.`,
				allowedMentions: {
					users: [],
					roles: [],
					everyone: [],
				},
			}).catch(async err => await log(interaction.client, '[ERROR] Could not send message to ' + channel.url + '\n' + err));

			await interaction.editReply({
				content: '✅ The thread has been locked.'
			});
		}
	},
};