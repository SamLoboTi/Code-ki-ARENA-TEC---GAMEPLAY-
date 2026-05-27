# Code Ki ARENA TEC - Gameplay

Jogo web em React + Vite com arena 3D, personagens, desafios de programacao e trilhas de estudo.

## Como rodar

```bash
npm install
npm run dev
```

## Build de producao

```bash
npm run build
npm run preview
```

## Cadastro de pre-acesso com email real

Para enviar solicitacoes reais por email sem expor chaves no frontend, use o servidor Node:

```bash
npm run build
npm run serve:app
```

Configure `RESEND_API_KEY`, `ACCESS_EMAIL_FROM` e `ACCESS_EMAIL_TO`. Veja [docs/access-email.md](docs/access-email.md).

## Estrutura

- `src/`: codigo da interface e logica do jogo.
- `public/characters/`: imagens e sprites dos personagens.
- `perguntas_programacao_4000.csv`: perguntas do quiz.
- `desafios_programacao_16000.csv`: desafios de digitacao/codigo.
- `docs/`: demonstracoes, roteiro e material de apoio.
