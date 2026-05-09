import mysql from 'mysql2/promise';
import { env } from './env.js';

let pool;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: env.mysqlHost,
      port: env.mysqlPort,
      user: env.mysqlUser,
      password: env.mysqlPassword,
      database: env.mysqlDatabase,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function protocolExistsBaseSenai(protocol) {
  const connection = await getPool().getConnection();

  try {
    const sql = `
      SELECT 1
      FROM \`${env.mysqlTable}\`
      WHERE \`protocolo\` = ?
      LIMIT 1;
    `;

    const [rows] = await connection.execute(sql, [protocol]);
    return rows.length > 0;
  } finally {
    connection.release();
  }
}

export async function upsertBaseSenai(data) {
  const connection = await getPool().getConnection();
  try {
    const sql = `
      INSERT INTO \`${env.mysqlTable}\` (
        \`contato\`,
        \`identificador\`,
        \`protocolo\`,
        \`canal\`,
        \`data e hora de inicio\`,
        \`data e hora de fim\`,
        \`tipo de canal\`,
        \`resumo da conversa\`,
        \`casa\`,
        \`opcao\`,
        \`opcaoselecionada\`,
        \`patrocinados\`,
        \`variaveis\`
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        \`contato\` = VALUES(\`contato\`),
        \`identificador\` = VALUES(\`identificador\`),
        \`canal\` = VALUES(\`canal\`),
        \`data e hora de inicio\` = VALUES(\`data e hora de inicio\`),
        \`data e hora de fim\` = VALUES(\`data e hora de fim\`),
        \`tipo de canal\` = VALUES(\`tipo de canal\`),
        \`resumo da conversa\` = VALUES(\`resumo da conversa\`),
        \`casa\` = VALUES(\`casa\`),
        \`opcao\` = VALUES(\`opcao\`),
        \`opcaoselecionada\` = VALUES(\`opcaoselecionada\`),
        \`patrocinados\` = VALUES(\`patrocinados\`),
        \`variaveis\` = VALUES(\`variaveis\`);
    `;

    const values = [
      data.contato,
      data.identificador,
      data.protocolo,
      data.canal,
      data.dataInicio,
      data.dataFim,
      data.tipoCanal,
      data.resumo,
      data.casa,
      data.opcao,
      data.opcaoselecionada,
      data.patrocinados,
      data.variaveis,
    ];

    const [result] = await connection.execute(sql, values);
    return result;
  } finally {
    connection.release();
  }
}
