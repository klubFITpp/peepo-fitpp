import { AttachmentBuilder, EmbedBuilder } from 'discord.js';
import fetch from 'node-fetch';
import path from 'path';
import fs from 'fs';

export function randomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomLetter() {
	const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

	const randomRandomNumber = randomNumber(0, 25);

	return alphabet[randomRandomNumber];
}

export function randomWord(letters) {
	let randomRandomWord = '';

	for (let a = 0; a < letters; a++) randomRandomWord += randomLetter();

	return randomRandomWord;
}

export const dst = true;

export function timezone() {
	return dst ? 'CEST' : 'CET';
}

export function relativeTime(input) {
	const date = input || new Date();

	return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

export function createBasicDate(input) {
	const date = input || new Date();

	date.setUTCHours(0, 0, 0, 0);

	return date;
}

export function addMinutes(date, minutes) {
	return new Date(date.getTime() + minutes * 60000);
}

export function isAnotherDay(date1, date2) {
	if (date1.getUTCDate() === date2.getUTCDate() && date1.getUTCMonth() === date2.getUTCMonth() && date1.getUTCFullYear() === date2.getUTCFullYear()) return false;
	else return true;
}

export const defaultDate = new Date('2021-08-02T00:00:00.000Z');

export async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function ghostPing(channel, userId) {
	const message = await channel.send(`<@${userId}>`);
	await message.delete();
}

export function parseDateTime(dateTimeStr) {
	const regex = /^([1-9]|0[1-9]|[12]\d|3[01])\.([1-9]|0[1-9]|1[0-2])\.(20\d\d) ([0-9]|[01]\d|2[0-3]):([0-5]\d)/;
	const match = dateTimeStr.match(regex);

	if (!match) throw new Error('peepo: invalid date format, use *dd.mm.yyyy hh:mm*');

	const [str, day, month, year, hours, minutes] = match;

	const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));

	if (date.getFullYear() != year || date.getMonth() != month - 1 || date.getDate() != day) throw new Error('peepo: invalid date');

	return date;
}

export async function downloadFile(url, fileName, fileType) {
	const response = await fetch(url);
	if (!response.ok) throw new Error('peepo: failed to download the file');

	const filePath = path.resolve('./downloads', fileName + '.' + fileType);
	const fileStream = fs.createWriteStream(filePath);

	await new Promise((resolve, reject) => {
		response.body.pipe(fileStream);
		response.body.on('error', reject);
		fileStream.on('finish', resolve);
	});

	return filePath;
}

export const iconUrl = new AttachmentBuilder('./images/embedFooterLogo.png');

export const defaultEmbed = new EmbedBuilder()
	.setColor('#0073BC')
	.setFooter({
		text: 'FIT++',
		iconURL: 'attachment://embedFooterLogo.png',
	})
	.data;

export function dateToString(date) {
	const options = {
		day: '2-digit',
		month: '2-digit',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	};

	return date.toLocaleString('cs', options).replaceAll('. ', '.').replace(',', '');
}

export function errorMessage(message) {
	return `❌ error: ${message}${!randomNumber(0, 2) ? '\n\ntip: did you know you can press ⬆️ "ARROW_UP" on your keyboard to reuse your last command input? (except for attachments)' : ''}`;
}

export function secondsToString(inputSeconds) {
	function needsSpace(value) { return value ? ' ' : ''; }

	let value = '';

	const years = Math.floor(inputSeconds / 31536000);
	if (years) value += needsSpace(value) + years + 'y';

	const days = Math.floor((inputSeconds %= 31536000) / 86400);
	if (days) value += needsSpace(value) + days + 'd';

	const hours = Math.floor((inputSeconds %= 86400) / 3600);
	if (hours) value += needsSpace(value) + hours + 'h';

	const minutes = Math.floor((inputSeconds %= 3600) / 60);
	if (minutes) value += needsSpace(value) + minutes + 'm';

	const seconds = Math.floor(inputSeconds % 60);
	if (seconds) value += needsSpace(value) + seconds + 's';

	return value;
}