import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  synchronize: false,
  logging: true,
  entities: ['app/entity/**/*.ts'],
  migrations: ['app/migration/**/*.ts'],
});

export default AppDataSource;