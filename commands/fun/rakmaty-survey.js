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
		await interaction.reply('⏩ začal jsem hledat...');

		const guilds = await interaction.client.guilds.fetch();

		let times = [];
		let countAll = 0, countRakmaty = 0;

		for (const [guildPartialId, guildPartial] of guilds) {
			const guild = await guildPartial.fetch();
			const channels = await guild.channels.fetch();

			for (const [channelId, channel] of channels) {
				if (!channel.threads) continue;

				const threadsFetchedActive = await channel.threads.fetchActive();


				let threadsFetchedArchivedPublic, threadsFetchedArchivedPrivate;

				try {
					threadsFetchedArchivedPublic = await channel.threads.fetchArchived({
						type: 'public',
						fetchAll: true,
					});
				}
				// eslint-disable-next-line no-empty
				catch {}

				try {
					threadsFetchedArchivedPrivate = await channel.threads.fetchArchived({
						type: 'private',
						fetchAll: true,
					});
				}
				// eslint-disable-next-line no-empty
				catch {}

				let threads = threadsFetchedActive.threads;

				if (threadsFetchedArchivedPublic) threads = threads.concat(threadsFetchedArchivedPublic.threads);
				if (threadsFetchedArchivedPrivate) threads = threads.concat(threadsFetchedArchivedPrivate.threads);

				if (threads.size === 0) continue;

				for (const [threadId, thread ] of threads) {
					countAll++;
					if (countAll % 30 == 0 && countAll != 0) await interaction.editReply(`⏩ prošel jsem už ${countAll} threadů, v ${countRakmaty} z nich byl rakmaty, hledám dál...`);

					let rakmaty1;
					try {
						rakmaty1 = await thread.members.fetch(process.env.RAKMATY_ID);
					}
					catch {
						continue;
					}

					countRakmaty++;

					const seconds = Math.floor((rakmaty1.joinedTimestamp - (Number(BigInt.asUintN(64, thread.id) >> 22n) + 1420070400000)) / 1000);

					if (thread.ownerId != process.env.RAKMATY_ID && seconds > 1) times.push(seconds);
				}
			}
		}

		if (countRakmaty === 0) throw new Error(`peepo: v žádném z threadů do kterých mám přístup (celkem ${countAll}) není rakmaty`);
		if (times.length === 0) throw new Error(`peepo: prošel jsem všechny thready do kterých mám přístup (celkem ${countAll}) a je v nich rakmaty (celkem ${countRakmaty}), ale žádný nevyhovuje podmínkám pro statistiky (thready založené rakmatym se nepočítají, stejně tak thready do kterých byl přidaný první zprávou).`);

		let min = times[0], max = times[0], sum = times[0];

		for (let i = 1; i < times.length; i++) {
			if (times[i] < min) min = times[i];
			if (times[i] > max) max = times[i];
			sum = sum + times[i];
		}

		const avg = sum / times.length;

		times = [...times].sort((a, b) => a - b);
		const halfpoint = Math.floor(times.length / 2);

		const median = (times.length % 2 ? times[halfpoint] : (times[halfpoint - 1] + times[halfpoint]) / 2);

		await interaction.editReply(`✅ prošel jsem všechny thready do kterých mám přístup (celkem ${countAll}) a je v nich rakmaty (celkem ${countRakmaty}), tady jsou jeho statistiky připojení (thready založené rakmatym se nepočítají, stejně tak thready do kterých byl přidaný první zprávou):\n\nmin: ${secondsToString(min)}\nmax: ${secondsToString(max)}\n\nprůměr: ${secondsToString(Math.round(avg))}\nmedián: ${secondsToString(median)}`);
	},
};