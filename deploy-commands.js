import dotenv from 'dotenv';
dotenv.config();
import { REST, Routes } from 'discord.js';
import fs from 'fs';
import path from 'path';

const commandsGuild = [];
const commandsClient = [];

const commandFoldersPath = path.join(import.meta.dirname, 'commands');
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
		else console.log(`[warning] the command at ${filePath} is missing a required "data" or "execute" property`);
	}
}

const rest = new REST().setToken(process.env.TOKEN);

(async () => {
	try {
		console.log(`started refreshing ${commandsGuild.length} guild (/) commands`);

		let data = await rest.put(
			Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
			{ body: commandsGuild },
		);

		console.log(`successfully reloaded ${data.length} guild (/) commands\n`);
		console.log(`started refreshing ${commandsClient.length} client (/) commands`);

		data = await rest.put(
			Routes.applicationCommands(process.env.CLIENT_ID),
			{ body: commandsClient },
		);

		console.log(`successfully reloaded ${data.length} client (/) commands`);
	}
	catch (error) {
		console.log('[warning] failed refreshing application (/) commands');

		console.error(error);
	}
})();
