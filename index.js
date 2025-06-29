if (process.argv[2] == 'server') await new Promise(resolve => setTimeout(resolve, 30000));

import dotenv from 'dotenv';
dotenv.config();
import fs from 'fs';
import path from 'path';
import { ActivityType, Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import { randomNumber } from './global.js';
import {} from './cache.js';
import {} from './db-objects.js';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
	],
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

const eventFoldersPath = path.join(import.meta.dirname, 'events');
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
		await interaction.deferReply();
		await command.execute(interaction);
	}
	catch (error) {
		if (error.message.startsWith('peepo: ')) await interaction.editReply(`❌ error: ${error.message.substring(7)}${!randomNumber(0, 2) ? '\n\ntip: did you know you can press ⬆️ "ARROW_UP" on your keyboard to reuse your last command input?' : ''}`);
		else {
			console.error(error);
			await interaction.editReply('❌ error: unknown error, contact <@310457566276616193>');
		}
	}
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isAutocomplete()) return;

	const command = client.commands.get(interaction.commandName);
	if (!command) return;

	try {
		await command.autocomplete(interaction);
	}
	catch (error) {
		console.error(error);
	}
});

client.once(Events.ClientReady, async () => {
	client.user.setPresence({ activities: [{ name: 'lectures', type: ActivityType.Watching }], status: 'dnd' });
	console.log(`ready! logged in as ${client.user.tag}`);
});

client.login(process.env.TOKEN);