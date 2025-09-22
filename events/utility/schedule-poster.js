import { AttachmentBuilder, ChannelType, Client, EmbedBuilder, Events, GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel } from 'discord.js';
import { Schedule } from '../../db-objects.js';
import cache from '../../cache.js';
import { addMinutes, defaultEmbed, parseDateTime, sleep } from '../../global.js';
import cron from 'node-cron';
import fs from 'fs';

export default {
	event: Events.ClientReady,
	once: true,

	/**
	 * Execute the client event
	 *
	 * @param {Client} client
	 */
	async execute(client) {
		const guildAnnounce = await client.guilds.fetch(process.env.ANNOUNCE_GUILD_ID);
		const channel = await guildAnnounce.channels.fetch(process.env.ANNOUNCE_CHANNEL_ID);

		const guildEvent = await client.guilds.fetch(process.env.EVENT_GUILD_ID);

		const botPermissions = channel.permissionsFor(guildAnnounce.members.me);
		if (!botPermissions.has('SendMessages')) throw new Error('can\'t send messages in this channel!');

		const task = cron.schedule('* * * * *', async (ctx) => {
			const currentDate = new Date();
			currentDate.setSeconds(0, 0);

			const cacheArray = Object.entries(cache.data).filter(([key, value]) => ('scheduleId' in value.v && value.v.announceTime.getTime() <= currentDate.getTime() && value.v.endTime.getTime() > currentDate.getTime()));

			cacheArray.forEach(async ([key, value]) => {
				const event = cache.take(key);

				if (!event.eventId) event.eventId = await createScheduledEvent(event, guildEvent);

				const message = await channel.send({
					content: event.message + `\n\nhttps://discord.com/events/${process.env.EVENT_GUILD_ID}/${event.eventId}`,
					allowedMentions: {
						users: [],
						roles: [],
						everyone: [],
					},
				});


				if (channel.type === ChannelType.GuildAnnouncement && botPermissions.has('ManageMessages')) await message.crosspost();

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

				if (event.image) fs.unlinkSync(event.image);
			});
		});

		task.execute();
	},
};

export function parseEventTimes(announceTimeStr, beginTimeStr, endTimeStr) {
	const currentTime = new Date();

	const announceTime = parseDateTime(announceTimeStr);
	const beginTime = parseDateTime(beginTimeStr);

	let endTime = null;
	if (endTimeStr) endTime = parseDateTime(endTimeStr);

	if (announceTime.getTime() <= currentTime.getTime()) throw new Error('peepo: announce-time cannot be in the past');
	if (beginTime.getTime() <= announceTime.getTime()) throw new Error('peepo: begin-time cannot be before announce-time');
	if (endTime && endTime.getTime() <= beginTime.getTime()) throw new Error('peepo: end-time cannot be before begin-time');

	if (!endTime) endTime = addMinutes(beginTime, 5 * 60);

	return { announceTime, beginTime, endTime };
};

export async function createScheduledEvent(event, guild) {
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

export function createEventEmbed(scheduleId, interaction) {
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
			name: interaction.client.user.tag,
			iconURL: interaction.client.user.avatarURL(),
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
			text: `FIT++ | schedule ID: ${scheduleId}`,
			iconURL: 'attachment://embedFooterLogo.png',
		});;

	let imageObject = null;

	if (image) {
		imageObject = new AttachmentBuilder(image);
		embed.setImage(`attachment://${image.split('/')[image.split('/').length - 1]}`);
	}

	return { embed, imageObject };
}

export async function scheduleEvent(interaction, event) {
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

	const guild = await interaction.client.guilds.fetch(process.env.EVENT_GUILD_ID);

	let newId = null;
	if (createNow || eventId) newId = await createScheduledEvent(event, guild);

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

	return createEventEmbed(scheduleId, interaction);
};