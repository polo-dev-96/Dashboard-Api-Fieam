import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { processAudit } from '../src/services/auditoriaService.js';

const CSV_PATH = path.resolve(process.cwd(), 'data', 'protocolos.csv');
const CHECKPOINT_PATH = path.resolve(process.cwd(), 'data', 'checkpoint.json');

// CONFIGURAVEL: delay entre cada protocolo (ms). Aumente se tomar rate limit.
const DELAY_MS = 1000;

// CONFIGURAVEL: nome da coluna no CSV que contem o protocolo
const COLUNA_PROTOCOLO = 'protocolo';

function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_PATH)) {
    const cp = JSON.parse(fs.readFileSync(CHECKPOINT_PATH, 'utf8'));
    if (!cp.notFound) cp.notFound = [];
    return cp;
  }
  return { processed: [], failed: [], notFound: [], lastProcessedIndex: -1 };
}

function saveCheckpoint(cp) {
  fs.writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2));
}

async function run() {
  if (!fs.existsSync(CSV_PATH)) {
    console.error(`[BATCH] CSV nao encontrado: ${CSV_PATH}`);
    console.error('[BATCH] Coloque o arquivo em data/protocolos.csv e rode novamente.');
    process.exit(1);
  }

  const checkpoint = loadCheckpoint();
  const processedSet = new Set(checkpoint.processed);
  const failedMap = new Map(checkpoint.failed.map(f => [f.protocol, f]));
  const notFoundSet = new Set(checkpoint.notFound);

  console.log(`[BATCH] Iniciando batch. Ja processados: ${checkpoint.processed.length}. Falhas anteriores: ${checkpoint.failed.length}. Nao encontrados (404): ${checkpoint.notFound.length}. Ultimo indice: ${checkpoint.lastProcessedIndex}`);
  console.log(`[BATCH] Delay entre protocolos: ${DELAY_MS}ms`);

  let index = -1;
  let successCount = 0;
  let skipCount = 0;
  let failCount = 0;
  let retrySuccessCount = 0;
  let retryFailCount = 0;
  let notFoundCount = 0;

  const stream = fs.createReadStream(CSV_PATH).pipe(csv());

  for await (const row of stream) {
    index++;

    const protocol = row[COLUNA_PROTOCOLO]?.trim();
    if (!protocol) {
      console.log(`[BATCH] Linha ${index} sem protocolo, pulando.`);
      if (index > checkpoint.lastProcessedIndex) {
        checkpoint.lastProcessedIndex = index;
        saveCheckpoint(checkpoint);
      }
      continue;
    }

    // Se ja foi marcado como nao encontrado (404), pula
    if (notFoundSet.has(protocol)) {
      if (index > checkpoint.lastProcessedIndex) {
        console.log(`[BATCH] [${index}] Protocolo ${protocol} nao encontrado anteriormente (404), pulando.`);
        skipCount++;
        checkpoint.lastProcessedIndex = index;
        saveCheckpoint(checkpoint);
      }
      continue;
    }

    // Se ja foi processado com sucesso, pula
    if (processedSet.has(protocol)) {
      // So atualiza o indice se estiver avancando o cursor
      if (index > checkpoint.lastProcessedIndex) {
        console.log(`[BATCH] [${index}] Protocolo ${protocol} ja processado, pulando.`);
        skipCount++;
        checkpoint.lastProcessedIndex = index;
        saveCheckpoint(checkpoint);
      }
      continue;
    }

    // Se falhou antes, tenta de novo (retry)
    const wasFailed = failedMap.has(protocol);
    if (wasFailed) {
      console.log(`[BATCH] [${index}] Protocolo ${protocol} falhou anteriormente. Retentando...`);
    } else {
      console.log(`[BATCH] [${index}] Processando protocolo: ${protocol}`);
    }

    try {
      await processAudit(protocol, null);

      checkpoint.processed.push(protocol);
      processedSet.add(protocol);
      successCount++;

      // Se era retry, remove da lista de falhas
      if (wasFailed) {
        checkpoint.failed = checkpoint.failed.filter(f => f.protocol !== protocol);
        failedMap.delete(protocol);
        retrySuccessCount++;
        console.log(`[BATCH] [${index}] Retry BEM-SUCEDIDO para ${protocol}`);
      }
    } catch (error) {
      const is404 = error.response?.status === 404 || error.message?.includes('404');

      if (is404) {
        console.log(`[BATCH] [${index}] Protocolo ${protocol} nao encontrado (404). Marcando como nao encontrado.`);
        if (wasFailed) {
          checkpoint.failed = checkpoint.failed.filter(f => f.protocol !== protocol);
          failedMap.delete(protocol);
        }
        checkpoint.notFound.push(protocol);
        notFoundSet.add(protocol);
        notFoundCount++;
      } else {
        console.error(`[BATCH] [${index}] ERRO no protocolo ${protocol}:`, error.message);

        // Se era retry, remove a falha antiga antes de adicionar a nova
        if (wasFailed) {
          checkpoint.failed = checkpoint.failed.filter(f => f.protocol !== protocol);
          failedMap.delete(protocol);
          retryFailCount++;
        }

        checkpoint.failed.push({ protocol, index, error: error.message, date: new Date().toISOString() });
        failedMap.set(protocol, { protocol, index, error: error.message, date: new Date().toISOString() });
        failCount++;
      }
    }

    // Atualiza o indice apenas se estiver avancando o cursor
    if (index > checkpoint.lastProcessedIndex) {
      checkpoint.lastProcessedIndex = index;
    }
    saveCheckpoint(checkpoint);

    // Throttle para respeitar rate limits da PLCHAT e OpenAI
    await new Promise(resolve => setTimeout(resolve, DELAY_MS));
  }

  console.log(`[BATCH] Finalizado. Sucessos: ${successCount}, Pulados: ${skipCount}, Falhas: ${failCount}, Nao encontrados (404): ${notFoundCount}`);
  console.log(`[BATCH] Retries bem-sucedidos: ${retrySuccessCount}, Retries que falharam de novo: ${retryFailCount}`);
  console.log(`[BATCH] Total de protocolos no CSV: ${index + 1}`);
  console.log(`[BATCH] Checkpoint salvo em: ${CHECKPOINT_PATH}`);
}

run().catch(err => {
  console.error('[BATCH] Erro fatal no batch:', err);
  process.exit(1);
});
