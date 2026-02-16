import 'dotenv/config';
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

const commandsGuild = [];
const commandsClient = [];

const commandFoldersPath = path.join(import.meta.dirname, '..', 'src', 'commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(commandFoldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = await import(filePath);

		const commandModule = command.default || command;

		if ('data' in commandModule && 'execute' in commandModule) {
			if (commandModule.guild === true) commandsGuild.push(commandModule.data.toJSON());
			if (commandModule.guild === false) commandsClient.push(commandModule.data.toJSON());
		}
		else console.error(`[ERROR] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

const rest = new REST().setToken(process.env.TOKEN);

try {
	console.log(`Started refreshing ${commandsGuild.length} guild (/) command(s).`);

	const guilds = process.env.GUILD_IDS.split(',');

	let data;

	for (const guild of guilds) {
		await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, guild),
			{ body: [] },
		);

		data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, guild),
			{ body: commandsGuild },
		);

		console.log(`Successfully refreshed ${data.length} guild (/) command(s) at ${guild}.`);
	}

	console.log(`\nStarted refreshing ${commandsClient.length} client (/) command(s).`);

	await rest.put(
		Routes.applicationCommands(process.env.CLIENT_ID),
		{ body: [] },
	);

	data = await rest.put(
		Routes.applicationCommands(process.env.CLIENT_ID),
		{ body: commandsClient },
	);

	console.log(`Successfully refreshed ${data.length} client (/) command(s).`);
}
catch (error) {
	console.error(`[ERROR] Failed refreshing application (/) command(s): ${error.message}`, error);
}
