import OpenAI from 'openai';
import { env } from '../config/env.js';
import { auditoriaPrompt } from '../prompts/auditoriaPrompt.js';

const openai = new OpenAI({
  apiKey: env.openaiApiKey,
});

export async function summarizeConversation(conversationData) {
  if (!env.openaiApiKey) {
    throw new Error('OPENAI_API_KEY não configurada');
  }

  const response = await openai.chat.completions.create({
    model: env.openaiModel,
    messages: [
      { role: 'system', content: auditoriaPrompt },
      {
        role: 'user',
        content: `Analise o seguinte histórico de conversa e extraia os dados solicitados:\n\n${JSON.stringify(conversationData, null, 2)}`,
      },
    ],
  });

  const content = response.choices?.[0]?.message?.content;

  if (!content || content.trim().length === 0) {
    throw new Error('Resposta vazia da OpenAI');
  }

  return content;
}
