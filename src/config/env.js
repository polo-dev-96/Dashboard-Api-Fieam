import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: process.env.PORT || 3000,

  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: process.env.OPENAI_MODEL || 'gpt-5-mini',

  plchatTokenUrl: process.env.PLCHAT_TOKEN_URL,
  plchatHistoryUrl: process.env.PLCHAT_HISTORY_URL,

  mysqlHost: process.env.MYSQL_HOST,
  mysqlPort: Number(process.env.MYSQL_PORT) || 3306,
  mysqlUser: process.env.MYSQL_USER,
  mysqlPassword: process.env.MYSQL_PASSWORD,
  mysqlDatabase: process.env.MYSQL_DATABASE,
  mysqlTable: process.env.MYSQL_TABLE || 'base senai clone',
};
