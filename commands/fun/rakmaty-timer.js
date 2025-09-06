import { SlashCommandBuilder, ChatInputCommandInteraction, ChannelType, MessageFlags } from 'discord.js';
import { sep } from 'path';
import { secondsToString } from '../../global.js';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: false,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('zjisti jak dlouho trvalo rakmatymu se připojit do tohoto threadu'),

	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();

		if (!interaction.channel) throw new Error('peepo: do tohoto kanálu nemám přístup');
		if (interaction.channel.type != ChannelType.PublicThread && interaction.channel.type != ChannelType.PrivateThread) throw new Error('peepo: kanál není thread');

		const rakmaty1 = await interaction.channel.members.fetch(process.env.RAKMATY_ID).catch(() => {
			throw new Error('peepo: rakmaty1 není v tomto threadu');
		});

		const dateBits = Number(BigInt.asUintN(64, interaction.channel.id) >> 22n);

		await interaction.editReply('✅ rakmaty se připojil ' + secondsToString(Math.floor((rakmaty1.joinedTimestamp - (dateBits + 1420070400000)) / 1000)) + ' po založení threadu');
	},
};