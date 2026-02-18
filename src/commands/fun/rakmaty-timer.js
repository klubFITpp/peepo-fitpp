import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { sep } from 'path';
import { secondsToString } from '../../utils/helpers.js';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: false,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Zjisti jak dlouho trvalo rakmatymu se připojit do tohoto vlákna.'),

	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();

		const channel = interaction.channel;

		if (!channel) throw new Error('peepo: Do tohoto kanálu nemám přístup.');
		if (channel.type != ChannelType.PublicThread && channel.type != ChannelType.PrivateThread) throw new Error('peepo: Kanál není vlákno.');

		const rakmaty = await channel.members.fetch(process.env.RAKMATY_ID).catch(() => {
			throw new Error('peepo: Rakmaty není v tomto vlákně.');
		});

		const dateBits = Number(BigInt.asUintN(64, channel.id) >> 22n);

		await interaction.editReply('✅ Rakmaty se připojil ' + secondsToString(Math.floor((rakmaty.joinedTimestamp - (dateBits + 1420070400000)) / 1000)) + ' po založení vlákna.');
	},
};