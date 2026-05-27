# Roadmap de validacao e plataforma do jogo

## Validacao de respostas

- Cada pergunta deve ter uma regra propria de validacao: `exact`, `number`, `code`, `sql`, `concept` ou `ai_review`.
- A normalizacao deve remover acentos, padronizar caixa, comprimir espacos e tratar pontuacao conforme o tipo de resposta.
- Respostas numericas devem exigir igualdade estrita. Exemplo: `10` aceita, `1010` rejeita.
- Respostas de codigo devem comparar uma forma canonica, sem aceitar substring solta.
- SQL deve validar estrutura minima obrigatoria, palavras bloqueadas e clausulas esperadas.
- Fuzzy matching deve ser permitido apenas em perguntas conceituais, com score minimo por pergunta.
- Toda resposta recusada deve gerar log com pergunta, resposta original, resposta normalizada, score, motivo e data.

## Banco de dados sugerido

- `users`: dados principais, email verificado, senha com hash, status e datas.
- `user_profiles`: nickname, avatar, imagem de fundo, idioma, tema, configuracoes.
- `questions`: enunciado, codigo, resposta canonica, tema, dificuldade, status de aprovacao.
- `question_validation_rules`: estrategia, variacoes aceitas, score minimo, tolerancia, regras JSON.
- `game_sessions`: modo de jogo, inicio, fim, pontuacao, acertos, erros.
- `answer_attempts`: tentativa bruta, normalizada, score, resultado, motivo, tempo de resposta.
- `user_progress_daily`: XP diario, streak, desafios concluidos, tempo jogado.
- `achievements`: catalogo de conquistas.
- `user_achievements`: conquistas desbloqueadas por usuario.
- `question_import_batches`: auditoria de importacao de CSV.
- `question_import_reviews`: decisao da analise automatica por linha do CSV.

## XP e progresso

- Iniciar em `XP000`, armazenando XP como inteiro `0`.
- Registrar eventos de XP em tabela propria para auditoria, nao apenas o total no usuario.
- Agregar estatisticas diarias em `user_progress_daily` para dashboard rapido.
- Calcular ranking a partir de snapshots periodicos ou materialized view.
- Evitar confiar no cliente para XP, combo ou recompensa: o backend deve calcular tudo.

## Pipeline do CSV

1. Upload do CSV em lote.
2. Normalizacao de texto e deduplicacao por hash semantico.
3. Rejeicao de linhas incompletas, repetidas, ambiguas ou sem resposta verificavel.
4. Classificacao automatica por tema, linguagem e dificuldade.
5. Geracao de regra de validacao por pergunta.
6. Amostragem para revisao humana.
7. Insercao apenas de perguntas aprovadas.

## Anti-fraude e anti-bypass

- Validacao e recompensa sempre no backend.
- Rate limit por usuario, IP e pergunta.
- Tentativas com respostas parecidas demais e repetidas devem reduzir recompensa.
- Logs de respostas invalidas alimentam revisao de perguntas e ajustes de regra.
- Sessao de jogo deve ter nonce/assinatura curta para evitar replay.
- Respostas corretas nao devem ser enviadas ao cliente em modo competitivo.

## Onboarding UX/UI

- Passo 1: nickname, avatar e idioma.
- Passo 2: escolha de tema claro/escuro e imagem de fundo.
- Passo 3: teste rapido de nivel para calibrar dificuldade.
- Passo 4: tutorial jogavel com uma pergunta de cada tipo.
- Passo 5: dashboard inicial com XP000, meta diaria e primeiro modo recomendado.

## Modulos backend

- `auth`: cadastro, login, verificacao por email, recuperacao de senha.
- `profiles`: nickname, avatar, idioma, tema e preferencias.
- `questions`: cadastro, importacao CSV, revisao e categorizacao.
- `validation`: normalizacao, score, regras por pergunta, IA quando permitido.
- `game`: sessoes, modos, recompensas e Jogo do Milhao.
- `progress`: XP, streak, historico e conquistas.
- `ranking`: placares e snapshots.
- `analytics`: tentativas, funil, dificuldade real e qualidade das perguntas.
