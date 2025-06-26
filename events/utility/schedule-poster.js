import { Events } from 'discord.js';
import { Schedule } from '../../db-objects.js';

export default {
	event: Events.ClientReady,
	once: true,
	async execute() {},
};