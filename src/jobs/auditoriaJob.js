import { processAudit } from '../services/auditoriaService.js';

const DELAY_MS = 420000;

export function scheduleAudit(protocol, originalWebhookPayload) {
  console.log(`[JOB] Agendando processamento do protocolo ${protocol} para daqui ${DELAY_MS / 60000} minutos.`);

  setTimeout(async () => {
    try {
      await processAudit(protocol, originalWebhookPayload);
    } catch (error) {
      console.error(`[JOB] Erro no processamento do protocolo ${protocol}:`, error.message);
    }
  }, DELAY_MS);
}
