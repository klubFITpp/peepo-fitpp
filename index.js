if (process.argv[2] == 'server') await new Promise(resolve => setTimeout(resolve, 30000));

import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { Op } from 'sequelize';
import { ActivityType, Client, Collection, Events } from 'discord.js';
import { Schedule } from './db-objects.js';

const client = new Client({
	intents: [],
});

// Load commands

client.commands = new Collection();

const commandFoldersPath = path.join(import.meta.dirname, 'commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(commandFoldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(filePath);

		const commandModule = command.default || command;

		if ('data' in commandModule && 'execute' in commandModule) client.commands.set(commandModule.data.name, commandModule);
		else console.log(`[warning] the command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

// Load events

const eventFoldersPath = path.join(import.meta.dirname, 'commands');
const eventFolders = fs.readdirSync(eventFoldersPath);

for (const folder of eventFolders) {
	const eventsPath = path.join(eventFoldersPath, folder);
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = await import(filePath);

		const eventModule = event.default || event;

		if (eventModule.once) client.once(eventModule.event, (...args) => eventModule.execute(...args));
		else client.on(eventModule.event, (...args) => eventModule.execute(...args));
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);

		await interaction.editReply('there was an error while executing this command!\ntry again, and if this error persists, contact <@310457566276616193>');
	}
});

const schedules = Schedule.findAll({
	where: {
		time: {
			[Op.gte]: new Date(),
		}
	}
});

client.once(Events.ClientReady, async () => {
	client.user.setPresence({ activities: [{ name: 'lectures', type: ActivityType.Watching }], status: 'dnd' });
	console.log(`ready! logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);

export { schedules };