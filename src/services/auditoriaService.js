import { upsertBaseSenai } from '../config/database.js';
import { getPlatformToken, getConversationByProtocol } from './plchatService.js';
import { summarizeConversation } from './openaiService.js';
import { formatConversationData, parseAIResponse } from '../utils/formatters.js';

export async function processAudit(protocol, originalWebhookPayload) {
  console.log(`[AUDITORIA] Iniciando processamento para protocolo: ${protocol}`);

  const token = await getPlatformToken();
  console.log(`[AUDITORIA] Token obtido para protocolo: ${protocol}`);

  const conversation = await getConversationByProtocol(protocol, token);
  console.log(`[AUDITORIA] Conversa obtida para protocolo: ${protocol}`);

  const enrichedConversation = formatConversationData(conversation);
  console.log(`[AUDITORIA] Conversa formatada para protocolo: ${protocol}`);

  const aiRawResponse = await summarizeConversation(enrichedConversation);
  console.log(`[AUDITORIA] Resumo da IA obtido para protocolo: ${protocol}`);

  const parsedAI = parseAIResponse(aiRawResponse);

  const finalData = {
    contato: parsedAI.Contato || "false",
    identificador: conversation?.contact?.number || "false",
    protocolo: protocol,
    canal: parsedAI.Canal || "false",
    dataInicio: parsedAI["Data Inicio"] || "false",
    dataFim: parsedAI["Data Fim"] || "false",
    tipoCanal: parsedAI["Tipo Canal"] || "false",
    resumo: parsedAI.Resumo || "false",
    casa: parsedAI.Casa || "false",
    opcao: enrichedConversation.selectedOption || "false",
    opcaoselecionada: enrichedConversation.selectedOptionLabel || "false",
    patrocinados: enrichedConversation.firstClientMessage || "false",
    variaveis: enrichedConversation.variaveis || "false",
  };

  await upsertBaseSenai(finalData);
  console.log(`[AUDITORIA] Dados gravados no banco para protocolo: ${protocol}`);

  return finalData;
}
