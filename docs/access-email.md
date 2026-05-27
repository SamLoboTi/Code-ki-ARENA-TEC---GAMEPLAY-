# Cadastro de pre-acesso e envio de email

O projeto usa um endpoint proprio em Node para enviar emails reais sem expor chave secreta no frontend.

## Variaveis de ambiente

Copie `.env.example` para `.env` ou configure as variaveis no ambiente onde o servidor roda:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxx
ACCESS_EMAIL_FROM="Code Ki Arena <noreply@seudominio.com>"
ACCESS_EMAIL_TO=samanthaocireulobo93@gmail.com
PUBLIC_APP_URL=http://localhost:5292
PORT=5292
```

Voce tambem pode gerar o `.env` local com:

```bash
npm run configure:email
```

Nunca envie o arquivo `.env` para o GitHub.

## Configuracao do Resend

1. Crie uma conta em https://resend.com.
2. Crie uma API key e configure `RESEND_API_KEY`.
3. Configure `ACCESS_EMAIL_FROM` com um remetente verificado.
4. Em producao, verifique o dominio do remetente no Resend.

Observacao: contas novas podem ter restricoes de envio ate confirmar dominio/remetente. Se isso ocorrer, o servidor responde erro com detalhes no console.

## Como rodar com backend

```bash
npm install
npm run build
npm run serve:app
```

O app fica em `http://localhost:5292` e o endpoint em `/api/access-request`.

## Teste de envio real

Com o servidor rodando e as variaveis configuradas:

```bash
npm run test:access-email
```

Para enviar o teste a outro email:

```bash
ACCESS_TEST_EMAIL=usuario@email.com npm run test:access-email
```

No Windows PowerShell:

```powershell
$env:ACCESS_TEST_EMAIL="usuario@email.com"; npm run test:access-email
```

## Logs e diagnostico

O servidor mostra no console:

- `MISSING_RESEND_API_KEY`: falta configurar a chave.
- `MISSING_ACCESS_EMAIL_FROM`: falta configurar remetente verificado.
- `RESEND_API_ERROR`: a API do Resend recusou o envio.
- `429`: reenvio bloqueado por rate limit simples.

As solicitacoes recebidas sao registradas localmente em `data/access-requests.jsonl`.
