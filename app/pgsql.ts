import { Client, QueryResult } from 'pg';
import * as dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

// PostgreSQLクライアントの作成
const client = new Client({
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

// PostgreSQLに接続する関数
const connectToDatabase = async () => {
  try {
    await client.connect();
    console.log('[INFO] Connected to PostgreSQL database successfully.');
  } catch (error) {
    console.error('[ERROR] Failed to connect to PostgreSQL database:', error);
    process.exit(1);
  }
};

// クエリを実行する関数
const executeQuery = async (query: string, params?: any[]): Promise<any[]> => {
  try {
    const res: QueryResult = await client.query(query, params);
    return res.rows; // クエリの結果を返す
  } catch (error) {
    console.error('[ERROR] Query execution failed:', error);
    throw error; // エラーを再スロー
  }
};

// トランザクションを開始する関数
const startTransaction = async () => {
  try {
    await client.query('BEGIN');
    console.log('[INFO] Transaction started.');
  } catch (error) {
    console.error('[ERROR] Failed to start transaction:', error);
    throw error;
  }
};

// トランザクションをコミットする関数
const commitTransaction = async () => {
  try {
    await client.query('COMMIT');
    console.log('[INFO] Transaction committed.');
  } catch (error) {
    console.error('[ERROR] Failed to commit transaction:', error);
    throw error;
  }
};

// トランザクションをロールバックする関数
const rollbackTransaction = async () => {
  try {
    await client.query('ROLLBACK');
    console.log('[INFO] Transaction rolled back.');
  } catch (error) {
    console.error('[ERROR] Failed to rollback transaction:', error);
    throw error;
  }
};

// 接続を終了する関数
const closeConnection = async () => {
  try {
    await client.end();
    console.log('[INFO] PostgreSQL connection closed.');
  } catch (error) {
    console.error('[ERROR] Failed to close PostgreSQL connection:', error);
  }
};

// モジュールのエクスポート
export {
  connectToDatabase,
  executeQuery,
  startTransaction,
  commitTransaction,
  rollbackTransaction,
  closeConnection,
};

// 接続を実行
connectToDatabase();