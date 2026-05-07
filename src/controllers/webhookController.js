import { scheduleAudit } from '../jobs/auditoriaJob.js';

export async function handleFinalizado(req, res) {
  try {
    const protocol = req.body?.data?.protocol;

    if (!protocol) {
      return res.status(400).json({
        success: false,
        message: 'Protocolo não encontrado no payload.',
      });
    }

    console.log(`[WEBHOOK] Recebido protocolo: ${protocol}`);

    scheduleAudit(protocol, req.body);

    return res.status(200).json({
      success: true,
      message: 'Webhook recebido. Processamento agendado.',
      protocol,
    });
  } catch (error) {
    console.error('[WEBHOOK] Erro ao processar webhook:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Erro interno ao processar webhook.',
    });
  }
}
