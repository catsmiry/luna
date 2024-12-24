import { executeQuery } from '../app/pgsql';
import { Client, TextChannel, Events } from 'discord.js';

const setupLockedMessages = async (client: Client) => {
  const guilds = client.guilds.cache;

  for (const guild of guilds.values()) {
    const query = `
      SELECT channel_id, message_content
      FROM lock_settings
      WHERE guild_id = $1;
    `;
    const params = [guild.id];
    const settings: { channel_id: string; message_content: string }[] = await executeQuery(query, params);

    settings.forEach(async (setting) => {
      const channel = await client.channels.fetch(setting.channel_id);
      if (channel && channel instanceof TextChannel) {
        const embed = {
          color: 0x0099ff,
          title: 'Locked Message',
          description: setting.message_content,
          footer: {
            text: `This message is locked.`,
          },
          timestamp: new Date().toISOString(),
        };

        // 既存のボットのメッセージを削除して新しいメッセージを送信
        const messages = await channel.messages.fetch({ limit: 10 }); // 最新のメッセージを取得
        const botMessages = messages.filter(msg => msg.author.id === client.user?.id); // ボットのメッセージをフィルタリング

        // ボットのメッセージがあれば削除
        if (botMessages.size > 0) {
          const lastBotMessage = botMessages.first();
          if (lastBotMessage) {
            await lastBotMessage.delete();
          }
        }

        // 新しいボットのメッセージを送信
        await channel.send({ embeds: [embed] });
      }
    });
  }

  // 新しいメッセージが送信されたときにロックされたメッセージを適用
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return; // ボットのメッセージは無視

    // message.guildがnullでないことを確認
    if (!message.guild) return; // DMチャンネルの場合は処理を中止

    const query = `
      SELECT channel_id, message_content
      FROM lock_settings
      WHERE guild_id = $1;
    `;
    const params = [message.guild.id];
    const settings: { channel_id: string; message_content: string }[] = await executeQuery(query, params);

    settings.forEach(async (setting) => {
      if (message.channel.id === setting.channel_id) {
        const embed = {
          color: 0x0099ff,
          title: 'Locked Message',
          description: setting.message_content,
          footer: {
            text: `This message is locked.`,
          },
          timestamp: new Date().toISOString(),
        };

        // 既存のボットのメッセージを削除して新しいメッセージを送信
        const messages = await message.channel.messages.fetch({ limit: 10 }); // 最新のメッセージを取得
        const botMessages = messages.filter(msg => msg.author.id === client.user?.id); // ボットのメッセージをフィルタリング

        // ボットのメッセージがあれば削除
        if (botMessages.size > 0) {
          const lastBotMessage = botMessages.first();
          if (lastBotMessage) {
            await lastBotMessage.delete();
          }
        }

        // 新しいボットのメッセージを送信
        await message.channel.send({ embeds: [embed] });
      }
    });
  });
};

// モジュールのエクスポート
export { setupLockedMessages as LockedMessages };