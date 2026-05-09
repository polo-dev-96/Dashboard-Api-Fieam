# Guia de Deploy para Iniciantes

Este guia foi feito pensando em quem nunca colocou uma API no ar. Vamos passo a passo, sem pular etapas.

---

## O que a gente vai fazer?

1. Instalar os programas necessários no servidor
2. Baixar o código do GitHub
3. Configurar as variáveis de ambiente (`.env`)
4. Deixar a API rodando "para sempre" com o PM2
5. Instalar o Caddy para criar um link bonito com HTTPS
6. Apontar o webhook do PL Chat para a nossa API

---

## 1. Acessar o servidor pela primeira vez

No seu computador, abra o **Terminal** (Mac/Linux) ou o **PowerShell** (Windows).

Rode este comando, trocando `189.12.34.56` pelo IP do seu servidor:

```bash
ssh root@189.12.34.56
```

Ele vai pedir a senha. Digite a senha que você recebeu (ao digitar, não aparece nada na tela — é normal!).

Pronto, agora você está dentro do servidor.

---

## 2. Instalar os programas no servidor

Ainda dentro do servidor (via SSH), rode os comandos abaixo **um por um**:

### 2.1 Atualizar o sistema

```bash
apt update && apt upgrade -y
```

### 2.2 Instalar o Node.js (versão 20)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
```

Verifique se instalou certinho:

```bash
node -v   # deve mostrar v20.x.x
npm -v    # deve mostrar 10.x.x
```

### 2.3 Instalar o PM2 (deixa a API rodando sempre)

```bash
npm install -g pm2
```

### 2.4 Instalar o Caddy (servidor web que cria HTTPS automaticamente)

```bash
apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt update
apt install caddy
```

### 2.5 Instalar o Git (para baixar o código)

```bash
apt install -y git
```

---

## 3. Baixar o projeto do GitHub

Ainda dentro do servidor, crie uma pasta e entre nela:

```bash
mkdir -p /var/www
cd /var/www
```

Agora baixe o projeto. Substitua a URL abaixo pela URL do **seu** repositório no GitHub:

```bash
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git auditoria-api
```

Entre na pasta do projeto:

```bash
cd auditoria-api
```

Instale as dependências:

```bash
npm install
```

---

## 4. Configurar o arquivo `.env`

O `.env` é onde ficam as senhas e configurações da API. Ele **nunca** vai para o GitHub por segurança, então você precisa criar ele no servidor.

```bash
cp .env.example .env
nano .env
```

Vai abrir um editor de texto. Ajuste as variáveis:

```env
PORT=3000

OPENAI_API_KEY=sk-sua-chave-aqui
OPENAI_MODEL=gpt-5-mini

PLCHAT_TOKEN_URL=https://api.exemplo.com/api/token
PLCHAT_HISTORY_URL=https://sesi-senai.pl-chat.com/api/v4/attendances/historic/protocol

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=sua-senha-mysql
MYSQL_DATABASE=auditoria
MYSQL_TABLE=base senai
```

> **Importante:**
> - `PORT=3000` — a API vai rodar na porta 3000 **dentro** do servidor. O Caddy se encarrega de redirecionar do "mundo" para cá.
> - Se o MySQL estiver no **mesmo servidor**, use `localhost`. Se estiver em outro lugar, coloque o IP dele.

Para salvar no `nano`:
- Aperte `CTRL + O` (a letra O), depois `Enter`
- Aperte `CTRL + X` para sair

---

## 5. Rodar a API com o PM2

Agora vamos ligar a API e deixar ela rodando "para sempre", mesmo se você fechar o terminal:

```bash
pm2 start src/server.js --name auditoria-api
```

Para garantir que ela liga sozinha se o servidor reiniciar:

```bash
pm2 startup
pm2 save
```

Verifique se está rodando:

```bash
pm2 status
```

Deve aparecer `auditoria-api` com status `online`.

---

## 6. Configurar o Caddy (domínio + HTTPS)

O Caddy faz duas coisas mágicas:
1. Transforma `http://` em `https://` (cadeado verde no navegador)
2. Redireciona tudo que chega na porta 80/443 para a sua API na porta 3000

### 6.1 Comprar ou configurar um domínio

Você precisa de um domínio (ex: `api.seusite.com`). Pode comprar em:
- Registro.br (domínios .com.br)
- GoDaddy
- Namecheap

