import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, MessageFlags, PermissionFlagsBits } from 'discord.js';
import { sep } from 'path';
import { secondsToString } from '../../global.js';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('zjisti jak dlouho průměrně, nejdéle a nekrátš trvalo rakmatymu se připojit do threadu')
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

		const guilds = await interaction.client.guilds.fetch();

		const times = [];

		for (const guildPartial of guilds) {
			const guild = await guildPartial[1].fetch();
			const channels = await guild.channels.fetch();

			for (const channel of channels) {
				if (!channel[1].threads) continue;

				const threadsFetched = await channel[1].threads.fetch();
				const threads = threadsFetched.threads;

				if (threads.size === 0) continue;

				for (const thread of threads) {
					let rakmaty1;

					try {
						rakmaty1 = await thread[1].members.fetch(process.env.RAKMATY_ID);
					}
					catch {
						continue;
					}

					const dateBits = Number(BigInt.asUintN(64, thread[1].id) >> 22n);

					console.log(Math.floor((rakmaty1.joinedTimestamp - (dateBits + 1420070400000)) / 1000));

					times.push(Math.floor((rakmaty1.joinedTimestamp - (dateBits + 1420070400000)) / 1000));
				}
			}
		}

		let min = times[0], max = times[0], sum = times[0];

		for (let i = 1; i < times.length; i++) {
			if (times[i] < min) min = times[i];
			if (times[i] > max) max = times[i];
			sum = sum + times[i];
		}

		const avg = sum / times.length;

		await interaction.editReply(`✅ prošel jsem všechny thready do kterých mám přístup, tady jsou rakmatyho statistiky připojení:\nmin: ${secondsToString(min)}\nmax: ${secondsToString(max)}\navg: ${secondsToString(avg)}`);
	},
};