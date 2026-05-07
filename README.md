# Auditoria API

API Node.js para substituir o fluxo de auditoria de conversas do n8n.

## Instalação

```bash
npm install
```

## Configuração

Copie o arquivo `.env.example` para `.env` e preencha as variáveis:

```bash
cp .env.example .env
```

Variáveis necessárias:

- `PORT` — porta da API (padrão: 3000)
- `OPENAI_API_KEY` — chave da API da OpenAI
- `OPENAI_MODEL` — modelo da OpenAI (padrão: gpt-5-mini)
- `PLCHAT_TOKEN_URL` — URL para obter o token da plataforma externa
- `PLCHAT_HISTORY_URL` — URL para buscar histórico da conversa
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` — dados do banco MySQL

## Rodar localmente

Modo desenvolvimento (com nodemon):

```bash
npm run dev
```

Modo produção:

```bash
npm start
```

## Exemplo de chamada webhook

```bash
curl -X POST http://localhost:3000/webhook/finalizado \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "protocol": "2026041400391",
      "session_id": "...",
      "name": "...",
      "platform": "WhatsappBusiness"
    },
    "vars": [],
    "webhook": {}
  }'
```

Resposta esperada:

```json
{
  "success": true,
  "message": "Webhook recebido. Processamento agendado.",
  "protocol": "2026041400391"
}
```

## Criar a tabela MySQL

```sql
CREATE TABLE IF NOT EXISTS `base senai` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `contato` VARCHAR(255) DEFAULT NULL,
  `identificador` VARCHAR(255) DEFAULT NULL,
  `protocolo` VARCHAR(255) NOT NULL,
  `canal` VARCHAR(255) DEFAULT NULL,
  `data e hora de inicio` VARCHAR(255) DEFAULT NULL,
  `data e hora de fim` VARCHAR(255) DEFAULT NULL,
  `tipo de canal` VARCHAR(255) DEFAULT NULL,
  `resumo da conversa` VARCHAR(255) DEFAULT NULL,
  `casa` VARCHAR(255) DEFAULT NULL,
  `opcao` VARCHAR(255) DEFAULT NULL,
  `opcaoselecionada` VARCHAR(255) DEFAULT NULL,
  `patrocinados` VARCHAR(255) DEFAULT NULL,
  `variaveis` VARCHAR(255) DEFAULT NULL,
  UNIQUE KEY `protocolo` (`protocolo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Estrutura do projeto

- `src/prompts/auditoriaPrompt.js` — prompt enviado ao agente de IA.
- `src/config/env.js` — carrega variáveis de ambiente com `dotenv`.
- `src/config/database.js` — conexão MySQL e função de upsert.
- `src/services/plchatService.js` — comunicação com a plataforma externa.
- `src/services/openaiService.js` — comunicação com a OpenAI.
- `src/services/auditoriaService.js` — orquestra o fluxo completo.
- `src/jobs/auditoriaJob.js` — agendamento do processamento (60 minutos).
- `src/utils/formatters.js` — formatação da conversa e da resposta da IA.
- `src/controllers/webhookController.js` — recebe o webhook.
- `src/routes.js` — rotas da API.
- `src/server.js` — ponto de entrada.

## Onde fica o prompt da IA

O prompt está em `src/prompts/auditoriaPrompt.js`.

## Onde fica o token da OpenAI

A chave da API da OpenAI deve ser configurada na variável de ambiente `OPENAI_API_KEY` no arquivo `.env`. Nunca commitar o `.env`.

## Fluxo completo

1. A API recebe um POST em `/webhook/finalizado`.
2. Valida se existe `body.data.protocol`.
3. Responde rapidamente com sucesso.
4. Agenda o processamento para daqui 60 minutos via `setTimeout`.
5. Ao executar, busca o token na plataforma externa.
6. Usa o token para buscar o histórico da conversa pelo protocolo.
7. Aplica formatação inicial (menu, opções, primeira mensagem, variáveis).
8. Envia a conversa para a OpenAI com o prompt definido.
9. Formata a resposta textual da IA em objeto estruturado.
10. Monta o objeto final e faz upsert na tabela `base senai` do MySQL usando o protocolo como chave.

## Observações

- O job usa `setTimeout` para simplificar o ambiente atual.
- A estrutura está preparada para substituir o `setTimeout` por uma fila como BullMQ ou Redis no futuro.
- A API não derruba se um processamento falhar; o erro é logado no console.
