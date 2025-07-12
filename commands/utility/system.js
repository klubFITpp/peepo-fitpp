import { ChatInputCommandInteraction, MessageFlags, PermissionFlagsBits, SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { defaultEmbed, iconUrl, secondsToString } from '../../global.js';
import { sep } from 'path';
import { exec as execN } from 'child_process';
import { promisify } from 'util';
const exec = promisify(execN);
import fs from 'fs';
import os from 'os';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('get current system info')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply({
			flags: MessageFlags.Ephemeral,
		});

		const loadavg = os.loadavg();

		const system = fs.readFileSync('/etc/os-release', 'utf8');
		const opj = {};

		system?.split('\n')?.forEach((line, index) => {
			const words = line?.split('=');
			const key = words[0]?.toLowerCase();
			if (key === '') return;
			const value = words[1]?.replace(/"/g, '');
			opj[key] = value;
		});

		const { stdout: procOut, err: procErr } = await exec('pm2 l | tail -n +3 | head -n -1');

		const embed = new EmbedBuilder(defaultEmbed)
			.setAuthor({
				name: interaction.client.user.tag,
				iconURL: interaction.client.user.avatarURL(),
				url: 'https://github.com/klubFITpp/peepo-fitpp',
			})
			.setTitle('system information')
			.addFields([
				{ name: 'operating system', value: `${opj.pretty_name}` },
				{ name: 'memory usage', value: `${((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0)} / ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB`, inline: true },
				{ name: 'cores', value: `${os.cpus().length}`, inline: true },
				{ name: 'uptime', value: secondsToString(os.uptime()), inline: true },
				{ name: '1m avg load', value: `${(loadavg[0] * 100).toFixed(0)} %`, inline: true },
				{ name: '5m avg load', value: `${(loadavg[1] * 100).toFixed(0)} %`, inline: true },
				{ name: '15m avg load', value: `${(loadavg[2] * 100).toFixed(0)} %`, inline: true },
			])
			.setTimestamp();

		if (!procErr) embed
			.addFields([
				{ name: 'apps online', value: `${(procOut.match(/online/g) || []).length}`, inline: true },
				{ name: 'apps stopped', value: `${(procOut.match(/stopped/g) || []).length}`, inline: true },
			]);


		await interaction.editReply({
			embeds: [embed],
			files: [iconUrl],
		});
	},
};