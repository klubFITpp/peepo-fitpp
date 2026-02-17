import { AttachmentBuilder, ChannelType, EmbedBuilder, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, PermissionsBitField } from 'discord.js';
import { Schedule } from '../config/database.js';
import Scheduler from '../config/scheduler.js';
import { addMinutes, defaultEmbed, log, parseDateTime } from './helpers.js'
import cache from '../config/cache.js';
import fs from 'fs';

export async function scheduleJob(client, event) {
	const { scheduleId, announceTime } = event;

	if (Scheduler.scheduledJobs[scheduleId]) Scheduler.scheduledJobs[scheduleId].cancel();

	if (announceTime.getTime() <= Date.now()) return;

	Scheduler.scheduleJob(scheduleId, announceTime, async () => {
		const guildAnnounce = await client.guilds.fetch(process.env.ANNOUNCE_GUILD_ID);
		const channel = await guildAnnounce.channels.fetch(process.env.ANNOUNCE_CHANNEL_ID);
		const guildEvent = await client.guilds.fetch(process.env.EVENT_GUILD_ID);

		const botPermissions = channel.permissionsFor(guildAnnounce.members.me);

		if (!botPermissions.has('SendMessages')) {
			await log(client, '[ERROR] Can\'t send messages at ' + channel.url);
			cache.del(event.scheduleId);
			if (event.image) fs.unlinkSync(event.image);
			return;
		}

		if (!event.eventId) event.eventId = await upsertScheduledEvent(event, guildEvent);

		if (!event.eventId) {
			await log(client, '[ERROR] Can\'t manage events at ' + guildEvent.id);
			cache.del(event.scheduleId);
			if (event.image) fs.unlinkSync(event.image);
			return;
		}

		const message = await channel.send({
			content: event.message + `\n\nhttps://discord.com/events/${process.env.EVENT_GUILD_ID}/${event.eventId}`,
			allowedMentions: {
				users: [],
				roles: [],
				everyone: [],
			},
		});

		if (channel.type === ChannelType.GuildAnnouncement && botPermissions.has('ManageMessages')) {
			await message.crosspost();
		}

		setTimeout(async () => {
			await message.suppressEmbeds(true);
		}, 3000);

		await Schedule.update({
			posted: true,
		}, {
			where: {
				scheduleId: event.scheduleId,
			},
		});

		cache.del(event.scheduleId);
		if (event.image) fs.unlinkSync(event.image);
	});
}

export async function scheduleEvent(client, event) {
	cache.set('schedule-lock', { locked: true });

	const {
		scheduleId,
		announceTime,
		beginTime,
		name,
		message,
		location,
		image,
		endTime,
		description,
		eventId,
		createNow,
	} = event;

	const guild = await client.guilds.fetch(process.env.EVENT_GUILD_ID);

	let newId = null;
	if (createNow || eventId) newId = await upsertScheduledEvent(event, guild);

	const schedule = await Schedule.upsert({
		scheduleId,
		announceTime,
		beginTime,
		name,
		message,
		location,
		image,
		endTime,
		description,
		eventId: newId,
	});

	cache.set(scheduleId, schedule[0]);
	await scheduleJob(client, event);

	cache.set('schedule-lock', { locked: false });
	return createEventEmbed(scheduleId, client);
};

export async function upsertScheduledEvent(event, guild) {
	if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEvents | PermissionsBitField.Flags.CreateEvents)) {
		await log(guild.client, '[ERROR] Can\'t manage events at ' + guild.id);
		return;
	};

	const {
		scheduleId,
		beginTime,
		name,
		message,
		location,
		image,
		endTime,
		description,
	} = event;

	const eventOptions = {
		name,
		description: description || message,
		image,
		scheduledStartTime: beginTime,
		scheduledEndTime: endTime,
		privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
		entityType: GuildScheduledEventEntityType.External,
		entityMetadata: {
			location,
		},
	};

	let scheduledEvent;

	if (!cache.has(scheduleId) || !cache.get(scheduleId).eventId) scheduledEvent = await guild.scheduledEvents.create(eventOptions);
	else scheduledEvent = await guild.scheduledEvents.edit(cache.get(scheduleId).eventId, eventOptions);

	return scheduledEvent.id;
}

export function createEventEmbed(scheduleId, client) {
	const {
		announceTime,
		beginTime,
		name,
		message,
		location,
		image,
		endTime,
		description,
		eventId,
	} = cache.get(scheduleId);

	const embed = new EmbedBuilder(defaultEmbed)
		.setTitle(name)
		.setAuthor({
			name: client.user.tag,
			iconURL: client.user.avatarURL(),
			url: 'https://github.com/klubFITpp/peepo-fitpp',
		})
		.addFields([
			{
				name: 'announce-time:',
				value: `<t:${announceTime.getTime() / 1000}:f>`,
				inline: true,
			},
			{
				name: 'begin-time:',
				value: `<t:${beginTime.getTime() / 1000}:f>`,
				inline: true,
			},
			{
				name: 'end-time:',
				value: `<t:${endTime.getTime() / 1000}:f>`,
				inline: true,
			},
			{
				name: 'location:',
				value: location,
				inline: true,
			},
			{
				name: 'event-id',
				value: eventId ? eventId : 'not yet created',
				inline: true,
			},
		])
		.setDescription('**message**:\n' + message + (description ? ('\n\n**description**:\n' + description) : ''))
		.setTimestamp()
		.setFooter({
			text: `FIT++ | Schedule ID: ${scheduleId}`,
			iconURL: 'attachment://embedFooterLogo.png',
		});;

	let imageObject = null;

	if (image) {
		imageObject = new AttachmentBuilder(image);
		embed.setImage(`attachment://${image.split('/')[image.split('/').length - 1]}`);
	}

	return { embed, imageObject };
}

export function parseEventTimes(announceTimeStr, beginTimeStr, endTimeStr) {
	const currentTime = new Date();

	const announceTime = parseDateTime(announceTimeStr);
	const beginTime = parseDateTime(beginTimeStr);

	let endTime = null;
	if (endTimeStr) endTime = parseDateTime(endTimeStr);

	if (announceTime.getTime() <= currentTime.getTime()) throw new Error('peepo: Announce-time cannot be set in the past.');
	if (beginTime.getTime() <= announceTime.getTime()) throw new Error('peepo: Begin-time cannot be set before announce-time.');
	if (endTime && endTime.getTime() <= beginTime.getTime()) throw new Error('peepo: End-time cannot be set before begin-time.');

	if (!endTime) endTime = addMinutes(beginTime, 5 * 60);

	return { announceTime, beginTime, endTime };
};