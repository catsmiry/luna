import { Client, GatewayIntentBits, REST, Routes, CommandInteraction, ApplicationCommandData, ApplicationCommandOptionData, SharedSlashCommandOptions } from 'discord.js';
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { 
    SlashCommandBuilder, 
    SlashCommandStringOption, 
    SlashCommandChannelOption 
  } from 'discord.js';
import { connectToDatabase } from './app/pgsql';
import { LockedMessages } from './app/message-lock';

// 環境変数の読み込み
dotenv.config();

// ログ出力関数
const log = (level: 'INFO' | 'WARN' | 'ERROR', message: string) => {
  console.log(`[${level}] ${message}`);
};

// Discordクライアントの作成
const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
      GatewayIntentBits.GuildPresences,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMessageTyping,
      GatewayIntentBits.GuildEmojisAndStickers,
      GatewayIntentBits.GuildIntegrations,
      GatewayIntentBits.GuildWebhooks,
      GatewayIntentBits.GuildInvites,
      GatewayIntentBits.GuildScheduledEvents,
      GatewayIntentBits.GuildBans,
      GatewayIntentBits.GuildMessageReactions,
    ],
  });

// コマンドの型を定義
interface Command {
  name: string;
  description: string; // descriptionプロパティを追加
  options?: (SlashCommandStringOption | SlashCommandChannelOption)[];
  execute: (interaction: CommandInteraction) => Promise<void>;
}

// コマンドの読み込み
const loadCommands = async (): Promise<Command[]> => {
  const commands: Command[] = [];
  const commandsPath = path.join(__dirname, 'commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

  for (const file of commandFiles) {
    const command = await import(`./commands/${file}`);
    commands.push({ name: command.data.name, description: command.data.description, options: command.data.options, execute: command.execute });
  }

  return commands;
};

// スラッシュコマンドの登録
const registerCommands = async (commands: Command[]) => {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);

  try {
    log('INFO', 'Started refreshing application (/) commands.');

    // コマンドをJSON形式に変換
    const commandData: ApplicationCommandData[] = commands.map(cmd => ({
      name: cmd.name,
      description: cmd.description, // descriptionを正しく設定
      options: cmd.options,
    }));

    // 新しいコマンドを登録
    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commandData });

    log('INFO', 'Successfully reloaded application (/) commands.');
  } catch (error) {
    log('ERROR', `Error while registering commands: ${error}`);
  }
};

// ボットが準備完了したときの処理
client.once('ready', async () => {
  log('INFO', `Logged in as ${client.user?.tag}`);

  // 固定メッセージの設定を適用
  await LockedMessages(client);
});

// コマンドをグローバルに定義
let commands: Command[] = [];

// インタラクションの処理
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const command = commands.find(cmd => cmd.name === interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    log('ERROR', `Error executing command ${interaction.commandName}: ${error}`);
    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
  }
});

// ボットの起動
const startBot = async () => {
  const token = process.env.DISCORD_TOKEN;
  if (!token) {
    log('ERROR', 'Please set your DISCORD_TOKEN environment variable.');
    process.exit(1);
  }

  commands = await loadCommands();
  await registerCommands(commands);
  await client.login(token);
};

// ボットの起動を実行
startBot().catch(error => log('ERROR', `Failed to start bot: ${error}`));