import axios from 'axios';
import { env } from '../config/env.js';

export async function getPlatformToken() {
  if (!env.plchatTokenUrl) {
    throw new Error('PLCHAT_TOKEN_URL não configurada');
  }

  const response = await axios.get(env.plchatTokenUrl);

  if (!response.data || !response.data.token) {
    throw new Error('Token da plataforma não retornado');
  }

  return response.data.token;
}

export async function getConversationByProtocol(protocol, token) {
  if (!env.plchatHistoryUrl) {
    throw new Error('PLCHAT_HISTORY_URL não configurada');
  }

  const response = await axios.post(
    env.plchatHistoryUrl,
    { protocol_id: protocol },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!response.data) {
    throw new Error('Resposta vazia da plataforma ao buscar conversa');
  }

  return response.data;
}
