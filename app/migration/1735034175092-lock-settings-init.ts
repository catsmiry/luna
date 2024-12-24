import { MigrationInterface, QueryRunner, Table, TableUnique } from 'typeorm';

export class LockSettingsInitMigration1735034175092 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // lock_settingsテーブルの作成
    await queryRunner.createTable(
      new Table({
        name: 'lock_settings',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
          },
          {
            name: 'guild_id',
            type: 'bigint', // guild_idをbigintに変更
          },
          {
            name: 'channel_id',
            type: 'bigint', // channel_idをbigintに変更
          },
          {
            name: 'message_content',
            type: 'text',
            isNullable: true, // メッセージ内容はオプション
          },
          {
            name: 'author_id',
            type: 'bigint', // author_idをbigintに変更
            isNullable: true, // 投稿者IDはオプション
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
    );

    // ユニーク制約の追加
    await queryRunner.createUniqueConstraint('lock_settings', new TableUnique({
      columnNames: ['guild_id', 'channel_id'],
      name: 'UQ_guild_channel' // ユニーク制約の名前
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ユニーク制約の削除
    await queryRunner.dropUniqueConstraint('lock_settings', 'UQ_guild_channel');

    // lock_settingsテーブルの削除
    await queryRunner.dropTable('lock_settings');
  }
}