import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';
import { sep } from 'path';
import { secondsToString } from '../../utils/helpers.js';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: true,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Zjisti jak dlouho průměrně, nejdéle a nejkrátš trvalo rakmatymu se připojit do vlákna.')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.reply('⏩ Začal jsem hledat...');

		const guilds = await interaction.client.guilds.fetch();

		let times = [];

		const channels = (await Promise.all(guilds.map(async (guildPartial) => {
			const guild = await guildPartial.fetch();
			return await guild.channels.fetch();
		}))).flatMap(map => Array.from(map.values()));

		const threads = (await Promise.all(channels.map(async (channel) => {
			if (!channel.threads) return null

			const promises = [
				channel.threads.fetchActive(),
				channel.threads.fetchArchived({
					type: 'public',
					fetchAll: true,
				}),
				channel.threads.fetchArchived({
					type: 'private',
					fetchAll: true,
				}),
			];

			return (await Promise.allSettled(promises))
				.filter(res => res.status === 'fulfilled').flatMap(res => res.value);
		}))).filter(Boolean).flat().flatMap(res => Array.from(res.threads.values()))

		const countAll = threads.length;
		const countRakmaty = (await Promise.all(threads.map(async (thread) => {
			let rakmaty
			try {
				rakmaty = await thread.members.fetch(process.env.RAKMATY_ID);
			} catch(e) {
				return false;
			}

				const seconds = Math.floor((rakmaty.joinedTimestamp - (Number(BigInt.asUintN(64, thread.id) >> 22n) + 1420070400000)) / 1000);

				if (thread.ownerId != process.env.RAKMATY_ID && seconds > 1) times.push(seconds);

				return true;
		}))).filter(Boolean).length;

		if (countRakmaty === 0) throw new Error(`peepo: V žádném z vláken do kterých mám přístup (celkem ${countAll}) není rakmaty.`);
		if (times.length === 0) throw new Error(`peepo: Prošel jsem všechny thready do kterých mám přístup (celkem ${countAll}) a je v nich rakmaty (celkem ${countRakmaty}), ale žádný nevyhovuje podmínkám pro statistiky (vlákna založená rakmatym se nepočítají, stejně tak vlákna do kterých byl přidaný první zprávou).`);

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

		await interaction.editReply(`✅ Prošel jsem všechny vlákna do kterých mám přístup (celkem ${countAll}) a je v nich rakmaty (celkem ${countRakmaty}), tady jsou jeho statistiky připojení (vlákna založená rakmatym se nepočítají, stejně tak vlákna do kterých byl přidaný první zprávou):\n\nMin: ${secondsToString(min)}\nMax: ${secondsToString(max)}\n\nPrůměr: ${secondsToString(Math.round(avg))}\nMedián: ${secondsToString(median)}`);
	},
};
