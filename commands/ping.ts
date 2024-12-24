import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';

export const data = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!'); // ここでdescriptionを設定

export const execute = async (interaction: CommandInteraction) => {
  await interaction.reply('Pong!');
};