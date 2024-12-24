import { SlashCommandBuilder } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import { executeQuery } from '../app/pgsql';

export const data = new SlashCommandBuilder()
  .setName('settings')
  .setDescription('Set the locked message settings for the channel.')
  .addChannelOption(option =>
    option.setName('channel')
      .setDescription('The channel to lock the message in')
      .setRequired(true))
  .addStringOption(option =>
    option.setName('type')
      .setDescription('Type of action (lock or unlock)')
      .addChoices(
        { name: 'Lock', value: 'lock' },
        { name: 'Unlock', value: 'unlock' },
      )
      .setRequired(true))
  .addStringOption(option =>
    option.setName('content')
      .setDescription('The content of the message to lock (optional)')
      .setRequired(false));

export const execute = async (interaction: CommandInteraction) => {
  const channelId = interaction.options.get('channel')?.value;
  const actionType = interaction.options.get('type')?.value;
  const content = interaction.options.get('content')?.value;
  const guildId = interaction.guildId;

  if (actionType === 'lock') {
    if (content) {
      // 固定メッセージを保存
      const query = `
        INSERT INTO lock_settings (guild_id, channel_id, message_content)
        VALUES ($1, $2, $3)
        ON CONFLICT (guild_id, channel_id) DO UPDATE SET
        message_content = EXCLUDED.message_content,
        created_at = CURRENT_TIMESTAMP;
      `;
      const params = [guildId, channelId, content];
      await executeQuery(query, params);

      await interaction.reply({ content: `Locked message set for <#${channelId}>: "${content}"`, ephemeral: true });
    } else {
      // メッセージ内容が空の場合は、固定を解除
      const query = `
        DELETE FROM lock_settings
        WHERE guild_id = $1 AND channel_id = $2;
      `;
      const params = [guildId, channelId];
      await executeQuery(query, params);

      await interaction.reply({ content: `Unlocked message for <#${channelId}>.`, ephemeral: true });
    }
  } else if (actionType === 'unlock') {
    // 固定メッセージを削除
    const query = `
      DELETE FROM lock_settings
      WHERE guild_id = $1 AND channel_id = $2;
    `;
    const params = [guildId, channelId];
    await executeQuery(query, params);

    await interaction.reply({ content: `Unlocked message for <#${channelId}>.`, ephemeral: true });
  }
};