### 6.2 Apontar o domínio para o servidor

No painel do seu provedor de domínio, crie um registro do tipo **A**:

| Tipo | Nome | Valor |
|------|------|-------|
| A | `api` ou `@` | `189.12.34.56` (IP do seu servidor) |

Isso faz `api.seusite.com` apontar para o seu servidor.

> **Demora um pouco:** a propagação do DNS pode levar de 5 minutos até 24 horas. Se não funcionar de imediato, espere um pouco.

### 6.3 Criar o Caddyfile

No servidor, crie o arquivo de configuração do Caddy:

```bash
nano /etc/caddy/Caddyfile
```

Apague o que tiver lá e cole isso (troque `api.seusite.com` pelo **seu** domínio):

```caddy
dash-api-fieam.ippolo.com.br {
    reverse_proxy localhost:3000
}
```

Salve (`CTRL + O`, `Enter`, `CTRL + X`).

### 6.4 Recarregar o Caddy

```bash
caddy reload --config /etc/caddy/Caddyfile
```

O Caddy vai sozinho buscar o certificado SSL (HTTPS). Você não precisa fazer nada!

### 6.5 Testar

Abra no navegador:

```
https://api.seusite.com/webhook/finalizado
```

Se aparecer algo como `Cannot GET /webhook/finalizado`, está funcionando! (É normal dar erro de GET porque o webhook espera POST.)

---

## 7. Apontar o webhook do PL Chat para a sua API

Agora que sua API está no ar com HTTPS, você precisa contar para o PL Chat onde enviar os eventos.

### Passo a passo dentro do PL Chat

1. Acesse o painel do PL Chat
2. Vá em **Configurações** → **Webhooks** (ou **Integrações** → **Webhook**)
3. Procure a opção de **Webhook de conversa finalizada** (ou similar)
4. No campo **URL**, coloque:

```
https://api.seusite.com/webhook/finalizado
```

5. O método deve ser **POST**
6. Salve e ative

### Testar se o PL Chat está chegando na sua API

Você pode acompanhar os logs da API em tempo real:

```bash
pm2 logs auditoria-api
```

Quando uma conversa finalizar no PL Chat, você deve ver algo como:

```
[WEBHOOK] Recebido protocolo: 2026041400391
```

Aperte `CTRL + C` para sair dos logs.

---

## 8. Comandos úteis do dia a dia

| O que você quer fazer | Comando |
|-----------------------|---------|
| Ver se a API está rodando | `pm2 status` |
| Ver os logs em tempo real | `pm2 logs auditoria-api` |
| Reiniciar a API | `pm2 restart auditoria-api` |
| Parar a API | `pm2 stop auditoria-api` |
| Atualizar o código (após `git pull`) | `pm2 restart auditoria-api` |
| Ver uso de CPU/RAM | `pm2 monit` |

---

## 9. Atualizar o código (quando você fizer alterações no GitHub)

Sempre que você mandar código novo para o GitHub, faça isso no servidor:

```bash
cd /home/polotelecom/document_root/auditoria-api
git pull
npm install
pm2 restart auditoria-api
```

---

## 10. Firewall (segurança extra)

É bom deixar só as portas necessárias abertas:

```bash
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
```

Isso bloqueia a porta 3000 de ser acessada diretamente de fora. Só o Caddy (que está no mesmo servidor) consegue falar com ela.

---

## Checklist final

- [ ] Servidor acessível via SSH
- [ ] Node.js 20 instalado
- [ ] PM2 instalado e API rodando (`pm2 status` mostra online)
- [ ] Domínio apontando para o IP do servidor
- [ ] Caddy instalado e Caddyfile configurado
- [ ] HTTPS funcionando (cadeado verde no navegador)
- [ ] Webhook do PL Chat apontando para `https://SEU_DOMINIO/webhook/finalizado`
- [ ] Teste realizado: uma conversa finalizada chegou na API

---

## Precisa de ajuda?

Se algo der errado, verifique:

1. **A API não liga?** Veja o erro com `pm2 logs auditoria-api`
2. **O site não abre?** Verifique se o domínio já propagou com [dnschecker.org](https://dnschecker.org)
3. **HTTPS não funciona?** Veja os logs do Caddy: `journalctl -u caddy --no-pager -n 50`
4. **O webhook não chega?** Confirme a URL no PL Chat e verifique os logs da API
