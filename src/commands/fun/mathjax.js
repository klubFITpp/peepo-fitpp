import { SlashCommandBuilder, ChatInputCommandInteraction, AttachmentBuilder } from 'discord.js';
import { sep } from 'path';
import MathJax from 'mathjax';
import sharp from 'sharp';

const commandName = import.meta.url.split(sep).pop().slice(0, import.meta.url.split(sep).pop().length - 3);

export default {
	guild: false,
	cooldown: 30,
	data: new SlashCommandBuilder()
		.setName(commandName)
		.setDescription('Render LaTeX with MathJax.')
		.addStringOption(option => option
			.setName('latex')
			.setDescription('Input string')
			.setMinLength(1)
			.setMaxLength(2000)
			.setRequired(true)
		),

	/**
	 * Execute the command
	 *
	 * @param {ChatInputCommandInteraction} interaction
	 */
	async execute(interaction) {
		await interaction.deferReply();

		const tex = interaction.options.getString('latex');

		await MathJax.init({
			loader: {
				load: ['input/tex', 'output/svg']
			},
		});

		MathJax.startup.output.clearFontCache();

		try {
			const adaptor = MathJax.startup.adaptor;
			const result = await MathJax.tex2svgPromise(tex);

			const svg = adaptor.tags(result, 'svg')[0];
			const defs = adaptor.tags(svg, 'defs')[0] || adaptor.append(svg, adaptor.create('defs'));

			adaptor.append(defs, adaptor.node('style', {}, [adaptor.text([
				'svg a{fill:blue;stroke:blue}',
				'[data-mml-node="merror"]>g{fill:red;stroke:red}',
				'[data-mml-node="merror"]>rect[data-background]{fill:yellow;stroke:none}',
				'[data-frame],[data-line]{stroke-width:70px;fill:none}',
				'.mjx-dashed{stroke-dasharray:140}',
				'.mjx-dotted{stroke-linecap:round;stroke-dasharray:0,140}',
				'use[data-c]{stroke-width:3px}'
			].join(''))], 'http://www.w3.org/2000/svg'));

			adaptor.removeAttribute(svg, 'role');
			adaptor.removeAttribute(svg, 'focusable');
			adaptor.removeAttribute(svg, 'aria-hidden');

			const g = adaptor.tags(svg, 'g')[0];

			adaptor.setAttribute(g, 'stroke', 'white');
			adaptor.setAttribute(g, 'fill', 'white');

			const svgFormatted = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + '\n' + adaptor.serializeXML(svg);
			
			await sharp(Buffer.from(svgFormatted), { density: 300 })
				.flatten({ background: '#36393F' })
				.extend({
					top: 20,
					bottom: 20,
					left: 20,
					right: 20,
					background: '#36393F', 
				})
				.png()
				.toFile('./downloads/out.png');
		} catch {
			throw new Error('peepo: Couldn\'t render image, check your syntax and if it is correct, contact the bot operators.')
		}

		const image = new AttachmentBuilder('./downloads/out.png');

		await interaction.editReply({
			files: [image],
		});
	},
};