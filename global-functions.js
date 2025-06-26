async function randomNumber(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function randomLetter() {
	const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

	const randomRandomNumber = await randomNumber(0, 25);

	return alphabet[randomRandomNumber];
}

async function randomWord(letters) {
	let randomRandomWord = '';

	for (let a = 0; a < letters; a++) randomRandomWord += await randomLetter();

	return randomRandomWord;
}

const dst = true;

async function timezone() {
	return dst ? 'CEST' : 'CET';
}

async function relativeTime(input) {
	const date = input || new Date();

	return `<t:${Math.floor(date.getTime() / 1000)}:R>`;
}

async function createBasicDate(input) {
	const date = input || new Date();

	date.setUTCHours(0, 0, 0, 0);

	return date;
}

async function addMinutes(date, minutes) {
	return new Date(date.getTime() + minutes * 60000);
}

async function isAnotherDay(date1, date2) {
	if (date1.getUTCDate() === date2.getUTCDate() && date1.getUTCMonth() === date2.getUTCMonth() && date1.getUTCFullYear() === date2.getUTCFullYear()) return false;
	else return true;
}

const defaultDate = new Date('2021-08-02T00:00:00.000Z');

async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function ghostPing(channel, userId) {
	const message = await channel.send(`<@${userId}>`);
	await message.delete();
}

export { randomNumber, randomLetter, randomWord, createBasicDate, isAnotherDay, sleep, addMinutes, ghostPing, timezone, relativeTime, dst, defaultDate };