import React from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import {
  Activity,
  Award,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  Code2,
  Crown,
  Database,
  Flame,
  Gamepad2,
  History,
  Keyboard,
  Lock,
  Medal,
  Play,
  Puzzle,
  RadioTower,
  Rocket,
  Shield,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap
} from 'lucide-react';
import './styles.css';
import questionsCsv from '../perguntas_programacao_4000.csv?raw';
import typingCsv from '../desafios_programacao_16000.csv?raw';

const characterSheetUrl = new URL('../R.png', import.meta.url).href;
const dataEngineerGokuUrl = '/characters/goku-data-engineer.png';
const ACCESS_REQUEST_ENDPOINT = '/api/access-request';
const ACCESS_GATE_STORAGE_KEY = 'codeKiAccessRequestV1';
const ACCESS_GATE_LAST_SUBMIT_KEY = 'codeKiAccessLastSubmitV1';
const CREATOR_PASSWORD = 'Senior2026';
const MINIMUM_ACCESS_AGE = 18;
const spriteGrid = { columns: 13, rows: 8 };
const allCharacterSprites = Array.from({ length: spriteGrid.columns * spriteGrid.rows }, (_, index) => ({
  id: index + 1,
  x: index % spriteGrid.columns,
  y: Math.floor(index / spriteGrid.columns)
}));

function spriteStyle(sprite) {
  return {
    backgroundImage: `url(${characterSheetUrl})`,
    backgroundSize: `${spriteGrid.columns * 100}% ${spriteGrid.rows * 100}%`,
    backgroundPosition: `${(sprite.x / (spriteGrid.columns - 1)) * 100}% ${(sprite.y / (spriteGrid.rows - 1)) * 100}%`
  };
}

function portraitStyle(entity) {
  if (entity.image) {
    return { backgroundImage: `url(${entity.image})` };
  }
  return spriteStyle(entity.sprite);
}

function fullBodyStyle(entity) {
  return {
    backgroundImage: `url(${entity.fullBodyImage})`
  };
}

function combatBodyStyle(entity) {
  return {
    backgroundImage: `url(${entity.combatImage || entity.fullBodyImage || entity.image})`
  };
}

function resolveCharacterTexture(entity) {
  return entity.combatImage || entity.fullBodyImage || entity.image || '';
}

const fighters = {
  Goku: {
    initials: 'GK',
    image: '/characters/goku-arena-v3.png',
    fullBodyImage: '/characters/fullbody/goku-arena-v3.png',
    sprite: { x: 0, y: 0 },
    attack: 'Kamehameha holografico',
    special: 'Instinto Superior',
    transformations: ['Base', 'Super Saiyajin', 'Super Saiyajin Blue', 'Ultra Instinct'],
    color: '#31d0ff'
  },
  Vegeta: {
    initials: 'VG',
    image: '/characters/portraits/vegeta-portrait-v6.png',
    fullBodyImage: '/characters/fullbody/vegeta-arena-v6.png',
    combatImage: '/characters/focus/vegeta-combat-v6.png',
    sprite: { x: 1, y: 0 },
    attack: 'Final Flash',
    special: 'Orgulho Saiyajin',
    transformations: ['Base', 'Majin', 'Blue Evolution', 'Ego Superior'],
    color: '#ffb02e'
  },
  Gohan: {
    initials: 'GH',
    image: '/characters/gohan-arena-v3.png',
    fullBodyImage: '/characters/fullbody/gohan-arena-v3.png',
    sprite: { x: 2, y: 0 },
    attack: 'Masenko Burst',
    special: 'Potencial Liberado',
    transformations: ['Base', 'Super Saiyajin 2', 'Mystic', 'Beast'],
    color: '#ffffff'
  },
  Piccolo: {
    initials: 'PC',
    image: '/characters/piccolo-arena-v3.png',
    fullBodyImage: '/characters/fullbody/piccolo-arena-v3.png',
    sprite: { x: 5, y: 0 },
    attack: 'Makankosappo',
    special: 'Estrategia Namekuseijin',
    transformations: ['Base', 'Fusionado', 'Potencial Desperto', 'Orange'],
    color: '#68ff76'
  },
  Trunks: {
    initials: 'TR',
    image: '/characters/trunks-arena-v3.png',
    fullBodyImage: '/characters/fullbody/trunks-arena-v3.png',
    sprite: { x: 4, y: 0 },
    attack: 'Galick Gun',
    special: 'Espada do Futuro',
    transformations: ['Base', 'Super Saiyajin', 'Rage', 'Guardiao do Futuro'],
    color: '#9d7cff'
  },
  Videl: {
    initials: 'VD',
    image: '/characters/portraits/videl-portrait-v4.png',
    fullBodyImage: '/characters/fullbody/videl-arena-v3.png',
    combatImage: '/characters/focus/videl-combat-v4.png',
    sprite: { x: 6, y: 0 },
    attack: 'Combo Martial',
    special: 'Coragem do Torneio',
    transformations: ['Base', 'Voo', 'Foco Heroico', 'Ataque Preciso'],
    color: '#ff6fae'
  },
  Bulma: {
    initials: 'BL',
    image: '/characters/portraits/bulma-portrait-v4.png',
    fullBodyImage: '/characters/fullbody/bulma-arena-v3.png',
    combatImage: '/characters/focus/bulma-combat-v4.png',
    sprite: { x: 7, y: 0 },
    attack: 'Capsula Tecnologica',
    special: 'Genio Cientifico',
    transformations: ['Base', 'Radar', 'Capsula', 'Engenharia Z'],
    color: '#46e0ff'
  },
  Android18: {
    initials: '18',
    label: 'Android 18',
    image: '/characters/portraits/android18-portrait-v4.png',
    fullBodyImage: '/characters/fullbody/android18-arena-v3.png',
    combatImage: '/characters/focus/android18-combat-v4.png',
    sprite: { x: 8, y: 0 },
    attack: 'Energia Infinita',
    special: 'Precisao Androide',
    transformations: ['Base', 'Carga Infinita', 'Counter', 'Final Cibernetico'],
    color: '#8dff9e'
  }
};

function fighterDisplayName(name, fighter = fighters[name]) {
  return fighter?.label || name;
}

function resolveFighterName(value) {
  if (fighters[value]) return value;
  const normalized = normalize(String(value || ''));
  return Object.keys(fighters).find((name) => (
    normalize(name) === normalized || normalize(fighters[name].label || '') === normalized
  )) || 'Goku';
}

const bosses = {
  Python: { name: 'Freeza', image: '/characters/bosses/freeza-challenger.png', fullBodyImage: '/characters/villains/freeza-arena-v3.png', sprite: { x: 3, y: 6 }, phases: ['Sintaxe', 'Logica', 'Algoritmo'], special: 'Raio Mortal de bug' },
  Java: { name: 'Cell', image: '/characters/bosses/cell-challenger.png', fullBodyImage: '/characters/villains/cell-arena-v3.png', sprite: { x: 0, y: 6 }, phases: ['Classe', 'Objeto', 'Heranca Perfeita'], special: 'Absorcao de logica' },
  JavaScript: { name: 'Majin Buu', image: '/characters/bosses/majin-buu-challenger.png', fullBodyImage: '/characters/villains/majin-buu-arena-v3.png', sprite: { x: 12, y: 4 }, phases: ['DOM', 'Evento', 'Caos assincrono'], special: 'Explosao de callback' },
  SQL: { name: 'Beerus', image: '/characters/bosses/beerus-challenger.png', fullBodyImage: '/characters/villains/beerus-arena-v3.png', sprite: { x: 12, y: 1 }, phases: ['SELECT', 'JOIN', 'Hakai de tabela'], special: 'Apagar tabela' }
};

const difficultyBosses = {
  Basico: { name: 'Freeza', image: '/characters/bosses/freeza-challenger.png', fullBodyImage: '/characters/villains/freeza-arena-v3.png', sprite: { x: 3, y: 6 }, phases: ['Sintaxe', 'Variavel', 'Primeiro algoritmo'], special: 'Raio Mortal de bug', role: 'Programa desafiador' },
  Intermediario: { name: 'Cell', image: '/characters/bosses/cell-challenger.png', fullBodyImage: '/characters/villains/cell-arena-v3.png', sprite: { x: 0, y: 6 }, phases: ['Condicao', 'Loop', 'Padrao perfeito'], special: 'Absorcao de logica', role: 'Boss de estruturas' },
  Dificil: { name: 'Majin Buu', image: '/characters/bosses/majin-buu-challenger.png', fullBodyImage: '/characters/villains/majin-buu-arena-v3.png', sprite: { x: 12, y: 4 }, phases: ['Funcao', 'Estado', 'Caos de algoritmo'], special: 'Explosao de callback', role: 'Boss de caos' },
  Hard: { name: 'Beerus', image: '/characters/bosses/beerus-challenger.png', fullBodyImage: '/characters/villains/beerus-arena-v3.png', sprite: { x: 12, y: 1 }, phases: ['Multi linguagem', 'Tempo curto', 'Hakai final'], special: 'Apagar tabela', role: 'Boss supremo' }
};

const movementCards = [
  { title: 'Acerto', text: 'Ataque de energia, avanço rápido, dano flutuante e aura mais intensa.', event: 'attack' },
  { title: 'Erro', text: 'Recuo cômico, HUD vermelho, aura enfraquecida e dica do narrador IA.', event: 'hit' },
  { title: 'KI 100%', text: 'Transformação automática com explosão neon, tela vibrando e partículas extremas.', event: 'transform' },
  { title: 'Combo', text: 'Clones holográficos, câmera lenta e velocidade de luta maior a cada sequência.', event: 'combo' }
];

const languages = {
  Python: {
    planet: 'Python Planet',
    biome: 'Florestas digitais verdes',
    mentor: 'Goku',
    boss: 'Freeza',
    color: '#31d0ff',
    icon: Code2,
    topics: ['print', 'variaveis', 'if/else', 'loops', 'funcoes', 'listas', 'dicionarios']
  },
  Java: {
    planet: 'Java Planet',
    biome: 'Cidade tecnologica vermelha',
    mentor: 'Vegeta',
    boss: 'Cell',
    color: '#ffb02e',
    icon: Shield,
    topics: ['classes', 'objetos', 'metodos', 'arrays', 'loops', 'condicionais']
  },
  JavaScript: {
    planet: 'JavaScript Planet',
    biome: 'Cyberpunk neon amarelo',
    mentor: 'Trunks',
    boss: 'Majin Buu',
    color: '#ffe45e',
    icon: Zap,
    topics: ['variaveis', 'funcoes', 'DOM', 'eventos', 'arrays', 'APIs']
  },
  SQL: {
    planet: 'SQL Planet',
    biome: 'Banco de dados galactico azul',
    mentor: 'Piccolo',
    boss: 'Beerus',
    color: '#9d7cff',
    icon: Database,
    topics: ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'WHERE', 'ORDER BY']
  }
};

const difficulties = ['Basico', 'Intermediario', 'Dificil', 'Hard'];

const gameModes = {
  quiz: {
    label: 'Quiz de Interpretacao',
    icon: Crown,
    description: 'Conceitos, comandos, leitura de codigo, saidas, SQL e correcao de erros.'
  },
  typing: {
    label: 'Digitação',
    icon: Keyboard,
    description: 'Prática escrevendo código, comandos e respostas técnicas.'
  },
  crossword: {
    label: 'Cruzadas',
    icon: Puzzle,
    description: 'Palavras-chave do roadmap com pistas progressivas.'
  }
};

const aiEngineerRoadmap = [
  { term: 'LLM', track: 'Fundamentos de IA', meaning: 'Modelo de linguagem grande treinado para compreender e gerar texto.', example: 'Um assistente que resume logs, explica código e responde perguntas técnicas.' },
  { term: 'inferencia', track: 'Fundamentos de IA', meaning: 'Uso de um modelo treinado para produzir uma resposta a partir de uma entrada.', example: 'Enviar uma pergunta para a API e receber uma resposta do modelo.' },
  { term: 'embedding', track: 'Embeddings e busca', meaning: 'Representação numérica de um texto, imagem ou dado para medir similaridade.', example: 'Converter documentos em vetores para encontrar trechos parecidos com a pergunta.' },
  { term: 'vector database', track: 'Embeddings e busca', meaning: 'Banco especializado em armazenar vetores e executar busca por similaridade.', example: 'Qdrant, Pinecone, Chroma, Weaviate, FAISS ou Supabase Vector.' },
  { term: 'RAG', track: 'RAG', meaning: 'Técnica que recupera contexto externo antes de gerar a resposta.', example: 'Buscar documentos internos e pedir ao modelo para responder usando esses trechos.' },
  { term: 'chunking', track: 'RAG', meaning: 'Divisão de documentos em partes menores antes de gerar embeddings.', example: 'Separar um PDF em blocos para facilitar recuperação sem perder contexto.' },
  { term: 'prompt engineering', track: 'Prompt Engineering', meaning: 'Prática de escrever instruções claras, estruturadas e testáveis para modelos de IA.', example: 'Definir papel, tarefa, formato de saída e critérios de qualidade no prompt.' },
  { term: 'token', track: 'OpenAI API', meaning: 'Unidade de texto processada pelo modelo e usada para limite de contexto e cobrança.', example: 'Controlar o tamanho do prompt para reduzir custo e latência.' },
  { term: 'fine tuning', track: 'Modelos', meaning: 'Adaptação de um modelo com exemplos para melhorar comportamento em uma tarefa específica.', example: 'Treinar respostas padronizadas para suporte interno.' },
  { term: 'prompt injection', track: 'Segurança', meaning: 'Ataque que tenta fazer o modelo ignorar instruções originais ou revelar dados.', example: 'Um texto malicioso pedindo para desconsiderar as regras do sistema.' },
  { term: 'moderation', track: 'Segurança', meaning: 'Processo de classificar ou bloquear conteúdo inseguro antes ou depois da geração.', example: 'Usar filtros de segurança para detectar abuso, dados sensíveis ou conteúdo perigoso.' },
  { term: 'agent', track: 'AI Agents', meaning: 'Sistema que usa modelo, ferramentas e memória/contexto para executar tarefas em etapas.', example: 'Um agente que consulta banco, chama API e cria um relatório.' },
  { term: 'tools', track: 'AI Agents', meaning: 'Funções externas que um modelo pode acionar para buscar dados ou executar ações.', example: 'Uma ferramenta que consulta pedidos no banco ou abre um ticket.' },
  { term: 'deploy', track: 'DevOps para IA', meaning: 'Publicar uma aplicação, API, modelo ou agente em um ambiente executável.', example: 'Enviar uma API de RAG para Azure Container Apps, App Service ou Kubernetes.' },
  { term: 'observabilidade', track: 'DevOps para IA', meaning: 'Monitoramento de logs, métricas, traces, custo, latência e qualidade das respostas.', example: 'Acompanhar taxa de erro, tempo de resposta e tokens gastos por sessão.' },
  { term: 'multimodal', track: 'Multimodal', meaning: 'Capacidade de trabalhar com mais de um tipo de entrada ou saída, como texto, imagem e áudio.', example: 'Analisar uma imagem e responder em texto; transcrever áudio e resumir.' }
];

const w3ReferenceLibrary = [
  { language: 'Python', keyword: 'print', aliases: ['print()'], topic: 'Saida de dados', meaning: 'Exibe valores no console ou na saida padrao.', child: 'Use para depurar scripts, mostrar resultados intermediarios e confirmar que um fluxo executou.', example: 'print("pipeline concluido")' },
  { language: 'Python', keyword: 'input', aliases: ['input()'], topic: 'Entrada de dados', meaning: 'Le texto digitado pelo usuario durante a execucao.', child: 'Use em scripts interativos; em automacoes e pipelines prefira parametros, variaveis de ambiente ou arquivos.', example: 'nome = input("Nome do dataset: ")' },
  { language: 'Python', keyword: 'len', aliases: ['len()'], topic: 'Colecoes', meaning: 'Retorna a quantidade de itens de uma string, lista, tupla, dicionario ou outra colecao.', child: 'Muito usado para validar volume de dados antes de processar uma etapa.', example: 'total = len(registros)' },
  { language: 'Python', keyword: 'range', aliases: ['range()'], topic: 'Iteracao', meaning: 'Gera uma sequencia numerica, normalmente usada em loops.', child: 'Use quando precisa repetir uma acao um numero definido de vezes.', example: 'for pagina in range(1, 6):\n    coletar(pagina)' },
  { language: 'Python', keyword: 'list', aliases: ['lista', 'array'], topic: 'Estrutura de dados', meaning: 'Cria ou representa uma colecao ordenada e mutavel de valores.', child: 'Use para armazenar lotes de itens que serao percorridos, filtrados ou transformados.', example: 'arquivos = ["raw.csv", "trusted.csv"]' },
  { language: 'Python', keyword: 'dict', aliases: ['dicionario', 'dictionary'], topic: 'Estrutura de dados', meaning: 'Cria ou representa pares chave-valor.', child: 'Excelente para configurar parametros, mapear colunas ou representar objetos simples.', example: 'schema = {"id": "int", "nome": "str"}' },
  { language: 'Python', keyword: 'if', aliases: ['if / else', 'elif', 'else'], topic: 'Controle de fluxo', meaning: 'Executa blocos diferentes conforme uma condicao booleana.', child: 'Use para validar regra de negocio, tratar excecoes esperadas e proteger etapas do pipeline.', example: 'if linhas == 0:\n    raise ValueError("arquivo vazio")' },
  { language: 'Python', keyword: 'for', topic: 'Loop', meaning: 'Percorre itens de uma sequencia ou iteravel.', child: 'Use para processar listas de arquivos, linhas, tabelas ou chamadas paginadas.', example: 'for arquivo in arquivos:\n    processar(arquivo)' },
  { language: 'Python', keyword: 'while', topic: 'Loop', meaning: 'Repete um bloco enquanto a condicao continuar verdadeira.', child: 'Use com cuidado em rotinas que aguardam fila, polling ou tentativas com limite.', example: 'while tentativas < 3:\n    tentar_conexao()' },
  { language: 'Python', keyword: 'def', aliases: ['funcao', 'function'], topic: 'Funcoes', meaning: 'Define uma funcao reutilizavel.', child: 'Transforme passos repetidos de ETL, validacao ou chamada de API em funcoes pequenas e testaveis.', example: 'def normalizar_coluna(nome):\n    return nome.lower().strip()' },
  { language: 'Python', keyword: 'return', topic: 'Funcoes', meaning: 'Finaliza uma funcao e devolve um valor ao chamador.', child: 'Use para deixar claro o resultado produzido por uma transformacao.', example: 'return dataframe_limpo' },
  { language: 'Python', keyword: 'try', aliases: ['except', 'finally'], topic: 'Erros e excecoes', meaning: 'Permite tratar erros de execucao de forma controlada.', child: 'Use para capturar falhas previsiveis, registrar contexto e evitar que o erro fique silencioso.', example: 'try:\n    df = ler_csv(path)\nexcept FileNotFoundError:\n    registrar_erro(path)' },
  { language: 'Python', keyword: 'import', aliases: ['from'], topic: 'Modulos', meaning: 'Carrega modulos, pacotes ou partes especificas de bibliotecas.', child: 'Use para organizar dependencias como pandas, requests, pathlib e bibliotecas internas.', example: 'import pandas as pd' },
  { language: 'Python', keyword: 'class', topic: 'Orientacao a objetos', meaning: 'Define uma classe, ou seja, um modelo para criar objetos.', child: 'Use quando dados e comportamentos relacionados precisam ficar agrupados de forma consistente.', example: 'class PipelineConfig:\n    pass' },

  { language: 'Java', keyword: 'class', topic: 'Classes', meaning: 'Define uma classe em Java.', child: 'Use classes para modelar servicos, entidades, DTOs e componentes de uma aplicacao.', example: 'public class ClienteService { }' },
  { language: 'Java', keyword: 'public', topic: 'Modificadores de acesso', meaning: 'Permite acesso por qualquer outra classe.', child: 'Use em APIs publicas da sua aplicacao; restrinja o restante para reduzir acoplamento.', example: 'public void executar() { }' },
  { language: 'Java', keyword: 'private', topic: 'Modificadores de acesso', meaning: 'Restringe acesso ao interior da propria classe.', child: 'Use para encapsular estado interno e proteger detalhes de implementacao.', example: 'private String token;' },
  { language: 'Java', keyword: 'protected', topic: 'Modificadores de acesso', meaning: 'Permite acesso no mesmo pacote e em subclasses.', child: 'Use com criterio em hierarquias; prefira composicao quando a heranca nao for clara.', example: 'protected void validar() { }' },
  { language: 'Java', keyword: 'static', topic: 'Membros de classe', meaning: 'Declara membro pertencente a classe, nao a uma instancia especifica.', child: 'Use para constantes e utilitarios sem estado; evite guardar estado mutavel global.', example: 'public static final int LIMITE = 100;' },
  { language: 'Java', keyword: 'void', topic: 'Metodos', meaning: 'Indica que um metodo nao retorna valor.', child: 'Use quando o metodo executa uma acao, como salvar, enviar ou registrar algo.', example: 'void salvarEvento(Evento evento) { }' },
  { language: 'Java', keyword: 'return', topic: 'Metodos', meaning: 'Finaliza um metodo e pode devolver um valor.', child: 'Use para tornar explicito o resultado de uma regra ou transformacao.', example: 'return usuariosAtivos;' },
  { language: 'Java', keyword: 'new', topic: 'Objetos', meaning: 'Cria uma nova instancia de uma classe.', child: 'Use para instanciar objetos; em frameworks, injecao de dependencia costuma ser preferivel para servicos.', example: 'Cliente cliente = new Cliente();' },
  { language: 'Java', keyword: 'if', aliases: ['else'], topic: 'Controle de fluxo', meaning: 'Executa codigo conforme uma condicao.', child: 'Use para regras de validacao, autorizacao e decisao de fluxo.', example: 'if (total > 0) { processar(); }' },
  { language: 'Java', keyword: 'for', aliases: ['while', 'do'], topic: 'Loops', meaning: 'Repete um bloco de codigo.', child: 'Use para percorrer listas, arrays e colecoes; em colecoes modernas, streams tambem podem ser uteis.', example: 'for (String item : itens) { validar(item); }' },
  { language: 'Java', keyword: 'try', aliases: ['catch', 'finally'], topic: 'Excecoes', meaning: 'Executa codigo com tratamento de erro.', child: 'Use para capturar falhas esperadas e registrar informacoes suficientes para suporte.', example: 'try { importar(); } catch (Exception e) { log.error("falha", e); }' },
  { language: 'Java', keyword: 'interface', topic: 'Abstracao', meaning: 'Declara um contrato que classes podem implementar.', child: 'Use para separar contrato de implementacao e facilitar testes.', example: 'interface Repositorio { void salvar(); }' },
  { language: 'Java', keyword: 'extends', aliases: ['implements'], topic: 'Heranca e contratos', meaning: 'Indica heranca de classe ou implementacao de contrato.', child: 'Use quando existe relacao clara de especializacao ou obrigacao de implementar metodos.', example: 'class ClienteRepo implements Repositorio { }' },
  { language: 'Java', keyword: 'array', aliases: ['int[]', 'String[]'], topic: 'Colecoes', meaning: 'Estrutura com tamanho fixo para armazenar valores do mesmo tipo.', child: 'Use para dados simples e previsiveis; para colecoes flexiveis, considere List.', example: 'String[] colunas = {"id", "nome"};' },

  { language: 'JavaScript', keyword: 'const', topic: 'Variaveis', meaning: 'Declara uma variavel cujo vinculo nao pode ser reatribuido.', child: 'Use por padrao para valores que nao precisam ser reatribuidos, como configuracoes e referencias.', example: 'const endpoint = "/api/users";' },
  { language: 'JavaScript', keyword: 'let', topic: 'Variaveis', meaning: 'Declara uma variavel de escopo de bloco que pode ser reatribuida.', child: 'Use quando o valor muda ao longo do fluxo, como contadores ou acumuladores.', example: 'let tentativas = 0;' },
  { language: 'JavaScript', keyword: 'var', topic: 'Variaveis', meaning: 'Declara variavel com escopo de funcao; e legado em codigo moderno.', child: 'Evite em projetos novos; prefira const e let para reduzir bugs de escopo.', example: 'var legado = true;' },
  { language: 'JavaScript', keyword: 'function', aliases: ['funcao'], topic: 'Funcoes', meaning: 'Declara uma funcao reutilizavel.', child: 'Use para encapsular transformacoes, validacoes e handlers de eventos.', example: 'function formatarNome(nome) { return nome.trim(); }' },
  { language: 'JavaScript', keyword: 'return', topic: 'Funcoes', meaning: 'Finaliza a funcao e devolve um valor.', child: 'Use para deixar o resultado da funcao previsivel e testavel.', example: 'return resposta.json();' },
  { language: 'JavaScript', keyword: 'if', aliases: ['else'], topic: 'Controle de fluxo', meaning: 'Executa blocos diferentes de acordo com uma condicao.', child: 'Use para validar entradas, tratar estados de UI e escolher fluxos de API.', example: 'if (!email) return "email obrigatorio";' },
  { language: 'JavaScript', keyword: 'for', aliases: ['for...of', 'for...in', 'while'], topic: 'Loops', meaning: 'Repete um bloco de codigo.', child: 'Use para percorrer arrays, objetos ou listas de resultados.', example: 'for (const item of itens) { console.log(item); }' },
  { language: 'JavaScript', keyword: 'class', topic: 'Classes', meaning: 'Declara uma classe para criar objetos com propriedades e metodos.', child: 'Use quando um modelo com estado e comportamento melhora a organizacao do dominio.', example: 'class Pedido { constructor(id) { this.id = id; } }' },
  { language: 'JavaScript', keyword: 'async function', aliases: ['async', 'await'], topic: 'Assincrono', meaning: 'Declara uma funcao assincrona que pode aguardar Promises.', child: 'Use para chamadas HTTP, leitura de dados e fluxos que dependem de resposta externa.', example: 'async function carregar() { return await fetch(url); }' },
  { language: 'JavaScript', keyword: 'try...catch', aliases: ['try', 'catch', 'finally'], topic: 'Erros', meaning: 'Trata erros gerados em um bloco de codigo.', child: 'Use em chamadas de API, parse de JSON e operacoes sujeitas a falha.', example: 'try { await salvar(); } catch (erro) { console.error(erro); }' },
  { language: 'JavaScript', keyword: 'switch', topic: 'Controle de fluxo', meaning: 'Escolhe um bloco a executar com base em diferentes casos.', child: 'Use quando varias opcoes discretas tornam if/else muito longo.', example: 'switch (status) { case "ok": break; }' },
  { language: 'JavaScript', keyword: 'DOM', aliases: ['document', 'querySelector'], topic: 'HTML DOM', meaning: 'Representa a pagina HTML como objetos que o JavaScript pode ler e alterar.', child: 'Use para selecionar elementos, atualizar texto, reagir a eventos e montar interfaces.', example: 'document.querySelector("#total").textContent = total;' },
  { language: 'JavaScript', keyword: 'eventos', aliases: ['addEventListener', 'event'], topic: 'Interacao', meaning: 'Acoes disparadas pelo navegador, como clique, envio de formulario ou tecla pressionada.', child: 'Use para conectar a interface ao comportamento da aplicacao.', example: 'botao.addEventListener("click", salvar);' },

  { language: 'SQL', keyword: 'SELECT', topic: 'Consulta', meaning: 'Seleciona dados de uma ou mais tabelas.', child: 'E a base de relatorios, dashboards, validacoes e exploracao de dados.', example: 'SELECT nome, email FROM usuarios;' },
  { language: 'SQL', keyword: 'FROM', topic: 'Consulta', meaning: 'Indica a tabela de origem de uma consulta ou exclusao.', child: 'Sem FROM, o banco nao sabe de qual tabela buscar ou remover registros.', example: 'SELECT * FROM pedidos;' },
  { language: 'SQL', keyword: 'WHERE', topic: 'Filtro', meaning: 'Filtra registros que atendem a uma condicao.', child: 'Use para reduzir o conjunto de dados antes de atualizar, excluir, agregar ou analisar.', example: 'SELECT * FROM pedidos WHERE status = "pago";' },
  { language: 'SQL', keyword: 'INSERT INTO', aliases: ['INSERT'], topic: 'Escrita de dados', meaning: 'Insere novas linhas em uma tabela.', child: 'Use para carregar dados novos, registrar eventos ou popular tabelas de referencia.', example: 'INSERT INTO usuarios (nome) VALUES ("Ana");' },
  { language: 'SQL', keyword: 'UPDATE', topic: 'Atualizacao', meaning: 'Atualiza linhas existentes em uma tabela.', child: 'Sempre combine com WHERE quando quiser alterar apenas parte dos registros.', example: 'UPDATE pedidos SET status = "entregue" WHERE id = 10;' },
  { language: 'SQL', keyword: 'DELETE', topic: 'Exclusao', meaning: 'Remove linhas de uma tabela.', child: 'Use com WHERE para evitar apagar a tabela inteira; em producao, valide antes com SELECT.', example: 'DELETE FROM pedidos WHERE id = 10;' },
  { language: 'SQL', keyword: 'JOIN', aliases: ['INNER JOIN'], topic: 'Relacionamento', meaning: 'Combina linhas de tabelas relacionadas.', child: 'Use para montar visoes analiticas juntando fatos, dimensoes e cadastros.', example: 'SELECT p.id, c.nome FROM pedidos p JOIN clientes c ON p.cliente_id = c.id;' },
  { language: 'SQL', keyword: 'LEFT JOIN', topic: 'Relacionamento', meaning: 'Retorna todas as linhas da tabela da esquerda e as correspondentes da direita.', child: 'Use quando precisa manter registros mesmo sem correspondencia, comum em auditorias de dados.', example: 'SELECT c.nome, p.id FROM clientes c LEFT JOIN pedidos p ON c.id = p.cliente_id;' },
  { language: 'SQL', keyword: 'GROUP BY', topic: 'Agregacao', meaning: 'Agrupa linhas para calcular metricas por categoria.', child: 'Use com COUNT, SUM, AVG, MIN ou MAX para criar indicadores.', example: 'SELECT status, COUNT(*) FROM pedidos GROUP BY status;' },
  { language: 'SQL', keyword: 'HAVING', topic: 'Agregacao', meaning: 'Filtra resultados depois do GROUP BY.', child: 'Use quando o filtro depende de uma metrica agregada.', example: 'SELECT cliente_id, COUNT(*) FROM pedidos GROUP BY cliente_id HAVING COUNT(*) > 3;' },
  { language: 'SQL', keyword: 'ORDER BY', topic: 'Ordenacao', meaning: 'Ordena o resultado da consulta.', child: 'Use para ranking, ultimos eventos, maiores valores ou exibicao previsivel.', example: 'SELECT * FROM pedidos ORDER BY criado_em DESC;' },
  { language: 'SQL', keyword: 'DISTINCT', topic: 'Consulta', meaning: 'Retorna apenas valores diferentes.', child: 'Use para descobrir categorias, estados ou chaves unicas aparentes.', example: 'SELECT DISTINCT status FROM pedidos;' },
  { language: 'SQL', keyword: 'CREATE TABLE', aliases: ['CREATE'], topic: 'DDL', meaning: 'Cria uma nova tabela no banco de dados.', child: 'Use para definir estruturas persistentes com colunas, tipos e restricoes.', example: 'CREATE TABLE usuarios (id INT, nome VARCHAR(100));' },
  { language: 'SQL', keyword: 'ALTER TABLE', aliases: ['ALTER'], topic: 'DDL', meaning: 'Altera a estrutura de uma tabela existente.', child: 'Use em migracoes controladas para adicionar, remover ou modificar colunas.', example: 'ALTER TABLE usuarios ADD email VARCHAR(120);' },
  { language: 'SQL', keyword: 'DROP TABLE', aliases: ['DROP'], topic: 'DDL', meaning: 'Remove uma tabela do banco de dados.', child: 'Operacao destrutiva: use somente com revisao, backup ou ambiente seguro.', example: 'DROP TABLE tabela_temporaria;' },
  { language: 'SQL', keyword: 'PRIMARY KEY', topic: 'Restricoes', meaning: 'Identifica de forma unica cada linha de uma tabela.', child: 'Use para garantir identidade, relacionamentos e integridade dos dados.', example: 'id INT PRIMARY KEY' },
  { language: 'SQL', keyword: 'FOREIGN KEY', topic: 'Restricoes', meaning: 'Cria uma relacao entre colunas de tabelas diferentes.', child: 'Use para preservar integridade entre entidades, como pedidos e clientes.', example: 'FOREIGN KEY (cliente_id) REFERENCES clientes(id)' }
];

const legacyLibrary = [
  {
    language: 'Python',
    keyword: 'print',
    topic: 'Saida de dados',
    meaning: 'Mostra textos, numeros ou resultados na tela.',
    child: 'E como anunciar o poder do personagem para a arena inteira.',
    example: 'print("Ola, mundo!")'
  },
  {
    language: 'Python',
    keyword: 'variavel',
    topic: 'Memoria',
    meaning: 'Guarda um valor com um nome para usar depois.',
    child: 'Uma capsula com etiqueta onde voce guarda energia, nome ou pontos.',
    example: 'energia = 9000'
  },
  {
    language: 'Python',
    keyword: 'if / else',
    topic: 'Condicionais',
    meaning: 'Executa caminhos diferentes dependendo de uma condicao.',
    child: 'O scouter pergunta se algo e verdade antes do guerreiro agir.',
    example: 'if energia > 8000:\n    print("Ativar aura")\nelse:\n    print("Treinar mais")'
  },
  {
    language: 'Python',
    keyword: 'for',
    topic: 'Loops',
    meaning: 'Repete uma acao para cada item de uma sequencia.',
    child: 'E repetir golpes ate completar o treino.',
    example: 'for golpe in golpes:\n    print(golpe)'
  },
  {
    language: 'Python',
    keyword: 'def',
    topic: 'Funcoes',
    meaning: 'Cria um bloco de codigo reutilizavel.',
    child: 'E salvar uma tecnica especial para usar quando precisar.',
    example: 'def atacar():\n    print("Kamehameha")'
  },
  {
    language: 'Java',
    keyword: 'class',
    topic: 'Classes',
    meaning: 'Define um modelo para criar objetos.',
    child: 'A ficha do personagem antes dele entrar na historia.',
    example: 'class Guerreiro { }'
  },
  {
    language: 'Java',
    keyword: 'objeto',
    topic: 'Objetos',
    meaning: 'Uma instancia criada a partir de uma classe.',
    child: 'E o personagem real criado a partir da ficha.',
    example: 'Guerreiro goku = new Guerreiro();'
  },
  {
    language: 'Java',
    keyword: 'metodo',
    topic: 'Metodos',
    meaning: 'Uma acao que um objeto ou classe consegue executar.',
    child: 'E uma tecnica do personagem, como atacar ou defender.',
    example: 'void atacar() { }'
  },
  {
    language: 'JavaScript',
    keyword: 'let / const',
    topic: 'Variaveis',
    meaning: 'Criam nomes para guardar valores.',
    child: 'Sao capsulas para guardar informacoes da pagina.',
    example: 'const poder = 9000;'
  },
  {
    language: 'JavaScript',
    keyword: 'DOM',
    topic: 'Pagina web',
    meaning: 'Representa os elementos HTML que o JavaScript pode alterar.',
    child: 'E o mapa da arena na tela, onde voce muda botoes, textos e imagens.',
    example: 'document.querySelector("button")'
  },
  {
    language: 'JavaScript',
    keyword: 'eventos',
    topic: 'Interacao',
    meaning: 'Acoes como clique, tecla pressionada ou carregamento.',
    child: 'Sensores que avisam quando o jogador fez alguma coisa.',
    example: 'botao.addEventListener("click", lutar)'
  },
  {
    language: 'SQL',
    keyword: 'SELECT',
    topic: 'Consulta',
    meaning: 'Busca dados em uma tabela.',
    child: 'Pede ao banco uma lista de guerreiros ou pontos.',
    example: 'SELECT nome FROM users;'
  },
  {
    language: 'SQL',
    keyword: 'WHERE',
    topic: 'Filtro',
    meaning: 'Filtra os dados por uma condicao.',
    child: 'Mostra apenas quem passou no teste do scouter.',
    example: 'SELECT nome FROM users WHERE xp > 9000;'
  },
  {
    language: 'SQL',
    keyword: 'JOIN',
    topic: 'Relacoes',
    meaning: 'Junta dados de tabelas relacionadas.',
    child: 'Une a ficha do aluno com suas medalhas.',
    example: 'SELECT users.nome, progress.pontos FROM users JOIN progress ON users.id = progress.user_id;'
  }
];

function referenceKeys(item) {
  return [item.keyword, ...(item.aliases || [])].map(normalize);
}

function dedupeReferenceItems(items) {
  const seen = new Set();
  return items.filter((item) => {
    const key = `${item.language}-${normalize(item.keyword)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function makeReferenceItems(language, topic, entries) {
  return entries.map(([keyword, meaning, example = keyword, aliases = []]) => ({
    language,
    keyword,
    aliases,
    topic,
    meaning,
    child: `Na pratica, use ${keyword} quando precisar de: ${meaning.toLowerCase()}`,
    example
  }));
}

const expandedW3ReferenceLibrary = [
  ...makeReferenceItems('Python', 'Palavras reservadas', [
    ['and', 'Combina condicoes logicas e exige que todas sejam verdadeiras.', 'if ativo and aprovado:\n    processar()'],
    ['as', 'Cria um apelido para modulo, importacao ou contexto.', 'import pandas as pd'],
    ['assert', 'Valida uma suposicao durante testes ou depuracao.', 'assert total >= 0'],
    ['async', 'Declara uma funcao assincrona.', 'async def carregar():\n    return dados'],
    ['await', 'Aguarda o resultado de uma operacao assincrona.', 'dados = await buscar_api()'],
    ['break', 'Interrompe um loop antes do fim natural.', 'if encontrou:\n    break'],
    ['case', 'Define uma alternativa dentro de match/case.', 'case "erro":\n    registrar()'],
    ['continue', 'Pula para a proxima iteracao do loop.', 'if linha_vazia:\n    continue'],
    ['del', 'Remove uma referencia, item ou atributo.', 'del cache[chave]'],
    ['elif', 'Adiciona uma condicao intermediaria depois de um if.', 'elif status == "pendente":\n    revisar()'],
    ['except', 'Captura um erro gerado no bloco try.', 'except ValueError:\n    registrar_erro()'],
    ['False', 'Representa o valor booleano falso.', 'ativo = False'],
    ['finally', 'Executa um bloco ao final do try, com ou sem erro.', 'finally:\n    conexao.close()'],
    ['from', 'Importa partes especificas de um modulo.', 'from pathlib import Path'],
    ['global', 'Indica que uma variavel usada na funcao pertence ao escopo global.', 'global total_processado'],
    ['in', 'Testa se um valor existe em uma colecao.', 'if coluna in schema:\n    validar()'],
    ['is', 'Compara identidade entre objetos.', 'if valor is None:\n    return'],
    ['lambda', 'Cria uma funcao anonima curta.', 'ordenar = lambda item: item["data"]'],
    ['match', 'Inicia uma estrutura de padroes para comparar valores.', 'match evento:\n    case "login":\n        auditar()'],
    ['None', 'Representa ausencia de valor.', 'resultado = None'],
    ['nonlocal', 'Permite alterar variavel de uma funcao externa nao global.', 'nonlocal contador'],
    ['not', 'Inverte uma condicao booleana.', 'if not valido:\n    corrigir()'],
    ['or', 'Combina condicoes e exige que pelo menos uma seja verdadeira.', 'if admin or dono:\n    liberar()'],
    ['pass', 'Mantem um bloco vazio de forma valida.', 'def futuro():\n    pass'],
    ['raise', 'Dispara uma excecao manualmente.', 'raise ValueError("id invalido")'],
    ['True', 'Representa o valor booleano verdadeiro.', 'ativo = True'],
    ['with', 'Gerencia recursos com abertura e fechamento seguros.', 'with open(path) as arquivo:\n    dados = arquivo.read()'],
    ['yield', 'Produz valores em uma funcao geradora.', 'yield linha_processada']
  ]),
  ...makeReferenceItems('Python', 'Funcoes embutidas', [
    ['abs', 'Retorna o valor absoluto de um numero.', 'abs(-10)'],
    ['all', 'Retorna verdadeiro se todos os itens forem verdadeiros.', 'all(validacoes)'],
    ['any', 'Retorna verdadeiro se algum item for verdadeiro.', 'any(erros)'],
    ['bool', 'Converte ou avalia um valor como booleano.', 'bool(resultado)'],
    ['bytes', 'Cria uma sequencia imutavel de bytes.', 'payload = bytes(texto, "utf-8")'],
    ['callable', 'Verifica se um objeto pode ser chamado como funcao.', 'callable(transformar)'],
    ['chr', 'Converte codigo Unicode em caractere.', 'chr(65)'],
    ['compile', 'Compila texto de codigo para execucao posterior.', 'compile(codigo, "<string>", "exec")'],
    ['complex', 'Cria numero complexo.', 'complex(1, 2)'],
    ['dict', 'Cria um dicionario de pares chave-valor.', 'dict(id=1, nome="Ana")'],
    ['dir', 'Lista atributos e metodos de um objeto.', 'dir(dataframe)'],
    ['divmod', 'Retorna quociente e resto de uma divisao.', 'divmod(total, lote)'],
    ['enumerate', 'Percorre itens com indice.', 'for indice, valor in enumerate(lista):\n    print(indice, valor)'],
    ['eval', 'Avalia uma expressao dinamica.', 'eval("2 + 2")'],
    ['exec', 'Executa codigo Python dinamicamente.', 'exec(codigo)'],
    ['filter', 'Filtra itens usando uma funcao.', 'filter(lambda x: x > 0, valores)'],
    ['float', 'Converte valor para numero decimal.', 'float("10.5")'],
    ['format', 'Formata valores para texto.', 'format(valor, ".2f")'],
    ['frozenset', 'Cria um conjunto imutavel.', 'frozenset(chaves)'],
    ['getattr', 'Busca atributo pelo nome.', 'getattr(objeto, "status")'],
    ['globals', 'Retorna a tabela de simbolos globais.', 'globals()'],
    ['hasattr', 'Verifica se um objeto possui atributo.', 'hasattr(evento, "id")'],
    ['hash', 'Retorna hash de um objeto.', 'hash(chave)'],
    ['help', 'Abre ajuda sobre objeto ou funcao.', 'help(len)'],
    ['hex', 'Converte numero para hexadecimal.', 'hex(255)'],
    ['id', 'Retorna identificador interno do objeto.', 'id(objeto)'],
    ['int', 'Converte valor para numero inteiro.', 'int("42")'],
    ['isinstance', 'Verifica se objeto pertence a um tipo.', 'isinstance(valor, int)'],
    ['issubclass', 'Verifica relacao de heranca entre classes.', 'issubclass(Filho, Pai)'],
    ['iter', 'Cria um iterador.', 'iter(lista)'],
    ['locals', 'Retorna simbolos locais atuais.', 'locals()'],
    ['map', 'Aplica funcao a cada item de uma colecao.', 'map(str.upper, nomes)'],
    ['max', 'Retorna o maior valor.', 'max(valores)'],
    ['min', 'Retorna o menor valor.', 'min(valores)'],
    ['next', 'Retorna o proximo item de um iterador.', 'next(iterador)'],
    ['object', 'Cria um objeto base.', 'object()'],
    ['open', 'Abre arquivo para leitura ou escrita.', 'open("dados.csv")'],
    ['ord', 'Retorna codigo Unicode de um caractere.', 'ord("A")'],
    ['pow', 'Calcula potencia.', 'pow(2, 3)'],
    ['reversed', 'Retorna iterador reverso.', 'reversed(lista)'],
    ['round', 'Arredonda numero.', 'round(valor, 2)'],
    ['set', 'Cria conjunto de valores unicos.', 'set(ids)'],
    ['setattr', 'Define atributo em objeto.', 'setattr(objeto, "status", "ok")'],
    ['slice', 'Cria uma fatia reutilizavel.', 'slice(0, 10)'],
    ['sorted', 'Retorna colecao ordenada.', 'sorted(nomes)'],
    ['str', 'Converte valor para texto.', 'str(total)'],
    ['sum', 'Soma valores numericos.', 'sum(valores)'],
    ['tuple', 'Cria tupla imutavel.', 'tuple(lista)'],
    ['type', 'Retorna ou cria tipo.', 'type(valor)'],
    ['zip', 'Combina colecoes por posicao.', 'zip(colunas, valores)']
  ]),
  ...makeReferenceItems('Java', 'Palavras reservadas', [
    ['abstract', 'Define classe ou metodo abstrato que precisa ser especializado.', 'abstract class BaseJob { }'],
    ['assert', 'Valida uma condicao durante testes ou depuracao.', 'assert total >= 0;'],
    ['boolean', 'Tipo para valores true ou false.', 'boolean ativo = true;'],
    ['break', 'Interrompe loop ou switch.', 'break;'],
    ['byte', 'Tipo inteiro pequeno de 8 bits.', 'byte flag = 1;'],
    ['case', 'Define alternativa em switch.', 'case "OK": break;'],
    ['catch', 'Captura excecao gerada no try.', 'catch (Exception e) { log.error("falha", e); }'],
    ['char', 'Tipo para um unico caractere.', 'char separador = \';\';'],
    ['continue', 'Pula para a proxima iteracao do loop.', 'continue;'],
    ['default', 'Define caso padrao em switch ou metodo padrao em interface.', 'default: registrar();'],
    ['do', 'Inicia loop que executa antes de testar a condicao.', 'do { tentar(); } while (ativo);'],
    ['double', 'Tipo numerico decimal de dupla precisao.', 'double media = 10.5;'],
    ['else', 'Executa bloco alternativo quando o if falha.', 'else { revisar(); }'],
    ['enum', 'Define conjunto fixo de constantes.', 'enum Status { NOVO, PAGO }'],
    ['final', 'Impede reatribuicao, sobrescrita ou heranca conforme o uso.', 'final String ambiente = "prod";'],
    ['float', 'Tipo numerico decimal de precisao simples.', 'float taxa = 1.5f;'],
    ['implements', 'Indica que a classe cumpre um contrato de interface.', 'class Repo implements Repository { }'],
    ['import', 'Importa classe ou pacote.', 'import java.util.List;'],
    ['instanceof', 'Verifica se objeto pertence a um tipo.', 'if (valor instanceof String) { }'],
    ['int', 'Tipo inteiro comum.', 'int total = 0;'],
    ['long', 'Tipo inteiro de maior capacidade.', 'long registros = 1000000L;'],
    ['package', 'Declara o pacote da classe.', 'package app.service;'],
    ['short', 'Tipo inteiro curto.', 'short codigo = 10;'],
    ['super', 'Acessa comportamento da classe pai.', 'super.validar();'],
    ['switch', 'Escolhe fluxo entre varios casos.', 'switch (status) { case "OK": break; }'],
    ['synchronized', 'Controla acesso concorrente a bloco ou metodo.', 'synchronized void atualizar() { }'],
    ['this', 'Referencia a instancia atual.', 'this.id = id;'],
    ['throw', 'Dispara uma excecao.', 'throw new IllegalArgumentException();'],
    ['throws', 'Declara excecoes que um metodo pode lancar.', 'void ler() throws IOException { }'],
    ['transient', 'Ignora campo em serializacao padrao.', 'transient String cache;'],
    ['volatile', 'Indica campo visivel entre threads.', 'volatile boolean ativo;']
  ]),
  ...makeReferenceItems('JavaScript', 'Statements', [
    ['break', 'Sai de um loop ou switch.', 'break;'],
    ['continue', 'Pula uma iteracao e segue o loop.', 'continue;'],
    ['debugger', 'Pausa execucao quando ferramentas de debug estao abertas.', 'debugger;'],
    ['do...while', 'Executa bloco e repete enquanto a condicao for verdadeira.', 'do { tentar(); } while (ativo);'],
    ['for...in', 'Percorre nomes de propriedades de um objeto.', 'for (const chave in objeto) { console.log(chave); }'],
    ['for...of', 'Percorre valores de um iteravel.', 'for (const linha of linhas) { processar(linha); }'],
    ['import', 'Importa valores de outro modulo.', 'import { api } from "./api.js";'],
    ['throw', 'Gera um erro manualmente.', 'throw new Error("payload invalido");'],
    ['while', 'Repete bloco enquanto a condicao for verdadeira.', 'while (fila.length) { processar(); }']
  ]),
  ...makeReferenceItems('SQL', 'Keywords', [
    ['ADD', 'Adiciona coluna em tabela existente.', 'ALTER TABLE clientes ADD email VARCHAR(120);'],
    ['ADD CONSTRAINT', 'Adiciona restricao depois da tabela criada.', 'ALTER TABLE pedidos ADD CONSTRAINT fk_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id);'],
    ['ALL', 'Compara valor com todos os valores retornados por uma subconsulta.', 'WHERE valor > ALL (SELECT valor FROM metas)'],
    ['ALTER COLUMN', 'Altera tipo ou definicao de uma coluna.', 'ALTER TABLE clientes ALTER COLUMN nome VARCHAR(150);'],
    ['ALTER VIEW', 'Atualiza a definicao de uma view.', 'ALTER VIEW vw_vendas AS SELECT * FROM vendas;'],
    ['COLUMN', 'Referencia coluna em operacoes de estrutura.', 'ALTER TABLE clientes DROP COLUMN apelido;'],
    ['CONSTRAINT', 'Define regra de integridade no banco.', 'CONSTRAINT pk_cliente PRIMARY KEY (id)'],
    ['CREATE DATABASE', 'Cria um banco de dados.', 'CREATE DATABASE analytics;'],
    ['CREATE INDEX', 'Cria indice para acelerar consultas.', 'CREATE INDEX idx_pedidos_data ON pedidos(data_criacao);'],
    ['CREATE VIEW', 'Cria uma consulta salva como visao.', 'CREATE VIEW vw_receita AS SELECT status, SUM(valor) total FROM pedidos GROUP BY status;'],
    ['DATABASE', 'Representa o banco onde tabelas e objetos ficam armazenados.', 'CREATE DATABASE lakehouse;'],
    ['DEFAULT', 'Define valor padrao para uma coluna.', 'status VARCHAR(20) DEFAULT "novo"'],
    ['DESC', 'Ordena resultados de forma decrescente.', 'ORDER BY criado_em DESC'],
    ['DROP COLUMN', 'Remove coluna de uma tabela.', 'ALTER TABLE clientes DROP COLUMN apelido;'],
    ['DROP DATABASE', 'Remove um banco de dados.', 'DROP DATABASE teste;'],
    ['DROP INDEX', 'Remove um indice.', 'DROP INDEX idx_pedidos_data;'],
    ['DROP VIEW', 'Remove uma view.', 'DROP VIEW vw_receita;'],
    ['EXEC', 'Executa procedimento armazenado.', 'EXEC atualizar_metricas;'],
    ['EXISTS', 'Testa se uma subconsulta retorna registros.', 'WHERE EXISTS (SELECT 1 FROM pedidos p WHERE p.cliente_id = c.id)'],
    ['FULL OUTER JOIN', 'Combina registros de ambos os lados, mesmo sem correspondencia.', 'SELECT * FROM a FULL OUTER JOIN b ON a.id = b.id;'],
    ['IN', 'Verifica se valor esta em uma lista ou subconsulta.', 'WHERE status IN ("pago", "enviado")'],
    ['INDEX', 'Estrutura usada para otimizar busca.', 'CREATE INDEX idx_nome ON clientes(nome);'],
    ['IS NULL', 'Testa valores vazios.', 'WHERE cancelado_em IS NULL'],
    ['IS NOT NULL', 'Testa valores preenchidos.', 'WHERE email IS NOT NULL'],
    ['LIKE', 'Busca padrao textual.', 'WHERE nome LIKE "Ana%"'],
    ['LIMIT', 'Limita quantidade de registros retornados.', 'SELECT * FROM logs LIMIT 100;'],
    ['NOT', 'Inverte uma condicao.', 'WHERE NOT status = "cancelado"'],
    ['NOT NULL', 'Impede valores nulos em uma coluna.', 'email VARCHAR(120) NOT NULL'],
    ['OR', 'Permite que uma entre varias condicoes seja verdadeira.', 'WHERE status = "pago" OR status = "enviado"'],
    ['OUTER JOIN', 'Retorna linhas mesmo quando nao ha correspondencia completa.', 'SELECT * FROM a LEFT OUTER JOIN b ON a.id = b.id;'],
    ['PROCEDURE', 'Rotina armazenada no banco.', 'CREATE PROCEDURE atualizar_metricas AS SELECT 1;'],
    ['RIGHT JOIN', 'Mantem todas as linhas da tabela da direita.', 'SELECT * FROM pedidos RIGHT JOIN clientes ON pedidos.cliente_id = clientes.id;'],
    ['ROWNUM', 'Referencia numero de linha em alguns bancos.', 'WHERE ROWNUM <= 10'],
    ['SELECT DISTINCT', 'Seleciona valores sem repeticao.', 'SELECT DISTINCT status FROM pedidos;'],
    ['SELECT INTO', 'Cria tabela a partir de resultado de consulta.', 'SELECT * INTO pedidos_backup FROM pedidos;'],
    ['SELECT TOP', 'Limita a quantidade de registros retornados em alguns bancos.', 'SELECT TOP 10 * FROM pedidos;'],
    ['SET', 'Define valores em comandos de atualizacao.', 'UPDATE pedidos SET status = "ok" WHERE id = 1;'],
    ['TABLE', 'Objeto que armazena dados em linhas e colunas.', 'CREATE TABLE eventos (id INT);'],
    ['TRUNCATE TABLE', 'Remove todos os dados de uma tabela mantendo a estrutura.', 'TRUNCATE TABLE staging_eventos;'],
    ['UNION', 'Combina resultados removendo duplicados.', 'SELECT email FROM clientes UNION SELECT email FROM leads;'],
    ['UNION ALL', 'Combina resultados mantendo duplicados.', 'SELECT id FROM a UNION ALL SELECT id FROM b;'],
    ['UNIQUE', 'Garante valores unicos em uma coluna ou conjunto de colunas.', 'email VARCHAR(120) UNIQUE'],
    ['VALUES', 'Define valores em um INSERT.', 'INSERT INTO clientes (nome) VALUES ("Ana");'],
    ['VIEW', 'Consulta salva que pode ser usada como tabela logica.', 'CREATE VIEW vw_clientes AS SELECT id, nome FROM clientes;']
  ])
];

const library = dedupeReferenceItems([...w3ReferenceLibrary, ...expandedW3ReferenceLibrary, ...legacyLibrary]);

function section(title, items) {
  return { title, items };
}

const libraryCurriculum = {
  Java: [
    section('Java Get Started', ['Java Get Started', 'Java Syntax', 'Java Output', 'Java Comments', 'Java Variables', 'Java Data Types', 'Java Type Casting', 'Java Operators', 'Java Strings', 'Java Math', 'Java Booleans', 'Java If...Else', 'Java Switch', 'Java While Loop', 'Java For Loop', 'Java Break/Continue', 'Java Arrays']),
    section('Java Methods', ['Java Methods', 'Java Method Challenge', 'Java Method Parameters', 'Java Method Overloading', 'Java Scope', 'Java Recursion']),
    section('Java Classes', ['Java OOP', 'Java Classes/Objects', 'Java Class Attributes', 'Java Class Methods', 'Java Class Challenge', 'Java Constructors', 'Java this Keyword', 'Java Modifiers', 'Java Encapsulation', 'Java Packages / API', 'Java Inheritance', 'Java Polymorphism', 'Java super Keyword', 'Java Inner Classes', 'Java Abstraction', 'Java Interface', 'Java Anonymous', 'Java Enum', 'Java User Input', 'Java Date']),
    section('Java Errors', ['Java Errors', 'Java Debugging', 'Java Exceptions', 'Java Multiple Exceptions', 'Java try-with-resources']),
    section('Java File Handling', ['Java Files', 'Java Create Files', 'Java Write Files', 'Java Read Files', 'Java Delete Files']),
    section('Java I/O Streams', ['Java I/O Streams', 'Java FileInputStream', 'Java FileOutputStream', 'Java BufferedReader', 'Java BufferedWriter']),
    section('Java Data Structures', ['Java Data Structures', 'Java Collections', 'Java List', 'Java ArrayList', 'Java LinkedList', 'Java List Sorting', 'Java Set', 'Java HashSet', 'Java TreeSet', 'Java LinkedHashSet', 'Java Map', 'Java HashMap', 'Java TreeMap', 'Java LinkedHashMap', 'Java Iterator', 'Java Algorithms']),
    section('Java Advanced', ['Java Wrapper Classes', 'Java Generics', 'Java Annotations', 'Java RegEx', 'Java Threads', 'Java Lambda', 'Java Advanced Sorting']),
    section('Java Projects', ['Java Projects']),
    section('Java Cert', ['Java Certificate']),
    section('Java How Tos', ['Java How Tos']),
    section('Java Reference', ['Java Reference', 'Java Keywords', 'Java String Methods', 'Java Math Methods', 'Java Output Methods', 'Java Arrays Methods', 'Java ArrayList Methods', 'Java LinkedList Methods', 'Java HashMap Methods', 'Java Scanner Methods', 'Java File Methods', 'Java FileInputStream', 'Java FileOutputStream', 'Java BufferedReader', 'Java BufferedWriter', 'Java Iterator Methods', 'Java Collections Methods', 'Java System Methods', 'Java Errors & Exceptions']),
    section('Java Examples', ['Java Examples', 'Java Videos', 'Java Compiler', 'Java Exercises', 'Java Quiz', 'Java Code Challenges', 'Java Practice Problems', 'Java Server', 'Java Syllabus', 'Java Study Plan', 'Java Interview Q&A'])
  ],
  SQL: [
    section('SQL Intro', ['SQL Intro', 'SQL Syntax', 'SQL Select', 'SQL Select Distinct', 'SQL Where', 'SQL Order By', 'SQL And', 'SQL Or', 'SQL Not', 'SQL Insert Into', 'SQL Null Values', 'SQL Update', 'SQL Delete', 'SQL Select Top', 'SQL Aggregate Functions', 'SQL Min()', 'SQL Max()', 'SQL Count()', 'SQL Sum()', 'SQL Avg()', 'SQL Like', 'SQL Wildcards', 'SQL In', 'SQL Between', 'SQL Aliases', 'SQL Joins', 'SQL Inner Join', 'SQL Left Join', 'SQL Right Join', 'SQL Full Join', 'SQL Self Join', 'SQL Union', 'SQL Union All', 'SQL Group By', 'SQL Having', 'SQL Exists', 'SQL Any', 'SQL All', 'SQL Select Into', 'SQL Insert Into Select', 'SQL Case', 'SQL Null Functions', 'SQL Stored Procedures', 'SQL Comments', 'SQL Operators']),
    section('SQL Database', ['SQL Create DB', 'SQL Drop DB', 'SQL Backup DB', 'SQL Create Table', 'SQL Drop Table', 'SQL Alter Table', 'SQL Constraints', 'SQL Not Null', 'SQL Unique', 'SQL Primary Key', 'SQL Foreign Key', 'SQL Check', 'SQL Default', 'SQL Create Index', 'SQL Auto Increment', 'SQL Dates', 'SQL Views', 'SQL Injection', 'SQL Parameters', 'SQL Prepared Statements', 'SQL Hosting']),
    section('SQL Cert', ['SQL Certificate']),
    section('SQL References', ['SQL Data Types', 'SQL Keywords', 'MySQL Functions', 'SQL Server Functions', 'MS Access Functions', 'SQL Quick Ref']),
    section('SQL Examples', ['SQL Examples', 'SQL Editor', 'SQL Quiz', 'SQL Exercises', 'SQL Server', 'SQL Syllabus', 'SQL Study Plan', 'SQL Bootcamp', 'SQL Training'])
  ],
  JavaScript: [
    section('JS Introduction', ['JS Introduction', 'JS Where To', 'JS Output']),
    section('JS Syntax', ['JS Syntax', 'JS Statements', 'JS Comments', 'JS Variables', 'JS Let', 'JS Const', 'JS Types']),
    section('JS Operators', ['JS Operators']),
    section('JS If Else', ['JS If Conditions']),
    section('JS Loops', ['JS Loops']),
    section('JS Strings', ['JS Strings']),
    section('JS Numbers', ['JS Numbers']),
    section('JS Functions', ['JS Functions']),
    section('JS Objects', ['JS Objects']),
    section('JS Scope', ['JS Scope']),
    section('JS Dates', ['JS Dates']),
    section('JS Temporal', ['JS Temporal']),
    section('JS Arrays', ['JS Arrays']),
    section('JS Sets', ['JS Sets']),
    section('JS Maps', ['JS Maps']),
    section('JS Iterations', ['JS Loops']),
    section('JS Math', ['JS Math']),
    section('JS RegExp', ['JS RegExp']),
    section('JS DataTypes', ['JS Data Types']),
    section('JS Errors', ['JS Errors']),
    section('JS Debugging', ['JS Debugging']),
    section('JS Conventions', ['JS Style Guide']),
    section('JS Reference', ['JS Reference']),
    section('JS Projects', ['JS Projects']),
    section('JS Versions', ['JS 2026']),
    section('JS HTML', ['JS HTML DOM', 'JS Events']),
    section('JS Advanced', ['JS Functions', 'JS Objects', 'JS Classes', 'JS Asynchronous', 'JS Modules', 'JS Meta & Proxy', 'JS Typed Arrays', 'JS DOM Navigation', 'JS Windows', 'JS Web APIs', 'JS AJAX', 'JS JSON', 'JS jQuery', 'JS Graphics', 'JS Examples', 'JS Reference'])
  ],
  Python: [
    section('Python Intro', ['Python Intro', 'Python Get Started', 'Python Syntax', 'Python Output', 'Python Comments', 'Python Variables', 'Python Data Types', 'Python Numbers', 'Python Casting', 'Python Strings', 'Python Booleans', 'Python Operators', 'Python Lists', 'Python Tuples', 'Python Sets', 'Python Dictionaries', 'Python If...Else', 'Python Match', 'Python While Loops', 'Python For Loops', 'Python Functions', 'Python Range', 'Python Arrays', 'Python Iterators', 'Python Modules', 'Python Dates', 'Python Math', 'Python JSON', 'Python RegEx', 'Python PIP', 'Python Try...Except', 'Python String Formatting', 'Python None', 'Python User Input', 'Python VirtualEnv']),
    section('Python Classes', ['Python OOP', 'Python Classes/Objects', 'Python __init__ Method', 'Python self Parameter', 'Python Class Properties', 'Python Class Methods', 'Python Inheritance', 'Python Polymorphism', 'Python Encapsulation', 'Python Inner Classes']),
    section('File Handling', ['Python File Handling', 'Python Read Files', 'Python Write/Create Files', 'Python Delete Files']),
    section('Python Modules', ['NumPy Tutorial', 'Pandas Tutorial', 'SciPy Tutorial', 'Django Tutorial']),
    section('Python Matplotlib', ['Matplotlib Intro', 'Matplotlib Get Started', 'Matplotlib Pyplot', 'Matplotlib Plotting', 'Matplotlib Markers', 'Matplotlib Line', 'Matplotlib Labels', 'Matplotlib Grid', 'Matplotlib Subplot', 'Matplotlib Scatter', 'Matplotlib Bars', 'Matplotlib Histograms', 'Matplotlib Pie Charts']),
    section('Machine Learning', ['Getting Started', 'Mean Median Mode', 'Standard Deviation', 'Percentile', 'Data Distribution', 'Normal Data Distribution', 'Scatter Plot', 'Linear Regression', 'Polynomial Regression', 'Multiple Regression', 'Scale', 'Train/Test', 'Decision Tree', 'Confusion Matrix', 'Hierarchical Clustering', 'Logistic Regression', 'Grid Search', 'Categorical Data', 'K-means', 'Bootstrap Aggregation', 'Cross Validation', 'AUC - ROC Curve', 'K-nearest neighbors']),
    section('Python DSA', ['Python DSA', 'Lists and Arrays', 'Stacks', 'Queues', 'Linked Lists', 'Hash Tables', 'Trees', 'Binary Trees', 'Binary Search Trees', 'AVL Trees', 'Graphs', 'Linear Search', 'Binary Search', 'Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Quick Sort', 'Counting Sort', 'Radix Sort', 'Merge Sort']),
    section('Python MySQL', ['MySQL Get Started', 'MySQL Create Database', 'MySQL Create Table', 'MySQL Insert', 'MySQL Select', 'MySQL Where', 'MySQL Order By', 'MySQL Delete', 'MySQL Drop Table', 'MySQL Update', 'MySQL Limit', 'MySQL Join']),
    section('Python MongoDB', ['MongoDB Get Started', 'MongoDB Create DB', 'MongoDB Collection', 'MongoDB Insert', 'MongoDB Find', 'MongoDB Query', 'MongoDB Sort', 'MongoDB Delete', 'MongoDB Drop Collection', 'MongoDB Update', 'MongoDB Limit']),
    section('Python Cert', ['Python Certificate']),
    section('Python Reference', ['Python Overview', 'Python Built-in Functions', 'Python String Methods', 'Python List Methods', 'Python Dictionary Methods', 'Python Tuple Methods', 'Python Set Methods', 'Python File Methods', 'Python Keywords', 'Python Exceptions', 'Python Glossary']),
    section('Module Reference', ['Built-in Modules', 'Random Module', 'Requests Module', 'Statistics Module', 'Math Module', 'cMath Module']),
    section('Python How To', ['Remove List Duplicates', 'Reverse a String', 'Add Two Numbers']),
    section('Python Examples', ['Python Examples', 'Python Compiler', 'Python Exercises', 'Python Quiz', 'Python Challenges', 'Python Practice Problems', 'Python Server', 'Python Syllabus', 'Python Study Plan', 'Python Interview Q&A', 'Python Bootcamp', 'Python Training'])
  ]
};

function cleanCurriculumTerm(label, language) {
  return normalize(label)
    .replace(new RegExp(`^${normalize(language)}\\s+`), '')
    .replace(/^js\s+/, '')
    .replace(/^sql\s+/, '')
    .replace(/^python\s+/, '')
    .replace(/^java\s+/, '')
    .replace(/\(\)/g, '')
    .trim();
}

function findReferenceForTopic(language, label) {
  const term = cleanCurriculumTerm(label, language);
  return library.find((item) => item.language === language && referenceKeys(item).some((key) => key === term || term.includes(key) || key.includes(term)));
}

function buildCurriculumCard(language, groupTitle, label) {
  const reference = findReferenceForTopic(language, label);
  return {
    language,
    keyword: label,
    topic: groupTitle,
    meaning: reference?.meaning || `Modulo da trilha ${language} para estudar ${label.replace(/^(Java|JS|SQL|Python)\s+/, '')}.`,
    child: reference?.child || `Use este topico para entender conceito, sintaxe, exemplos e aplicacao pratica antes de ir para os desafios.`,
    example: reference?.example || `Estude: ${label}`,
    sourceKeyword: reference?.keyword
  };
}

function detectCsvDelimiter(csv) {
  const firstLine = String(csv || '').split(/\r?\n/).find((line) => line.trim()) || '';
  const candidates = [',', ';', '\t'];
  return candidates
    .map((delimiter) => ({
      delimiter,
      count: [...firstLine].filter((char) => char === delimiter).length
    }))
    .sort((a, b) => b.count - a.count)[0]?.delimiter || ',';
}

function parseCsvRows(csv, delimiter = detectCsvDelimiter(csv)) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const char = csv[index];
    const next = csv[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = '';
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    if (row.some((cell) => cell.trim())) rows.push(row);
  }

  return rows;
}

function csvToObjects(csv) {
  const rows = parseCsvRows(csv);
  const headers = (rows[0] || []).map((header) => header.replace(/^\uFEFF/, '').trim());
  return rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, (row[index] || '').trim()])));
}

function mapCsvDifficulty(value) {
  return {
    Simples: 'Basico',
    Media: 'Intermediario',
    Dificil: 'Dificil',
    Hard: 'Hard'
  }[value] || value || 'Basico';
}

function findConcept(language, keyword) {
  const normalizedKeyword = normalize(keyword);
  return library.find((item) => item.language === language && referenceKeys(item).includes(normalizedKeyword))
    || library.find((item) => item.language === language && referenceKeys(item).some((key) => normalizedKeyword.includes(key) || key.includes(normalizedKeyword)))
    || library.find((item) => item.language === language)
    || library[0];
}

function conceptDistractors(language, keyword) {
  const normalizedKeyword = normalize(keyword);
  return library
    .filter((item) => item.language === language && !referenceKeys(item).includes(normalizedKeyword))
    .map((item) => item.meaning);
}

function buildQuizOptions(language, keyword, fallbackOptions = []) {
  const concept = findConcept(language, keyword);
  const options = [concept.meaning, ...conceptDistractors(language, keyword), ...fallbackOptions]
    .filter(Boolean)
    .filter((option, index, list) => list.findIndex((item) => normalize(item) === normalize(option)) === index);
  const selected = options.slice(0, 4);
  const shift = [...String(keyword)].reduce((total, char) => total + char.charCodeAt(0), 0) % Math.max(1, selected.length);
  return [...selected.slice(shift), ...selected.slice(0, shift)];
}

const quizOptionTextMap = {
  'cria condicao': 'Avalia uma condição',
  'cria condição': 'Avalia uma condição',
  'define comportamento': 'Define uma função',
  'define uma funcao': 'Define uma função',
  'define uma função': 'Define uma função',
  'executa repeticao': 'Executa repetição',
  'executa repetição': 'Executa repetição',
  'armazena dados': 'Armazena dados'
};

function normalizeQuizOptionText(value) {
  const text = String(value || '').trim();
  return quizOptionTextMap[normalize(text)] || text;
}

function buildCsvChallenges(csv) {
  return csvToObjects(csv).map((row, index) => {
    const language = row.linguagem || 'Python';
    const keyword = row.palavra_chave || 'programacao';
    const concept = findConcept(language, keyword);
    const options = [
      row.alternativa_a,
      row.alternativa_b,
      row.alternativa_c,
      row.alternativa_d
    ].map(normalizeQuizOptionText).filter(Boolean).filter((option, optionIndex, list) => list.findIndex((item) => normalize(item) === normalize(option)) === optionIndex);
    const answer = normalizeQuizOptionText(row.resposta_correta || options[0] || concept.meaning);
    const quizOptions = options.some((option) => normalize(option) === normalize(answer))
      ? options
      : [answer, ...options].filter(Boolean).slice(0, 4);

    return {
      id: row.id || `CSV-${index + 1}`,
      type: 'Quiz',
      language,
      difficulty: mapCsvDifficulty(row.dificuldade),
      title: `${language}: ${keyword}`,
      prompt: row.pergunta || `O que ${keyword} faz em ${language}?`,
      code: '',
      options: quizOptions,
      answer,
      keyword,
      reason: row.explicacao || `A alternativa correta e ${answer}.`,
      meaning: concept.meaning,
      child: concept.child,
      example: concept.example
    };
  }).filter((challenge) => challenge.prompt && challenge.options.length >= 2 && challenge.answer);
}

const csvChallenges = buildCsvChallenges(questionsCsv);

const interpretiveQuizChallenges = [
  {
    id: 'INT-PY-CONCEPT-1',
    mode: 'quiz',
    quizType: 'concept',
    type: 'Quiz de Conceito',
    language: 'Python',
    difficulty: 'Basico',
    title: 'Python: conceito',
    prompt: 'O que significa Python no contexto de programacao?',
    code: '',
    options: [
      'Uma linguagem de programacao usada para criar sistemas, automacoes, analise de dados, IA e aplicacoes web.',
      'Um comando usado apenas para repetir codigos.',
      'Um banco de dados criado para guardar imagens.',
      'Uma tag HTML usada para criar botoes.'
    ],
    answer: 'Uma linguagem de programacao usada para criar sistemas, automacoes, analise de dados, IA e aplicacoes web.',
    keyword: 'Python',
    reason: 'Python e uma linguagem de programacao de uso geral, muito usada em automacao, dados, IA, APIs e web.',
    meaning: 'Linguagem de programacao versatil e legivel.',
    child: 'Pense em Python como uma ferramenta central para construir sistemas e automatizar tarefas.',
    example: 'print("Ola, Code Ki")'
  },
  {
    id: 'INT-PY-KEYWORD-IF',
    mode: 'quiz',
    quizType: 'keyword',
    type: 'Quiz de Palavra-Chave',
    language: 'Python',
    difficulty: 'Basico',
    title: 'Python: if',
    prompt: 'O que o comando if faz em Python?',
    code: 'if energia > 8000:\n    print("Transformar")',
    options: [
      'Executa repeticao',
      'Avalia uma condicao e executa um bloco conforme o resultado.',
      'Armazena dados',
      'Define uma funcao'
    ],
    answer: 'Avalia uma condicao e executa um bloco conforme o resultado.',
    keyword: 'if',
    reason: 'O if avalia se uma condicao e verdadeira; se for, executa o bloco indentado.',
    meaning: 'Avalia uma condicao antes de agir.',
    child: 'E como o scouter perguntando se o poder passou do limite antes de liberar o golpe.',
    example: 'if idade >= 18:\n    print("Acesso permitido")'
  },
  {
    id: 'INT-PY-READING-1',
    mode: 'quiz',
    quizType: 'code-reading',
    type: 'Leitura de Codigo',
    language: 'Python',
    difficulty: 'Intermediario',
    title: 'Python: acesso permitido',
    prompt: 'O que esse codigo faz?',
    code: 'idade = 18\n\nif idade >= 18:\n    print("Acesso permitido")',
    options: [
      'Verifica se idade e maior ou igual a 18 e exibe Acesso permitido.',
      'Repete a mensagem 18 vezes.',
      'Cria uma lista com 18 usuarios.',
      'Apaga a variavel idade.'
    ],
    answer: 'Verifica se idade e maior ou igual a 18 e exibe Acesso permitido.',
    keyword: 'if',
    reason: 'A variavel idade vale 18; a condicao idade >= 18 e verdadeira, entao o print executa.',
    meaning: 'Leitura de fluxo condicional.',
    child: 'O codigo testa uma regra e so executa a mensagem quando a regra e verdadeira.',
    example: 'idade = 18'
  },
  {
    id: 'INT-PY-OUTPUT-1',
    mode: 'quiz',
    quizType: 'output',
    type: 'Quiz de Resultado',
    language: 'Python',
    difficulty: 'Dificil',
    title: 'Python: upper',
    prompt: 'Qual sera o resultado desse codigo?',
    code: 'nome = "Ana"\nprint(nome.upper())',
    options: ['ANA', 'ana', 'Nome', 'Erro'],
    answer: 'ANA',
    keyword: 'upper',
    reason: 'upper() transforma as letras da string em maiusculas antes do print.',
    meaning: 'Metodo de string para converter texto em maiusculas.',
    child: 'O texto sobe de forma, como uma transformacao visual da palavra.',
    example: '"ana".upper()'
  },
  {
    id: 'INT-PY-DEBUG-1',
    mode: 'quiz',
    quizType: 'debug',
    type: 'Quiz de Correcao',
    language: 'Python',
    difficulty: 'Hard',
    title: 'Python: if quebrado',
    prompt: 'Qual e o problema nesse codigo?',
    code: 'if idade > 18\n    print("Maior de idade")',
    options: [
      'Falta dois-pontos apos a condicao do if.',
      'A variavel idade nao pode ser comparada.',
      'O print nao pode estar dentro do if.',
      'O numero 18 deveria estar entre aspas.'
    ],
    answer: 'Falta dois-pontos apos a condicao do if.',
    keyword: 'if',
    reason: 'Em Python, a linha do if precisa terminar com dois-pontos para iniciar o bloco.',
    meaning: 'Correcao de sintaxe condicional.',
    child: 'Sem os dois-pontos, o portal do bloco nao abre.',
    example: 'if idade > 18:\n    print("Maior de idade")'
  },
  {
    id: 'INT-SQL-READING-1',
    mode: 'quiz',
    quizType: 'sql-reading',
    type: 'SQL Interpretativo',
    language: 'SQL',
    difficulty: 'Intermediario',
    title: 'SQL: nomes com A',
    prompt: 'O que essa consulta faz?',
    code: "SELECT name, date, year\nFROM users\nWHERE name LIKE 'A%';",
    options: [
      'Seleciona nome, data e ano da tabela users, apenas dos usuarios cujo nome comeca com a letra A.',
      'Cria uma nova tabela chamada users com nomes iniciados por A.',
      'Apaga todos os usuarios que nao comecam com a letra A.',
      'Atualiza o ano dos usuarios que tem a letra A no final do nome.'
    ],
    answer: 'Seleciona nome, data e ano da tabela users, apenas dos usuarios cujo nome comeca com a letra A.',
    keyword: 'SELECT WHERE LIKE',
    reason: 'SELECT escolhe colunas, FROM indica a tabela e WHERE com LIKE A% filtra nomes que comecam com A.',
    meaning: 'Consulta com filtro textual.',
    child: 'E uma busca que pega so registros cujo nome abre com a letra A.',
    example: "WHERE name LIKE 'A%'"
  },
  {
    id: 'INT-SQL-CONCEPT-1',
    mode: 'quiz',
    quizType: 'concept',
    type: 'Quiz de Conceito',
    language: 'SQL',
    difficulty: 'Basico',
    title: 'SQL: conceito',
    prompt: 'Para que SQL e usado?',
    code: '',
    options: [
      'Para consultar, filtrar, inserir, atualizar e organizar dados em bancos relacionais.',
      'Para criar animacoes CSS no navegador.',
      'Para compilar aplicativos Android automaticamente.',
      'Para substituir todas as linguagens de programacao.'
    ],
    answer: 'Para consultar, filtrar, inserir, atualizar e organizar dados em bancos relacionais.',
    keyword: 'SQL',
    reason: 'SQL e a linguagem padrao para trabalhar com bancos de dados relacionais.',
    meaning: 'Linguagem para consultar e manipular dados.',
    child: 'SQL e o mapa que encontra informacoes dentro do banco.',
    example: 'SELECT nome FROM usuarios;'
  },
  {
    id: 'INT-SQL-BOSS-1',
    mode: 'quiz',
    quizType: 'sql-reading',
    type: 'Boss Interpretativo',
    language: 'SQL',
    difficulty: 'Hard',
    title: 'SQL: join e filtro',
    prompt: 'Qual descricao traduz melhor essa consulta?',
    code: "SELECT u.name, o.total\nFROM users u\nJOIN orders o ON o.user_id = u.id\nWHERE o.total > 100\nORDER BY o.total DESC;",
    options: [
      'Lista nomes de usuarios e totais de pedidos acima de 100, unindo users e orders e ordenando do maior total para o menor.',
      'Remove pedidos abaixo de 100 e apaga usuarios sem compras.',
      'Cria uma tabela orders com todos os usuarios em ordem alfabetica.',
      'Seleciona apenas usuarios cujo nome tem mais de 100 caracteres.'
    ],
    answer: 'Lista nomes de usuarios e totais de pedidos acima de 100, unindo users e orders e ordenando do maior total para o menor.',
    keyword: 'JOIN WHERE ORDER BY',
    reason: 'JOIN combina tabelas, WHERE filtra pedidos acima de 100 e ORDER BY DESC ordena do maior para o menor.',
    meaning: 'Consulta combinando tabelas, filtro e ordenacao.',
    child: 'E uma leitura de batalha com tres passos: unir, filtrar e ordenar.',
    example: 'JOIN orders o ON o.user_id = u.id'
  },
  {
    id: 'INT-JS-CONCEPT-1',
    mode: 'quiz',
    quizType: 'concept',
    type: 'Quiz de Conceito',
    language: 'JavaScript',
    difficulty: 'Basico',
    title: 'JavaScript: conceito',
    prompt: 'Qual e o papel mais comum do JavaScript em paginas web?',
    code: '',
    options: [
      'Adicionar interatividade, responder a eventos e manipular elementos da pagina.',
      'Guardar tabelas relacionais no servidor.',
      'Substituir o HTML na estrutura base da pagina.',
      'Criar apenas imagens estaticas sem interacao.'
    ],
    answer: 'Adicionar interatividade, responder a eventos e manipular elementos da pagina.',
    keyword: 'JavaScript',
    reason: 'JavaScript e usado no navegador para criar interacao, eventos, estados e comunicacao com APIs.',
    meaning: 'Linguagem de interatividade na web.',
    child: 'JavaScript e o ki que faz a pagina reagir.',
    example: 'button.addEventListener("click", atacar)'
  },
  {
    id: 'INT-JS-READING-1',
    mode: 'quiz',
    quizType: 'code-reading',
    type: 'Leitura de Codigo',
    language: 'JavaScript',
    difficulty: 'Intermediario',
    title: 'JavaScript: clique',
    prompt: 'O que esse codigo faz?',
    code: 'button.addEventListener("click", iniciarLuta);',
    options: [
      'Executa iniciarLuta quando o botao recebe um clique.',
      'Cria um botao novo automaticamente.',
      'Remove todos os eventos da pagina.',
      'Executa iniciarLuta antes da pagina carregar.'
    ],
    answer: 'Executa iniciarLuta quando o botao recebe um clique.',
    keyword: 'addEventListener',
    reason: 'addEventListener registra uma funcao para ser executada quando um evento acontece.',
    meaning: 'Registra uma reacao a evento.',
    child: 'E como ligar um sensor de clique a um golpe.',
    example: 'element.addEventListener("click", fn)'
  },
  {
    id: 'INT-JS-OUTPUT-1',
    mode: 'quiz',
    quizType: 'output',
    type: 'Quiz de Resultado',
    language: 'JavaScript',
    difficulty: 'Dificil',
    title: 'JavaScript: map',
    prompt: 'Qual sera o resultado impresso?',
    code: 'const nums = [1, 2, 3];\nconsole.log(nums.map(n => n * 2));',
    options: ['[2, 4, 6]', '[1, 2, 3]', '6', 'Erro'],
    answer: '[2, 4, 6]',
    keyword: 'map',
    reason: 'map cria um novo array aplicando n * 2 em cada item.',
    meaning: 'Transforma cada item de um array.',
    child: 'Cada numero recebe um treino e volta duplicado.',
    example: '[1,2].map(n => n * 2)'
  },
  {
    id: 'INT-JAVA-CONCEPT-1',
    mode: 'quiz',
    quizType: 'concept',
    type: 'Quiz de Conceito',
    language: 'Java',
    difficulty: 'Basico',
    title: 'Java: conceito',
    prompt: 'O que uma classe representa em Java?',
    code: 'class Guerreiro {\n  int poder;\n}',
    options: [
      'Um modelo para criar objetos com dados e comportamentos.',
      'Um comando usado para apagar arquivos.',
      'Uma consulta de banco de dados.',
      'Uma regra exclusiva de HTML.'
    ],
    answer: 'Um modelo para criar objetos com dados e comportamentos.',
    keyword: 'class',
    reason: 'Em Java, class define um modelo a partir do qual objetos podem ser criados.',
    meaning: 'Modelo para objetos.',
    child: 'A classe e a ficha base do personagem antes de entrar na arena.',
    example: 'class Guerreiro { }'
  },
  {
    id: 'INT-JAVA-READING-1',
    mode: 'quiz',
    quizType: 'code-reading',
    type: 'Leitura de Codigo',
    language: 'Java',
    difficulty: 'Intermediario',
    title: 'Java: metodo',
    prompt: 'O que esse metodo retorna?',
    code: 'int dobrar(int valor) {\n  return valor * 2;\n}',
    options: [
      'Retorna o valor recebido multiplicado por 2.',
      'Imprime o valor na tela sem retornar nada.',
      'Cria uma variavel chamada dobrar.',
      'Divide o valor por 2.'
    ],
    answer: 'Retorna o valor recebido multiplicado por 2.',
    keyword: 'return',
    reason: 'return devolve o resultado da expressao valor * 2 para quem chamou o metodo.',
    meaning: 'Devolve um resultado de metodo ou funcao.',
    child: 'O metodo recebe energia e devolve ela dobrada.',
    example: 'return valor * 2;'
  },
  {
    id: 'INT-JAVA-DEBUG-1',
    mode: 'quiz',
    quizType: 'debug',
    type: 'Quiz de Correcao',
    language: 'Java',
    difficulty: 'Hard',
    title: 'Java: ponto e virgula',
    prompt: 'Qual e o problema nesse codigo?',
    code: 'int poder = 9000\nSystem.out.println(poder);',
    options: [
      'Falta ponto e virgula no final da primeira linha.',
      'A variavel poder nao pode ser numero.',
      'System.out.println so funciona em Python.',
      'O valor 9000 precisa estar entre aspas.'
    ],
    answer: 'Falta ponto e virgula no final da primeira linha.',
    keyword: 'syntax',
    reason: 'Em Java, declaracoes como int poder = 9000 precisam terminar com ponto e virgula.',
    meaning: 'Regra de sintaxe para finalizar comando.',
    child: 'O ponto e virgula fecha o comando antes do proximo golpe.',
    example: 'int poder = 9000;'
  }
];

function buildTypingChallenges(csv) {
  return csvToObjects(csv).map((row, index) => {
    const language = row.linguagem || 'Python';
    const keyword = row.palavra_chave || 'codigo';
    const concept = findConcept(language, keyword);

    return {
      id: row.id || `TYPE-${index + 1}`,
      mode: 'typing',
      type: 'Desafio de Digitacao',
      language,
      difficulty: mapCsvDifficulty(row.dificuldade),
      title: row.titulo || `Pratica de ${keyword}`,
      prompt: row.descricao || `Crie um exemplo utilizando ${keyword}.`,
      code: row.objetivo || '',
      answer: keyword,
      keyword,
      reason: row.dica || `A pratica precisa demonstrar o uso de ${keyword}.`,
      meaning: concept.meaning,
      child: concept.child,
      example: concept.example,
      xpReward: Number(row.xp_recompensa || 120),
      timeLimit: Number(row.tempo_limite_segundos || 90)
    };
  }).filter((challenge) => challenge.prompt && challenge.keyword);
}

function buildCrosswordChallenges() {
  return aiEngineerRoadmap.map((item, index) => ({
    id: `ROAD-${index + 1}`,
    mode: 'crossword',
    type: 'Cruzada IA',
    language: 'AI Engineer',
    difficulty: index < 4 ? 'Basico' : index < 8 ? 'Intermediario' : index < 12 ? 'Dificil' : 'Hard',
    title: item.track,
    prompt: item.meaning,
    code: item.example,
    answer: item.term,
    keyword: item.term,
    reason: `${item.term}: ${item.meaning}`,
    meaning: item.meaning,
    child: `Pense no processo: ${item.track}. A palavra resolve uma etapa real de IA aplicada.`,
    example: item.example
  }));
}

const typingChallenges = buildTypingChallenges(typingCsv);
const crosswordChallenges = buildCrosswordChallenges();

const fallbackChallenges = [
  {
    id: 1,
    type: 'Complete o Codigo',
    language: 'Python',
    difficulty: 'Basico',
    title: 'Ative a aura',
    prompt: 'Complete a linha para mostrar a mensagem no console.',
    code: 'energia = 9000\n\nif energia > 8000:\n    ____("Super Saiyajin Ativado")',
    answer: 'print',
    keyword: 'print',
    reason: 'A funcao print e a instrucao correta para exibir a frase na tela dentro do bloco if.',
    meaning: 'Mostra uma informacao na tela.',
    child: 'O print e como gritar o resultado do treino para todo mundo ouvir.',
    example: 'print("Kamehameha!")'
  },
  {
    id: 2,
    type: 'Corrija o Erro',
    language: 'Python',
    difficulty: 'Basico',
    title: 'Scouter confuso',
    prompt: 'Corrija a condicao para comparar x com 10.',
    code: 'if x = 10:\n    print("Valor encontrado")',
    answer: 'if x == 10:',
    keyword: 'if',
    reason: 'Em Python, um sinal de igual atribui valor; dois sinais comparam se x e igual a 10.',
    meaning: 'Cria uma condicao.',
    child: 'O if pergunta ao scouter se algo e verdade antes de agir.',
    example: 'if poder > 9000:\n    print("Inimigo perigoso")'
  },
  {
    id: 3,
    type: 'Digite o Resultado',
    language: 'Python',
    difficulty: 'Basico',
    title: 'Treino de soma',
    prompt: 'Qual resultado aparece?',
    code: 'print(5 + 5)',
    answer: '10',
    keyword: 'operadores',
    reason: 'A expressao 5 + 5 e calculada antes do print, entao o valor exibido e 10.',
    meaning: 'Fazem contas e comparacoes.',
    child: 'Operadores sao golpes pequenos que juntam, tiram ou comparam poderes.',
    example: '3 + 2'
  },
  {
    id: 4,
    type: 'Quiz Rapido',
    language: 'JavaScript',
    difficulty: 'Intermediario',
    title: 'Botao da capsula',
    prompt: 'Qual recurso do JavaScript reage a cliques, teclas e movimentos?',
    code: 'button.addEventListener("click", iniciarLuta)',
    answer: 'eventos',
    keyword: 'eventos',
    reason: 'addEventListener conecta uma funcao a um evento, como clique ou tecla pressionada.',
    meaning: 'Acoes que acontecem na pagina.',
    child: 'Eventos sao sensores que avisam quando alguem apertou um botao.',
    example: 'elemento.addEventListener("click", atacar)'
  },
  {
    id: 5,
    type: 'Complete o Codigo',
    language: 'Java',
    difficulty: 'Dificil',
    title: 'Construa o guerreiro',
    prompt: 'Qual palavra cria uma classe em Java?',
    code: 'public ____ Guerreiro {\n  int poder;\n}',
    answer: 'class',
    keyword: 'class',
    reason: 'Java usa a palavra class para declarar o modelo de um objeto.',
    meaning: 'Modelo para criar objetos.',
    child: 'Uma classe e a ficha do personagem antes dele entrar na arena.',
    example: 'class Guerreiro { }'
  },
  {
    id: 6,
    type: 'Boss Battle',
    language: 'SQL',
    difficulty: 'Hard',
    title: 'Arquivo Supremo',
    prompt: 'Monte uma consulta que liste alunos com xp acima de 9000 em ordem decrescente.',
    code: 'Tabela: users(id, nome, xp)\n\nSELECT ...',
    answer: 'select nome from users where xp > 9000 order by xp desc',
    keyword: 'SELECT WHERE ORDER BY',
    reason: 'A consulta correta busca nomes, filtra xp acima de 9000 e ordena do maior para o menor.',
    meaning: 'Busca, filtra e ordena dados.',
    child: 'E como pedir ao Whis uma lista so dos guerreiros mais fortes, do maior para o menor.',
    example: 'SELECT nome FROM users WHERE xp > 9000 ORDER BY xp DESC'
  },
  {
    id: 7,
    type: 'Desafio Textual',
    language: 'Python',
    difficulty: 'Intermediario',
    title: 'Explique a capsula',
    prompt: 'Explique com suas palavras o que e uma variavel.',
    code: 'energia = 9000',
    answer: 'guardar valor nome',
    keyword: 'variavel',
    reason: 'Uma variavel e correta quando a explicacao fala que ela guarda um valor associado a um nome.',
    meaning: 'Guarda um valor para usar depois.',
    child: 'Variavel e uma capsula com etiqueta: voce guarda energia nela e usa quando precisar.',
    example: 'poder = 9000'
  }
];

const challenges = csvChallenges.length ? [...interpretiveQuizChallenges, ...csvChallenges] : [...interpretiveQuizChallenges, ...fallbackChallenges];
const challengesByMode = {
  quiz: challenges,
  typing: typingChallenges.length ? typingChallenges : fallbackChallenges,
  crossword: crosswordChallenges
};

function countBy(items, fields) {
  return items.reduce((totals, item) => {
    const key = fields.map((field) => item[field] || 'n/a').join('|');
    totals[key] = (totals[key] || 0) + 1;
    return totals;
  }, {});
}

function csvDiagnosticsFor(label, csv, loaded) {
  const rows = parseCsvRows(csv);
  const headers = rows[0] || [];
  return {
    label,
    delimiter: detectCsvDelimiter(csv),
    rawRows: Math.max(0, rows.length - 1),
    loadedRows: loaded.length,
    headers,
    byLanguageDifficulty: countBy(loaded, ['language', 'difficulty'])
  };
}

const challengeDiagnostics = {
  quiz: csvDiagnosticsFor('perguntas_programacao_4000.csv', questionsCsv, csvChallenges),
  typing: csvDiagnosticsFor('desafios_programacao_16000.csv', typingCsv, typingChallenges),
  crossword: {
    label: 'roadmap interno',
    rawRows: aiEngineerRoadmap.length,
    loadedRows: crosswordChallenges.length,
    byLanguageDifficulty: countBy(crosswordChallenges, ['language', 'difficulty'])
  }
};

const PROGRESS_STORAGE_KEY = 'codeKiProgressV2';

function progressStorageKey(game, language, level) {
  return `${game}|${language}|${level}`;
}

function debugLog(event, payload = {}) {
  if (typeof window === 'undefined') return;
  console.info(`[CodeKi] ${event}`, payload);
}

function readProgressState() {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(window.localStorage.getItem(PROGRESS_STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

function writeProgressState(state) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(state));
}

if (typeof window !== 'undefined') {
  window.__CODE_KI_DIAGNOSTICS__ = challengeDiagnostics;
  debugLog('csv.loaded', challengeDiagnostics);
}

const answerValidationRules = {
  1: {
    strategy: 'exact',
    accepted: ['print', 'print()'],
    minScore: 100
  },
  2: {
    strategy: 'code',
    accepted: ['if x == 10:', 'if x == 10'],
    minScore: 100
  },
  3: {
    strategy: 'number',
    accepted: ['10'],
    minScore: 100
  },
  4: {
    strategy: 'exact',
    accepted: ['eventos', 'evento', 'event listeners', 'event listener', 'addEventListener'],
    minScore: 96
  },
  5: {
    strategy: 'exact',
    accepted: ['class'],
    minScore: 100
  },
  6: {
    strategy: 'sql',
    requiredClauses: [
      ['select nome'],
      ['from users'],
      ['where xp > 9000', 'where xp>=9001', 'where xp >= 9001'],
      ['order by xp desc']
    ],
    blockedTerms: ['drop', 'delete', 'truncate', 'update', 'insert', 'alter'],
    minScore: 100
  },
  7: {
    strategy: 'concept',
    requiredIdeas: [
      ['guardar', 'armazena', 'salvar', 'guarda'],
      ['valor', 'informacao', 'dado'],
      ['nome', 'identificador', 'referencia', 'etiqueta']
    ],
    minScore: 78,
    allowFuzzy: true
  }
};

const ranks = [
  'Recruta Z',
  'Guerreiro do Codigo',
  'Super Programador',
  'Super Dev Saiyajin',
  'Ultra Instinct Developer'
];

const PLAYER_STORAGE_KEY = 'codeKiPlayerProfileV1';
const PLAYER_ACCOUNTS_STORAGE_KEY = 'codeKiPlayerAccountsV1';
const CURRENT_PLAYER_NICK_KEY = 'codeKiCurrentPlayerNickV1';

function playerLevelFromXp(value) {
  return Math.max(1, Math.floor(Number(value || 0) / 1400) + 1);
}

function playerRankFromXp(value) {
  return ranks[Math.min(ranks.length - 1, Math.floor(Number(value || 0) / 7000))];
}

function readPlayerProfile() {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(window.localStorage.getItem(PLAYER_STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
}

function writePlayerProfile(profile) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(profile));
  if (profile?.nick || profile?.name) {
    const accounts = readPlayerAccounts();
    const nick = profile.nick || profile.name;
    accounts[normalizeNick(nick)] = { ...profile, nick };
    writePlayerAccounts(accounts);
    window.localStorage.setItem(CURRENT_PLAYER_NICK_KEY, normalizeNick(nick));
  }
}

function normalizeNick(value) {
  return normalize(String(value || '').trim()).replace(/\s+/g, '-');
}

function readPlayerAccounts() {
  if (typeof window === 'undefined') return {};
  try {
    const accounts = JSON.parse(window.localStorage.getItem(PLAYER_ACCOUNTS_STORAGE_KEY) || '{}');
    const legacy = readPlayerProfile();
    if (legacy?.name && !accounts[normalizeNick(legacy.nick || legacy.name)]) {
      accounts[normalizeNick(legacy.nick || legacy.name)] = { ...legacy, nick: legacy.nick || legacy.name };
    }
    return accounts;
  } catch {
    return {};
  }
}

function writePlayerAccounts(accounts) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PLAYER_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function findPlayerByNick(nick) {
  const accounts = readPlayerAccounts();
  return accounts[normalizeNick(nick)] || null;
}

function createPlayerProfile({ name, nick, fighterName = 'Goku', activeLanguage = 'Python' }) {
  const fighter = fighters[fighterName] || fighters.Goku;
  const now = new Date().toISOString();
  const playerNick = (nick || name || 'Jogador').trim();
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `player-${Date.now()}`,
    nick: playerNick,
    name: playerNick,
    fighterName,
    fighterLabel: fighterDisplayName(fighterName, fighter),
    avatar: fighter.image,
    className: fighter.special,
    xp: 0,
    level: 1,
    rank: playerRankFromXp(0),
    coins: 120,
    crystals: 3,
    combo: 1,
    activeLanguage,
    difficulty: 'Basico',
    activeGame: 'quiz',
    progress: {},
    stats: {
      completed: 0,
      victories: 0,
      errors: 0,
      bestCombo: 1
    },
    history: [],
    createdAt: now,
    updatedAt: now
  };
}

const leaderboard = [
  ['Luna', 'Ultra Instinct Developer', 28400],
  ['Kai', 'Super Dev Saiyajin', 21950],
  ['Mika', 'Super Programador', 17330],
  ['Theo', 'Guerreiro do Codigo', 11200]
];

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[“”‘’]/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeCode(value) {
  return normalize(value)
    .replace(/[;'"`]/g, '')
    .replace(/\s*([(){}[\]:=<>+\-*/.,])\s*/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeSql(value) {
  return normalize(value)
    .replace(/[;'"`]/g, '')
    .replace(/\s*(>=|<=|<>|!=|=|>|<)\s*/g, ' $1 ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(value) {
  return normalize(value).match(/[a-z0-9_]+/g) || [];
}

function levenshtein(a, b) {
  const matrix = Array.from({ length: b.length + 1 }, (_, index) => [index]);
  for (let index = 0; index <= a.length; index += 1) matrix[0][index] = index;
  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      matrix[row][column] = b[row - 1] === a[column - 1]
        ? matrix[row - 1][column - 1]
        : Math.min(matrix[row - 1][column - 1] + 1, matrix[row][column - 1] + 1, matrix[row - 1][column] + 1);
    }
  }
  return matrix[b.length][a.length];
}

function tokenMatches(userTokens, idea, allowFuzzy = false) {
  const normalizedIdea = normalize(idea);
  if (userTokens.includes(normalizedIdea)) return true;
  if (!allowFuzzy || normalizedIdea.length < 5) return false;
  return userTokens.some((token) => token.length >= 5 && levenshtein(token, normalizedIdea) <= 1);
}

function readInvalidAttempts() {
  try {
    return JSON.parse(window.localStorage.getItem('codeKiInvalidAttempts') || '[]');
  } catch {
    return [];
  }
}

function logInvalidAttempt(challenge, rawAnswer, result) {
  if (!rawAnswer.trim()) return;
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    challengeId: challenge.id,
    title: challenge.title,
    type: challenge.type,
    language: challenge.language,
    difficulty: challenge.difficulty,
    rawAnswer,
    normalizedAnswer: normalize(rawAnswer),
    expected: challenge.answer,
    score: result.score,
    reason: result.reason,
    createdAt: new Date().toISOString()
  };
  const next = [entry, ...readInvalidAttempts()].slice(0, 50);
  window.localStorage.setItem('codeKiInvalidAttempts', JSON.stringify(next));
}

function playVictorySound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const context = new AudioContext();
    const now = context.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    master.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);
    master.connect(context.destination);

    notes.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const start = now + index * 0.09;
      oscillator.type = index === notes.length - 1 ? 'triangle' : 'sine';
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.34, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.24);
      oscillator.connect(gain);
      gain.connect(master);
      oscillator.start(start);
      oscillator.stop(start + 0.28);
    });

    window.setTimeout(() => context.close(), 900);
  } catch {
    // Audio is optional and may be blocked by the browser.
  }
}

function evaluateExactAnswer(rule, user, expected) {
  const accepted = (rule.accepted || [expected]).map(normalize);
  const ok = accepted.includes(user);
  const close = accepted.some((item) => item.startsWith(user) || user.startsWith(item));
  return { ok, score: ok ? 100 : close ? 55 : 24, reason: close ? 'partial_match_rejected' : 'exact_mismatch' };
}

function evaluateCodeAnswer(rule, value, expected) {
  const user = normalizeCode(value);
  const accepted = (rule.accepted || [expected]).map(normalizeCode);
  const ok = accepted.includes(user);
  const expectedTokens = tokenize(expected);
  const userTokens = tokenize(value);
  const hits = expectedTokens.filter((token) => userTokens.includes(token)).length;
  return { ok, score: ok ? 100 : Math.round((hits / Math.max(1, expectedTokens.length)) * 72), reason: ok ? 'accepted_code' : 'code_mismatch' };
}

function evaluateNumberAnswer(rule, user, expected) {
  const accepted = (rule.accepted || [expected]).map(normalize);
  const strictNumeric = /^-?\d+([.,]\d+)?$/;
  if (!strictNumeric.test(user)) return { ok: false, score: 12, reason: 'not_a_clean_number' };
  const ok = accepted.includes(user.replace(',', '.'));
  return { ok, score: ok ? 100 : 0, reason: ok ? 'accepted_number' : 'number_mismatch' };
}

function evaluateSqlAnswer(rule, value) {
  const user = normalizeSql(value);
  const blocked = (rule.blockedTerms || []).find((term) => tokenize(user).includes(term));
  if (blocked) return { ok: false, score: 0, reason: `blocked_sql_term:${blocked}` };
  const hits = rule.requiredClauses.filter((group) => group.some((clause) => user.includes(normalizeSql(clause)))).length;
  const score = Math.round((hits / rule.requiredClauses.length) * 100);
  return { ok: score >= rule.minScore, score, reason: score >= rule.minScore ? 'accepted_sql_structure' : 'missing_required_sql_clause' };
}

function evaluateConceptAnswer(rule, value) {
  const userTokens = tokenize(value);
  const hits = rule.requiredIdeas.filter((group) => group.some((idea) => tokenMatches(userTokens, idea, rule.allowFuzzy))).length;
  const lengthBonus = userTokens.length >= 6 ? 8 : 0;
  const score = Math.min(100, Math.round((hits / rule.requiredIdeas.length) * 92) + lengthBonus);
  return { ok: score >= rule.minScore, score, reason: score >= rule.minScore ? 'accepted_concept' : 'missing_required_concepts' };
}

function evaluateTypingChallenge(challenge, value) {
  const userTokens = tokenize(value);
  const keywordTokens = tokenize(challenge.keyword);
  const exampleTokens = tokenize(challenge.example);
  const keywordHits = keywordTokens.filter((token) => tokenMatches(userTokens, token, true)).length;
  const codeSignals = ['=', '(', ')', '{', '}', ':', ';', 'select', 'from', 'class', 'def', 'function', 'const', 'let', 'public']
    .filter((signal) => normalizeCode(value).includes(normalizeCode(signal))).length;
  const exampleHits = exampleTokens.filter((token) => userTokens.includes(token)).length;
  const score = Math.min(100, Math.round(keywordHits * 42 + codeSignals * 9 + exampleHits * 6));

  return {
    ok: score >= 55,
    score,
    reason: score >= 55 ? 'accepted_typing_practice' : 'typing_needs_keyword_or_code',
    confidence: score,
    message: score >= 55
      ? `Boa pratica. Voce demonstrou ${challenge.keyword} em contexto. ${challenge.reason}`
      : `A IA guia: use a palavra ${challenge.keyword} e escreva um exemplo mais parecido com codigo real.`
  };
}

function evaluateCrosswordChallenge(challenge, value) {
  const ok = normalize(value) === normalize(challenge.answer);
  const answerTokens = tokenize(challenge.answer);
  const userTokens = tokenize(value);
  const hits = answerTokens.filter((token) => userTokens.includes(token)).length;
  const score = ok ? 100 : Math.round((hits / Math.max(1, answerTokens.length)) * 55);

  return {
    ok,
    score,
    reason: ok ? 'accepted_crossword_term' : 'crossword_term_mismatch',
    confidence: ok ? 100 : score,
    message: ok
      ? `Resposta certa. ${challenge.reason}`
      : 'A IA guia: compare a pista, o exemplo e as letras reveladas antes de tentar de novo.'
  };
}

function evaluateAnswer(challenge, value) {
  if (challenge.mode === 'typing') return evaluateTypingChallenge(challenge, value);
  if (challenge.mode === 'crossword') return evaluateCrosswordChallenge(challenge, value);

  const rule = answerValidationRules[challenge.id] || { strategy: 'exact', accepted: [challenge.answer], minScore: 100 };
  const user = normalize(value);
  const expected = normalize(challenge.answer);

  if (!user) {
    return { ok: false, score: 0, confidence: 0, reason: 'empty_answer', message: 'Escolha uma alternativa para carregar sua energia.' };
  }

  const strategyResult = {
    exact: () => evaluateExactAnswer(rule, user, expected),
    code: () => evaluateCodeAnswer(rule, value, challenge.answer),
    number: () => evaluateNumberAnswer(rule, user, expected),
    sql: () => evaluateSqlAnswer(rule, value),
    concept: () => evaluateConceptAnswer(rule, value)
  }[rule.strategy]();

  const result = {
    ...strategyResult,
    confidence: strategyResult.score,
    message: strategyResult.ok
      ? `Resposta validada com confianca ${strategyResult.score}%. ${challenge.reason}`
      : strategyResult.reason === 'partial_match_rejected'
        ? 'A resposta parece parcial ou contem texto extra. Envie exatamente a resposta pedida.'
        : `Confianca ${strategyResult.score}%. Revise ${challenge.keyword}; faltou uma regra essencial da pergunta.`
  };

  if (!result.ok) logInvalidAttempt(challenge, value, result);
  return result;
}

function crosswordMask(answer, clueLevel) {
  const clean = normalize(answer).replace(/\s/g, '');
  let revealed = 0;
  return String(answer).split('').map((char) => {
    if (char === ' ') return ' ';
    revealed += 1;
    return revealed <= clueLevel ? char.toUpperCase() : '_';
  }).join(' ');
}

const welcomeLines = [
  'Bem-vindo(a), jogador.',
  'O sistema reconheceu sua presença.',
  'Sua jornada esta prestes a começar.',
  'Escolha seu personagem definitivo.',
  'Construa sua evolução.',
  'Acumule XP.',
  'Domine os desafios.'
];

function PlayerOnboarding({ onComplete }) {
  const [selected, setSelected] = React.useState('Goku');
  const [playerName, setPlayerName] = React.useState('');
  const [typedLines, setTypedLines] = React.useState([]);
  const [typedText, setTypedText] = React.useState('');
  const fighter = fighters[selected];

  React.useEffect(() => {
    let lineIndex = 0;
    let charIndex = 0;
    let cancelled = false;

    const typeNext = () => {
      if (cancelled) return;
      const line = welcomeLines[lineIndex];
      if (!line) return;
      setTypedText(line.slice(0, charIndex + 1));
      charIndex += 1;

      if (charIndex <= line.length) {
        window.setTimeout(typeNext, 28);
      } else {
        window.setTimeout(() => {
          if (cancelled) return;
          setTypedLines((current) => [...current, line]);
          setTypedText('');
          lineIndex += 1;
          charIndex = 0;
          typeNext();
        }, 360);
      }
    };

    const start = window.setTimeout(typeNext, 420);
    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, []);

  function confirmPlayer() {
    const profile = createPlayerProfile({ name: playerName, fighterName: selected });
    writePlayerProfile(profile);
    playVictorySound();
    debugLog('player.created', profile);
    onComplete(profile);
  }

  return (
    <main className="onboarding" style={{ '--accent': fighter.color }}>
      <div className="space-scene" aria-hidden="true">
        <div className="planet planet-one" />
        <div className="planet planet-two" />
        <div className="stars" />
        <div className="ki-field">
          {Array.from({ length: 42 }).map((_, index) => (
            <span key={index} style={{ '--delay': `${index * -0.31}s`, '--x': `${(index * 41) % 100}%` }} />
          ))}
        </div>
      </div>

      <motion.section
        className="onboarding-shell"
        initial={{ opacity: 0, scale: 0.96, y: 18 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.75, ease: 'easeOut' }}
      >
        <div className="onboarding-copy">
          <span className="eyebrow">Inicialização do jogador</span>
          <h1>Code Ki Arena</h1>
          <div className="typewriter-panel" aria-live="polite">
            {typedLines.map((line) => <p key={line}>{line}</p>)}
            {typedText && <p className="typing-line">{typedText}<b /></p>}
          </div>
          <label className="player-name-field">
            <span>Nome do jogador</span>
            <input value={playerName} onChange={(event) => setPlayerName(event.target.value)} placeholder="Jogador" maxLength={24} />
          </label>
          <div className="onboarding-xp-preview">
            <span>XP inicial</span>
            <strong>Nível 1</strong>
            <i><b style={{ width: '12%' }} /></i>
          </div>
        </div>

        <div className="onboarding-roster">
          <div className="onboarding-avatar" style={{ '--fighter-color': fighter.color }}>
            <div className="onboarding-ring">
              <div className="onboarding-fullbody" style={combatBodyStyle(fighter)} />
            </div>
            <strong>{fighterDisplayName(selected, fighter)}</strong>
            <span>{fighter.special}</span>
          </div>
          <div className="onboarding-cards">
            {Object.entries(fighters).map(([name, item]) => (
              <button
                key={name}
                className={selected === name ? 'active' : ''}
                onClick={() => setSelected(name)}
                style={{ '--fighter-color': item.color }}
              >
                <i style={portraitStyle(item)} />
                <strong>{fighterDisplayName(name, item)}</strong>
                <span>{item.attack}</span>
              </button>
            ))}
          </div>
          <div className="ability-grid">
            {fighter.transformations.map((item) => <span key={item}>{item}</span>)}
          </div>
          <button className="primary onboarding-confirm" onClick={confirmPlayer}>
            <Crown size={18} />Confirmar personagem definitivo
          </button>
        </div>
      </motion.section>
    </main>
  );
}

function AdminConsole({ onOpenPlayer }) {
  const accounts = readPlayerAccounts();
  const accountList = Object.values(accounts).sort((a, b) => String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
  const [nick, setNick] = React.useState(accountList[0]?.nick || accountList[0]?.name || '');
  const [selected, setSelected] = React.useState(resolveFighterName(accountList[0]?.fighterName || 'Goku'));
  const [status, setStatus] = React.useState('Verifique um nick para carregar ou criar uma conta.');
  const fighter = fighters[selected];

  function openNick() {
    const cleanNick = nick.trim();
    if (!cleanNick) {
      setStatus('Informe um nick para continuar.');
      return;
    }

    const existing = findPlayerByNick(cleanNick);
    if (existing) {
      writePlayerProfile(existing);
      debugLog('admin.player.load', { nick: cleanNick, id: existing.id });
      onOpenPlayer(existing);
      return;
    }

    const profile = createPlayerProfile({ nick: cleanNick, fighterName: selected });
    writePlayerProfile(profile);
    debugLog('admin.player.create', { nick: cleanNick, fighterName: selected });
    onOpenPlayer(profile);
  }

  return (
    <main className="admin-console" style={{ '--accent': fighter.color }}>
      <div className="space-scene" aria-hidden="true">
        <div className="planet planet-one" />
        <div className="planet planet-two" />
        <div className="stars" />
        <div className="ki-field">
          {Array.from({ length: 34 }).map((_, index) => (
            <span key={index} style={{ '--delay': `${index * -0.34}s`, '--x': `${(index * 43) % 100}%` }} />
          ))}
        </div>
      </div>

      <motion.section
        className="admin-console-shell"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="admin-console-main">
          <span className="eyebrow">Admin Console</span>
          <h1>Code Ki Control</h1>
          <p>Busque um jogador pelo nick. Se existir, a conta e o progresso sao carregados. Se nao existir, uma nova conta inicial e criada.</p>

          <label className="admin-nick-field">
            <span>Nick do jogador</span>
            <input value={nick} onChange={(event) => setNick(event.target.value)} placeholder="PiccoloMaster" maxLength={28} />
          </label>

          <div className="admin-console-actions">
            <button className="primary" onClick={openNick}><Users size={18} />Verificar jogador</button>
            <button onClick={() => setStatus('Admin controla acesso, perfil, progresso e arenas liberadas.')}>Validar acesso</button>
          </div>

          <div className="admin-status-line">
            <RadioTower size={18} />
            <span>{status}</span>
          </div>

          <div className="admin-account-list">
            <strong>Contas recentes</strong>
            {(accountList.length ? accountList.slice(0, 5) : [{ nick: 'Nenhuma conta local', xp: 0, fighterName: 'Goku' }]).map((profile) => (
              <button
                key={profile.id || profile.nick}
                onClick={() => {
                  if (!profile.id) return;
                  setNick(profile.nick || profile.name);
                  setSelected(resolveFighterName(profile.fighterName));
                  writePlayerProfile(profile);
                  onOpenPlayer(profile);
                }}
              >
                <i style={portraitStyle(fighters[resolveFighterName(profile.fighterName)] || fighters.Goku)} />
                <span>{profile.nick || profile.name}</span>
                <b>{Number(profile.xp || 0).toLocaleString('pt-BR')} XP</b>
              </button>
            ))}
          </div>
        </div>

        <div className="admin-console-side">
          <div className="admin-preview-card" style={{ '--fighter-color': fighter.color }}>
            <div className="admin-preview-body" style={combatBodyStyle(fighter)} />
            <strong>{fighterDisplayName(selected, fighter)}</strong>
            <span>{fighter.special}</span>
          </div>
          <div className="admin-roster-grid">
            {Object.entries(fighters).map(([name, item]) => (
              <button
                key={name}
                className={selected === name ? 'active' : ''}
                style={{ '--fighter-color': item.color }}
                onClick={() => setSelected(name)}
              >
                <i style={portraitStyle(item)} />
                <span>{fighterDisplayName(name, item)}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  );
}

function GameApp({ playerProfile, onPlayerUpdate, onAdminConsole }) {
  const [activeLanguage, setActiveLanguage] = React.useState(playerProfile.activeLanguage || 'Python');
  const [difficulty, setDifficulty] = React.useState(playerProfile.difficulty || 'Basico');
  const [activeGame, setActiveGame] = React.useState(playerProfile.activeGame || 'quiz');
  const [activeIndex, setActiveIndex] = React.useState(() => readProgressState()[progressStorageKey(playerProfile.activeGame || 'quiz', playerProfile.activeLanguage || 'Python', playerProfile.difficulty || 'Basico')] || 0);
  const [progressState, setProgressState] = React.useState(() => ({ ...readProgressState(), ...(playerProfile.progress || {}) }));
  const [answer, setAnswer] = React.useState('');
  const [feedback, setFeedback] = React.useState(null);
  const [clueLevel, setClueLevel] = React.useState(1);
  const [xp, setXp] = React.useState(playerProfile.xp || 0);
  const [coins, setCoins] = React.useState(playerProfile.coins || 120);
  const [crystals, setCrystals] = React.useState(playerProfile.crystals || 3);
  const [combo, setCombo] = React.useState(playerProfile.combo || 1);
  const [history, setHistory] = React.useState(playerProfile.history || []);
  const [mode, setMode] = React.useState('aluno');
  const [page, setPage] = React.useState('arena');
  const [gameStarted, setGameStarted] = React.useState(false);
  const [selectedFighter, setSelectedFighter] = React.useState(() => resolveFighterName(playerProfile.fighterName));
  const [hp, setHp] = React.useState(100);
  const [bossHp, setBossHp] = React.useState(100);
  const [ki, setKi] = React.useState(42);
  const [battleEvent, setBattleEvent] = React.useState('idle');
  const [damageText, setDamageText] = React.useState(null);
  const [narration, setNarration] = React.useState('Narrador IA: escolha uma resposta e transforme codigo em ataque.');
  const [invalidAttempts, setInvalidAttempts] = React.useState(() => readInvalidAttempts());
  const [playerStats, setPlayerStats] = React.useState(playerProfile.stats || {
    completed: 0,
    victories: 0,
    errors: 0,
    bestCombo: combo
  });

  const filtered = React.useMemo(() => {
    const source = challengesByMode[activeGame] || challenges;
    if (activeGame === 'crossword') {
      return source.filter((item) => item.difficulty === difficulty);
    }
    const list = source.filter((item) => item.language === activeLanguage && item.difficulty === difficulty);
    return list.length ? list : source.filter((item) => item.language === activeLanguage);
  }, [activeGame, activeLanguage, difficulty]);

  const challenge = filtered[activeIndex % filtered.length] || challengesByMode[activeGame]?.[0] || challenges[0];
  const language = languages[activeLanguage];
  const activeGameMeta = gameModes[activeGame];
  const fighter = fighters[selectedFighter];
  const boss = difficultyBosses[difficulty] || bosses[activeLanguage];
  const transformIndex = Math.min(fighter.transformations.length - 1, Math.floor(ki / 34));
  const transformation = fighter.transformations[transformIndex];
  const bossPhase = boss.phases[Math.min(boss.phases.length - 1, Math.floor((100 - bossHp) / 34))];
  const rank = ranks[Math.min(ranks.length - 1, Math.floor(xp / 7000))];
  const comboLevel = combo >= 8 ? 'x20' : combo >= 5 ? 'x10' : combo >= 3 ? 'x5' : combo >= 2 ? 'x2' : 'x1';

  function getSavedIndex(game = activeGame, lang = activeLanguage, level = difficulty) {
    return progressState[progressStorageKey(game, lang, level)] || 0;
  }

  function resetChallengeUi(message) {
    setAnswer('');
    setFeedback(null);
    setClueLevel(1);
    if (message) setNarration(message);
  }

  function launchGame(key) {
    const item = gameModes[key];
    if (!item) return;
    const savedIndex = getSavedIndex(key, activeLanguage, difficulty);
    setActiveGame(key);
    setActiveIndex(savedIndex);
    setGameStarted(true);
    resetChallengeUi(`Narrador IA: ${item.label} carregado. Arena pronta para iniciar o combate.`);
    debugLog('route.game.launch', { mode: key, language: activeLanguage, difficulty, restoredIndex: savedIndex });
  }

  function chooseFighter(name) {
    const nextFighter = fighters[name];
    if (!nextFighter || name === selectedFighter) return;
    setSelectedFighter(name);
    setHp(100);
    setBossHp(100);
    setKi(42);
    setBattleEvent('transform');
    setDamageText(null);
    resetChallengeUi(`Narrador IA: ${fighterDisplayName(name, nextFighter)} assumiu o perfil principal. XP e progresso continuam vinculados ao jogador.`);
    debugLog('player.fighter.change', {
      previous: selectedFighter,
      next: name,
      display: fighterDisplayName(name, nextFighter)
    });
  }

  React.useEffect(() => {
    const key = progressStorageKey(activeGame, activeLanguage, difficulty);
    setProgressState((current) => {
      if (current[key] === activeIndex) return current;
      const next = { ...current, [key]: activeIndex };
      writeProgressState(next);
      return next;
    });
    debugLog('progress.save', {
      mode: activeGame,
      language: activeLanguage,
      difficulty,
      activeIndex,
      visibleQuestion: (activeIndex % Math.max(1, filtered.length)) + 1,
      totalVisible: filtered.length,
      challengeId: challenge?.id
    });
  }, [activeGame, activeLanguage, difficulty, activeIndex, filtered.length, challenge?.id]);

  React.useEffect(() => {
    const nextProfile = {
      ...playerProfile,
      fighterName: selectedFighter,
      fighterLabel: fighterDisplayName(selectedFighter, fighter),
      avatar: fighter.image,
      className: fighter.special,
      xp,
      level: playerLevelFromXp(xp),
      rank: playerRankFromXp(xp),
      coins,
      crystals,
      combo,
      activeLanguage,
      difficulty,
      activeGame,
      progress: progressState,
      stats: playerStats,
      history,
      updatedAt: new Date().toISOString()
    };
    writePlayerProfile(nextProfile);
    onPlayerUpdate(nextProfile);
    debugLog('player.persist', {
      id: nextProfile.id,
      fighterName: nextProfile.fighterName,
      xp: nextProfile.xp,
      level: nextProfile.level,
      activeLanguage,
      difficulty,
      activeGame
    });
  }, [xp, coins, crystals, combo, activeLanguage, difficulty, activeGame, progressState, playerStats, history, selectedFighter]);

  function submit(selectedAnswer = answer) {
    debugLog('challenge.submit', {
      mode: activeGame,
      language: activeLanguage,
      difficulty,
      activeIndex,
      filteredTotal: filtered.length,
      challengeId: challenge.id,
      selectedAnswer
    });
    setAnswer(selectedAnswer);
    const result = evaluateAnswer(challenge, selectedAnswer);
    debugLog('challenge.result', {
      challengeId: challenge.id,
      ok: result.ok,
      score: result.score,
      expected: challenge.answer
    });
    if (!result.ok) setInvalidAttempts(readInvalidAttempts());
    if (!result.ok && challenge.mode === 'crossword') {
      setClueLevel((current) => Math.min(normalize(challenge.answer).replace(/\s/g, '').length, current + 1));
    }
    if (result.ok) playVictorySound();
    const speed = Math.floor(80 + Math.random() * 20);
    const logic = result.ok ? result.score : Math.max(20, result.score - 10);
    const creativity = challenge.type === 'Desafio Textual' ? result.score : Math.floor(70 + Math.random() * 25);
    const nextCombo = result.ok ? combo + 1 : 1;
    const multiplier = nextCombo >= 8 ? 20 : nextCombo >= 5 ? 10 : nextCombo >= 3 ? 5 : nextCombo >= 2 ? 2 : 1;
    const gained = result.ok ? Math.round((80 + logic + speed) * multiplier * 0.45) : 20;
    const dealt = result.ok ? Math.min(36, Math.round(8 + multiplier * 3 + transformIndex * 4)) : 0;
    const taken = result.ok ? 0 : Math.min(24, 10 + Math.floor(Math.random() * 9));
    const nextKi = result.ok ? Math.min(100, ki + 18 + multiplier * 2) : Math.max(0, ki - 14);
    const transformed = result.ok && ki < 100 && nextKi >= 100;

    setFeedback({ ...result, speed, logic, creativity, gained, multiplier, id: `${challenge.id}-${Date.now()}` });
    setXp((current) => current + gained);
    setCoins((current) => current + (result.ok ? 18 * multiplier : 2));
    setCrystals((current) => current + (result.ok && challenge.difficulty === 'Hard' ? 1 : 0));
    setCombo(nextCombo);
    setPlayerStats((current) => ({
      completed: current.completed + 1,
      victories: current.victories + (result.ok ? 1 : 0),
      errors: current.errors + (result.ok ? 0 : 1),
      bestCombo: Math.max(current.bestCombo || 1, nextCombo)
    }));
    setKi(nextKi);
    setBossHp((current) => Math.max(0, current - dealt));
    setHp((current) => Math.max(0, current - taken));
    setBattleEvent(result.ok ? (transformed ? 'transform' : 'attack') : 'hit');
    setDamageText(result.ok ? `-${dealt}` : `-${taken}`);
    setNarration(result.ok
      ? `Narrador IA: ${fighterDisplayName(selectedFighter, fighter)} acertou ${challenge.keyword} e disparou ${fighter.attack}. ${transformed ? 'Transformacao automatica ativada!' : 'Combo aumentando.'}`
      : `Narrador IA: ${fighterDisplayName(selectedFighter, fighter)} sentiu o impacto. ${boss.name} usou ${boss.special}. Revise ${challenge.keyword}.`);
    setHistory((current) => [
      {
        title: challenge.title,
        language: challenge.language,
        difficulty: challenge.difficulty,
        ok: result.ok,
        gained,
        date: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      },
      ...current
    ].slice(0, 8));

    window.setTimeout(() => setBattleEvent('idle'), 1200);
  }

  function nextChallenge() {
    resetChallengeUi();
    setActiveIndex((value) => {
      const nextIndex = value + 1;
      debugLog('challenge.next', {
        mode: activeGame,
        language: activeLanguage,
        difficulty,
        fromIndex: value,
        toIndex: nextIndex,
        totalVisible: filtered.length,
        fromChallengeId: challenge?.id,
        toChallengeId: filtered[nextIndex % Math.max(1, filtered.length)]?.id
      });
      return nextIndex;
    });
    if (bossHp <= 0) {
      setBossHp(100);
      setKi(55);
      setNarration(`Narrador IA: boss derrotado. Nova fase holografica aberta em ${language.planet}.`);
    }
    if (hp <= 0) {
      setHp(100);
      setKi(20);
      setCombo(1);
      setNarration('Narrador IA: recuperacao concluida. Entre de novo na arena com calma e precisao.');
    }
  }

  return (
    <main className="app" style={{ '--accent': language.color }}>
      <div className="space-scene" aria-hidden="true">
        <div className="planet planet-one" />
        <div className="planet planet-two" />
        <div className="stars" />
        <div className="ki-field">
          {Array.from({ length: 36 }).map((_, index) => (
            <span key={index} style={{ '--delay': `${index * -0.37}s`, '--x': `${(index * 47) % 100}%` }} />
          ))}
        </div>
      </div>

      <header className="topbar">
        <div className="brand">
          <div className="brand-mark"><Sparkles size={22} /></div>
          <div>
            <strong>Code Ki Arena</strong>
            <span>Academia interativa de programacao</span>
          </div>
        </div>
        <div className="mode-switch" role="tablist" aria-label="Modo de acesso">
          <button className={page === 'arena' && mode === 'aluno' ? 'active' : ''} onClick={() => { setMode('aluno'); setPage('arena'); setGameStarted(false); }}><Gamepad2 size={16} />Desafios</button>
          <button className={page === 'biblioteca' ? 'active' : ''} onClick={() => setPage('biblioteca')}><BookOpen size={16} />Biblioteca</button>
          <button className={page === 'personagens' ? 'active' : ''} onClick={() => setPage('personagens')}><Users size={16} />Personagens</button>
          <button onClick={onAdminConsole} title="Voltar ao Admin Console"><Lock size={16} />Admin Console</button>
        </div>
      </header>

      {page === 'biblioteca' ? (
        <LibraryPage />
      ) : page === 'personagens' ? (
        <CharactersPage />
      ) : (
        <>
      {!gameStarted ? (
        <section className="game-opening">
          <div className="game-opening-copy">
            <span className="eyebrow">QUIZ INTERPRETACAO</span>
            <h1>Escolha o jogo antes da arena abrir</h1>
            <p>O primeiro bloco agora e uma central de entrada. O aluno escolhe o tipo de desafio, o sistema prepara a saga e a tela muda para combate com perfil, arena e dicionario de apoio.</p>
            <div className="opening-player-card">
              <div className="avatar-ring">
                <div className="avatar-core">
                  <i className="player-avatar-mini" style={portraitStyle(fighter)} />
                </div>
              </div>
              <div>
                <strong>{playerProfile.name}</strong>
                <span>Nivel {playerLevelFromXp(xp)} | {rank}</span>
                <small>{fighterDisplayName(selectedFighter, fighter)} em {language.planet}</small>
              </div>
            </div>
          </div>

          <div className="opening-game-select">
            {Object.entries(gameModes).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <button
                  key={key}
                  className={activeGame === key ? 'active' : ''}
                  onClick={() => launchGame(key)}
                >
                  <span className="opening-game-icon"><Icon size={26} /></span>
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                  <ChevronRight size={24} />
                </button>
              );
            })}
          </div>

          <div className="opening-preview-stage" style={{ '--fighter-color': fighter.color }}>
            <div className="opening-grid-floor" />
            <div className="opening-preview-body" style={combatBodyStyle(fighter)} />
            <div className="opening-preview-panel">
              <strong>{activeGameMeta.label}</strong>
              <span>{activeLanguage} Planet | {difficulty}</span>
            </div>
          </div>
        </section>
      ) : (
        <>
      <section className="hero-grid">
        <aside className="pilot-panel">
          <button className="change-game-button" onClick={() => setGameStarted(false)}>
            <ChevronRight size={16} />
            Trocar jogo
          </button>
          <div className="game-sidebar-head">
            <span className="eyebrow">Card do usuario</span>
            <h1>{playerProfile.name}</h1>
            <p>{fighterDisplayName(selectedFighter, fighter)} pronto para {activeGameMeta.label} em {language.planet}.</p>
          </div>
          <div className="game-mode-list">
            {Object.entries(gameModes).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <button
                  key={key}
                  className={activeGame === key ? 'active' : ''}
                  onClick={() => {
                    launchGame(key);
                  }}
                >
                  <Icon size={18} />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.description}</small>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="sidebar-rank">
            <div className="avatar-ring">
              <div className="avatar-core">
                <i className="player-avatar-mini" style={portraitStyle(fighter)} />
              </div>
            </div>
            <div>
              <strong>{playerProfile.name}</strong>
              <span>Nível {playerLevelFromXp(xp)} | {rank}</span>
              <small>{fighterDisplayName(selectedFighter, fighter)} em {language.planet}</small>
            </div>
          </div>
          <div className="fighter-picker-head">
            <span>Personagem principal</span>
            <strong>{Object.keys(fighters).length} disponiveis</strong>
          </div>
          <div className="fighter-picker" aria-label="Escolha de personagem principal">
            {Object.entries(fighters).map(([name, item]) => (
              <button
                key={name}
                className={selectedFighter === name ? 'active' : ''}
                onClick={() => chooseFighter(name)}
                style={{ '--fighter-color': item.color }}
                title={selectedFighter === name ? 'Personagem ativo' : 'Selecionar personagem principal'}
              >
                <i style={portraitStyle(item)} />
                <span>
                  <b>{fighterDisplayName(name, item)}</b>
                  <small>{item.special}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="stats-grid">
            <Stat icon={Rocket} label="XP" value={xp.toLocaleString('pt-BR')} />
            <Stat icon={Medal} label="Moedas" value={coins} />
            <Stat icon={Sparkles} label="Cristais" value={crystals} />
            <Stat icon={Zap} label="Combo" value={comboLevel} />
          </div>
          <div className="progress-track">
            <span style={{ width: `${Math.min(100, (xp % 7000) / 70)}%` }} />
          </div>
        </aside>

        <section className="arena">
          <div className="arena-head">
            <div>
              <span className="eyebrow">{challenge.type}</span>
              <h2>{challenge.title}</h2>
              <small className="question-progress">Pergunta {(activeIndex % Math.max(1, filtered.length)) + 1} de {filtered.length}</small>
            </div>
            <div className={`combo ${combo > 2 ? 'charged' : ''}`}>
              <Zap size={18} />
              {comboLevel}
            </div>
          </div>

          <BattleArena
            language={language}
            fighterName={fighterDisplayName(selectedFighter, fighter)}
            fighter={fighter}
            boss={boss}
            bossPhase={bossPhase}
            transformation={transformation}
            hp={hp}
            bossHp={bossHp}
            ki={ki}
            comboLevel={comboLevel}
            battleEvent={battleEvent}
            damageText={damageText}
            narration={narration}
          />

          <p className="prompt">{challenge.prompt}</p>
          {challenge.code && <pre className="code-block">{challenge.code}</pre>}

          {challenge.mode === 'crossword' ? (
            <div className="crossword-play">
              <div className="crossword-mask">{crosswordMask(challenge.answer, clueLevel)}</div>
              <div className="ai-guide">
                <Brain size={18} />
                <span>IA guia: {feedback?.ok ? 'conceito fixado.' : `a palavra tem ${normalize(challenge.answer).replace(/\s/g, '').length} letras; cada erro revela mais uma letra.`}</span>
              </div>
              <div className="answer-row">
                <input
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Digite a palavra da cruzada"
                  disabled={Boolean(feedback?.ok)}
                />
                <button className="primary" onClick={() => submit()} disabled={Boolean(feedback?.ok)}><Play size={18} />Validar</button>
              </div>
            </div>
          ) : challenge.options?.length ? (
            <div className="million-options" aria-label="Alternativas da pergunta">
              {challenge.options.map((option, index) => (
                <button
                  key={`${challenge.id}-${index}-${option}`}
                  className={answer === option ? 'selected' : ''}
                  onClick={() => submit(option)}
                  disabled={Boolean(feedback)}
                >
                  <span>{String.fromCharCode(65 + index)}</span>
                  <strong>{option}</strong>
                </button>
              ))}
            </div>
          ) : (
            <>
              <div className="ai-guide">
                <Brain size={18} />
                <span>IA guia: escreva um exemplo prático usando {challenge.keyword}; vale código, comando ou explicação técnica aplicada.</span>
              </div>
              <div className="answer-row">
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  placeholder="Digite sua resposta aqui..."
                  rows={4}
                />
                <button className="primary" onClick={() => submit()}><Play size={18} />Enviar golpe</button>
              </div>
            </>
          )}
        </section>

        <aside className="keyword-panel">
          <AnimatePresence>
            {feedback?.ok && (
              <motion.div
                key={feedback.id}
                className="victory-callout"
                initial={{ opacity: 0, scale: 0.72, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.86 }}
                transition={{ type: 'spring', stiffness: 260, damping: 15 }}
              >
                <Trophy size={34} />
                <span>VITORIA</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {feedback && (
              <motion.div
                key={`side-${feedback.id}`}
                className={`feedback side-feedback ${feedback.ok ? 'success' : 'error'}`}
                initial={{ opacity: 0, x: 28, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 16 }}
              >
                <div>
                  <strong>{feedback.ok ? 'Vitoria no desafio' : 'Energia instavel'}</strong>
                  <span>{feedback.message}</span>
                  {feedback.ok && <small>Motivo: {challenge.reason}</small>}
                </div>
                <div className="score-capsules">
                  <span>+{feedback.gained} XP</span>
                  <span>Confianca {feedback.confidence}%</span>
                  <span>Logica {feedback.logic}%</span>
                  <span>Velocidade {feedback.speed}%</span>
                </div>
                <button onClick={nextChallenge}><ChevronRight size={18} />Proximo</button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="correct-answer side-answer">
            <span>{feedback ? 'Resposta correta' : (challenge.quizType ? 'Tipo de leitura' : 'Pergunta valendo')}</span>
            <code>{feedback ? challenge.answer : (challenge.quizType || `${challenge.options?.length || 4} alternativas`)}</code>
          </div>

          <div className="panel-title"><Brain size={18} /> {challenge.quizType ? 'Interpretacao' : 'Palavra-chave'}</div>
          <h3>{challenge.keyword}</h3>
          <dl>
            <dt>Significado</dt>
            <dd>{challenge.meaning}</dd>
            <dt>Dica de uso</dt>
            <dd>{challenge.child}</dd>
            <dt>Exemplo</dt>
            <dd><code>{challenge.example}</code></dd>
          </dl>
        </aside>
      </section>

      <section className="control-deck">
        <div className="deck-section">
          <div className="section-head"><BookOpen size={18} /> {activeGame === 'crossword' ? 'Trilha ativa' : 'Sagas'}</div>
          <div className="language-grid">
            {activeGame === 'crossword' ? (
              <button className="language-card active roadmap-card" style={{ '--card-accent': language.color }}>
                <Brain size={22} />
                <strong>AI Engineer</strong>
                <span>LLMs, RAG, agentes, safety e deploy</span>
              </button>
            ) : Object.entries(languages).map(([name, item]) => {
              const Icon = item.icon;
              return (
                <button
                  key={name}
                  className={activeLanguage === name ? 'language-card active' : 'language-card'}
                  onClick={() => {
                    const savedIndex = getSavedIndex(activeGame, name, difficulty);
                    setActiveLanguage(name);
                    setActiveIndex(savedIndex);
                    resetChallengeUi(`Narrador IA: saga ${name} ativada em ${item.planet}.`);
                    debugLog('route.language', { mode: activeGame, language: name, difficulty, restoredIndex: savedIndex });
                  }}
                  style={{ '--card-accent': item.color }}
                >
                  <Icon size={22} />
                  <strong>{name}</strong>
                  <span>{item.planet}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="deck-section">
          <div className="section-head"><Activity size={18} /> Dificuldade</div>
          <div className="difficulty-row">
            {difficulties.map((item) => (
              <button
                key={item}
                className={difficulty === item ? 'active' : ''}
                onClick={() => {
                  const savedIndex = getSavedIndex(activeGame, activeLanguage, item);
                  setDifficulty(item);
                  setActiveIndex(savedIndex);
                  resetChallengeUi(`Narrador IA: dificuldade ${item} sincronizada.`);
                  debugLog('route.difficulty', { mode: activeGame, language: activeLanguage, difficulty: item, restoredIndex: savedIndex });
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </section>

      {mode === 'aluno' ? (
        <StudentDashboard
          history={history}
          activeLanguage={activeLanguage}
          playerProfile={{ ...playerProfile, fighterName: selectedFighter, xp, coins, crystals, combo }}
          fighter={fighter}
          difficulty={difficulty}
          activeGame={activeGame}
          boss={boss}
        />
      ) : (
        <AdminDashboard invalidAttempts={invalidAttempts} onReturnUser={() => { setMode('aluno'); setPage('arena'); }} />
      )}
        </>
      )}
        </>
      )}
    </main>
  );
}

function ThreeBattleScene({ fighter, boss, battleEvent, hp, bossHp, ki, accent }) {
  const mountRef = React.useRef(null);
  const propsRef = React.useRef({ fighter, boss, battleEvent, hp, bossHp, ki, accent });
  const actionRef = React.useRef({ event: battleEvent, startedAt: performance.now() });

  React.useEffect(() => {
    propsRef.current = { fighter, boss, battleEvent, hp, bossHp, ki, accent };
  }, [fighter, boss, battleEvent, hp, bossHp, ki, accent]);

  React.useEffect(() => {
    actionRef.current = { event: battleEvent, startedAt: performance.now() };
  }, [battleEvent]);

  React.useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 1.62, 5.15);
    camera.lookAt(0, 0.58, 0);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x7ddcff, 3.6, 18);
    keyLight.position.set(-3.5, 4, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0xff4d8f, 3.2, 18);
    rimLight.position.set(3.4, 3.3, 3.6);
    scene.add(rimLight);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.25, 96),
      new THREE.MeshBasicMaterial({
        color: 0x123d58,
        transparent: true,
        opacity: 0.16,
        side: THREE.DoubleSide,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.22;
    scene.add(floor);

    const grid = new THREE.GridHelper(8.2, 18, 0x45d9ff, 0x16495e);
    grid.position.y = -1.2;
    grid.material.transparent = true;
    grid.material.opacity = 0.24;
    grid.material.depthWrite = false;
    scene.add(grid);

    const backHaloMaterial = new THREE.MeshBasicMaterial({
      color: 0x45d9ff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
    });
    const backHalos = [2.15, 2.85].map((radius, index) => {
      const halo = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.015, 12, 128), backHaloMaterial.clone());
      halo.position.set(0, 0.46, -1.42 - index * 0.08);
      halo.scale.y = 0.62;
      scene.add(halo);
      return halo;
    });

    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x27d9ff,
      transparent: true,
      opacity: 0.28,
    });
    const rings = [1.55, 2.35, 3.15].map((radius, index) => {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, 0.012, 10, 96), ringMaterial.clone());
      ring.rotation.x = Math.PI / 2;
      ring.position.y = -1.08 + index * 0.015;
      scene.add(ring);
      return ring;
    });

    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.075, 4.65, 18, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x7efcff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    );
    beam.rotation.z = Math.PI / 2;
    beam.position.set(0, 0.7, 0.05);
    scene.add(beam);

    const beamGlow = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 4.9, 20, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x7efcff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    );
    beamGlow.rotation.z = Math.PI / 2;
    beamGlow.position.copy(beam.position);
    scene.add(beamGlow);

    const beamCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.018, 4.6, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      })
    );
    beamCore.rotation.z = Math.PI / 2;
    beamCore.position.copy(beam.position);
    scene.add(beamCore);

    const particleCount = 230;
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 4.2;
      particlePositions[index * 3] = Math.cos(angle) * radius;
      particlePositions[index * 3 + 1] = -1.12 + Math.random() * 3.1;
      particlePositions[index * 3 + 2] = Math.sin(angle) * radius * 0.45;
      particleColors[index * 3] = 0.25 + Math.random() * 0.45;
      particleColors[index * 3 + 1] = 0.65 + Math.random() * 0.35;
      particleColors[index * 3 + 2] = 1;
    }
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particles = new THREE.Points(
      particlesGeometry,
      new THREE.PointsMaterial({
        size: 0.04,
        vertexColors: true,
        transparent: true,
        opacity: 0.72,
        blending: THREE.AdditiveBlending,
      })
    );
    scene.add(particles);

    const loader = new THREE.TextureLoader();
    const makeSprite = (color) => {
      const material = new THREE.SpriteMaterial({
        color,
        transparent: true,
        opacity: 1,
        depthWrite: false,
      });
      const sprite = new THREE.Sprite(material);
      sprite.center.set(0.5, 0.08);
      scene.add(sprite);
      return sprite;
    };

    const ally = makeSprite(0xffffff);
    const enemy = makeSprite(0xffffff);
    ally.position.set(-1.58, -1.18, 0.28);
    enemy.position.set(1.58, -1.16, -0.26);
    ally.scale.set(2.68, 4.12, 1);
    enemy.scale.set(2.76, 4.22, 1);

    const allyAura = new THREE.Mesh(
      new THREE.SphereGeometry(0.9, 32, 32),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent || '#31d0ff'),
        transparent: true,
        opacity: 0.13,
        blending: THREE.AdditiveBlending,
      })
    );
    allyAura.scale.set(1.05, 1.95, 0.42);
    scene.add(allyAura);

    const enemyAura = allyAura.clone();
    enemyAura.material = new THREE.MeshBasicMaterial({
      color: 0xff4d8f,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });
    scene.add(enemyAura);

    const loadedTextures = new Map();
    const applyTexture = (sprite, url) => {
      if (!url) return;
      if (loadedTextures.get(sprite)?.url === url) return;
      loader.load(url, (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        sprite.material.map = texture;
        sprite.material.color.set(0xffffff);
        sprite.material.needsUpdate = true;
        loadedTextures.set(sprite, { url, texture });
      });
    };

    const resize = () => {
      const rect = mount.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frameId = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      const elapsed = clock.getElapsedTime();
      const latest = propsRef.current;
      const action = actionRef.current;
      const actionAge = Math.min(1, (performance.now() - action.startedAt) / 900);
      const actionPulse = Math.sin(Math.PI * actionAge);
      const isAttack = action.event === 'attack';
      const isHit = action.event === 'hit';
      const isTransform = action.event === 'transform';
      const isVictory = latest.bossHp <= 0;
      const isDefeat = latest.hp <= 0;

      applyTexture(ally, resolveCharacterTexture(latest.fighter));
      applyTexture(enemy, resolveCharacterTexture(latest.boss));

      const accentColor = new THREE.Color(latest.accent || '#31d0ff');
      keyLight.color.copy(accentColor);
      allyAura.material.color.copy(accentColor);
      ringMaterial.color.copy(accentColor);
      rings.forEach((ring, index) => {
        ring.rotation.z = elapsed * (0.15 + index * 0.05);
        ring.material.opacity = 0.18 + Math.sin(elapsed * 2 + index) * 0.045;
      });
      backHalos.forEach((halo, index) => {
        halo.rotation.z = elapsed * (0.06 + index * 0.035);
        halo.material.color.copy(accentColor);
        halo.material.opacity = 0.13 + Math.sin(elapsed * 1.7 + index) * 0.035 + (isTransform ? actionPulse * 0.16 : 0);
      });

      const allyBaseX = -1.58 + (isAttack ? actionPulse * 0.92 : 0) + (isHit ? -actionPulse * 0.48 : 0);
      const enemyBaseX = 1.58 + (isAttack ? actionPulse * 0.3 : 0);
      const breathe = Math.sin(elapsed * 2.4) * 0.06;
      const allyLift = breathe + (isTransform ? actionPulse * 0.75 : 0) + (isVictory ? Math.sin(elapsed * 7) * 0.14 + 0.35 : 0);
      const enemyLift = -Math.abs(Math.sin(elapsed * 2.1)) * 0.025 + (isAttack ? actionPulse * 0.18 : 0);

      ally.position.set(allyBaseX, -1.2 + allyLift, 0.15 + Math.sin(elapsed * 1.2) * 0.08);
      enemy.position.set(enemyBaseX, -1.18 + enemyLift, -0.32 + Math.cos(elapsed) * 0.05);
      ally.scale.set(2.68 + (isTransform ? actionPulse * 0.5 : 0), 4.12 + (isTransform ? actionPulse * 0.56 : 0), 1);
      enemy.scale.set(2.76, isVictory ? 1.92 : 4.22, 1);

      ally.material.rotation = Math.sin(elapsed * 1.8) * 0.018 + (isAttack ? -actionPulse * 0.16 : 0) + (isHit ? actionPulse * 0.16 : 0);
      enemy.material.rotation = isVictory ? -0.95 : Math.sin(elapsed * 1.6) * 0.014 + (isAttack ? actionPulse * 0.14 : 0);
      ally.material.opacity = isDefeat ? 0.62 : 1;
      enemy.material.opacity = isVictory ? 0.72 : 1;

      allyAura.position.copy(ally.position);
      allyAura.position.y += 0.9;
      enemyAura.position.copy(enemy.position);
      enemyAura.position.y += 0.95;
      allyAura.scale.set(1.16 + latest.ki / 145, 2.06 + latest.ki / 105, 0.44);
      allyAura.material.opacity = 0.13 + latest.ki / 470 + (isTransform ? actionPulse * 0.42 : 0);
      enemyAura.material.opacity = isVictory ? 0.06 : 0.14 + (isHit ? actionPulse * 0.22 : 0);

      beam.material.color.copy(isHit ? new THREE.Color(0xff4d8f) : accentColor);
      beam.material.opacity = (isAttack || isTransform || isHit) ? 0.18 + actionPulse * 0.7 : Math.max(0, beam.material.opacity - 0.08);
      beamGlow.material.color.copy(isHit ? new THREE.Color(0xff4d8f) : accentColor);
      beamGlow.material.opacity = (isAttack || isTransform || isHit) ? 0.08 + actionPulse * 0.34 : Math.max(0, beamGlow.material.opacity - 0.06);
      beamCore.material.opacity = (isAttack || isTransform || isHit) ? 0.16 + actionPulse * 0.55 : Math.max(0, beamCore.material.opacity - 0.08);
      beam.position.y = 0.45 + actionPulse * 0.28;
      beamGlow.position.copy(beam.position);
      beamCore.position.copy(beam.position);

      const positions = particlesGeometry.attributes.position.array;
      for (let index = 0; index < particleCount; index += 1) {
        positions[index * 3 + 1] += 0.006 + (isTransform ? 0.016 : 0);
        positions[index * 3] += Math.sin(elapsed + index) * 0.0008;
        if (positions[index * 3 + 1] > 2.2) {
          positions[index * 3 + 1] = -1.25;
        }
      }
      particlesGeometry.attributes.position.needsUpdate = true;
      particles.rotation.y = elapsed * 0.05;
      particles.material.opacity = 0.52 + latest.ki / 260 + (isTransform ? actionPulse * 0.38 : 0);

      const shake = (isAttack || isHit || isTransform) ? Math.sin(elapsed * 46) * actionPulse * 0.035 : 0;
      camera.position.x = Math.sin(elapsed * 0.45) * 0.12 + shake + (isAttack ? actionPulse * 0.18 : 0) + (isHit ? -actionPulse * 0.18 : 0);
      camera.position.y = 1.62 + (isTransform ? actionPulse * 0.22 : 0) + Math.sin(elapsed * 0.7) * 0.035;
      camera.position.z = 5.15 - (isAttack ? actionPulse * 0.42 : 0) - (isTransform ? actionPulse * 0.24 : 0);
      camera.lookAt(0, 0.56 + (isTransform ? actionPulse * 0.08 : 0), 0);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      loadedTextures.forEach(({ texture }) => texture.dispose());
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          if (Array.isArray(object.material)) object.material.forEach((material) => material.dispose());
          else object.material.dispose();
        }
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div className="battle-3d-canvas" ref={mountRef} aria-hidden="true" />;
}

function BattleArena({
  language,
  fighterName,
  fighter,
  boss,
  bossPhase,
  transformation,
  hp,
  bossHp,
  ki,
  comboLevel,
  battleEvent,
  damageText,
  narration
}) {
  const battleResult = bossHp <= 0 ? 'victory' : hp <= 0 ? 'defeat' : null;

  return (
    <div className={`holo-battle ${battleEvent}`}>
      <div className="scan-lines" />
      <div className="arena-orbit">
        <span />
        <span />
        <span />
      </div>

      <div className="battle-hud">
        <PowerBar label={fighterName} value={hp} tone="ally" detail={transformation} />
        <div className="radar">
          <span />
          <b>KI</b>
          <strong>{ki}%</strong>
        </div>
        <PowerBar label={boss.name} value={bossHp} tone="enemy" detail={bossPhase} />
      </div>

      <div className="hologram-stage">
        <div className="cinematic-stage-grid" />
        <div className="cinematic-stage-halo" />
        <div className="cinematic-stage-flare" />
        <div className="planet-badge">
          <Database size={15} />
          <span>{language.planet}</span>
          <small>{language.biome}</small>
        </div>

        <div className="mini-map">
          <i />
          <i />
          <i />
        </div>

        <ThreeBattleScene
          fighter={fighter}
          boss={boss}
          battleEvent={battleEvent}
          hp={hp}
          bossHp={bossHp}
          ki={ki}
          accent={language.color}
        />

        <div className="battle-3d-overlay">
          <div className="fighter-nameplate ally">
            <strong>{fighterName}</strong>
            <span>{fighter.attack}</span>
          </div>
          <div className="versus-orb">
            <Swords className="versus" size={34} />
            {damageText && <b className={`damage-float ${battleEvent === 'hit' ? 'danger' : ''}`}>{damageText}</b>}
          </div>
          <div className="fighter-nameplate enemy">
            <strong>{boss.name}</strong>
            <span>{boss.role ? `${boss.role} | ${boss.special}` : boss.special}</span>
          </div>
        </div>

        {battleResult && (
          <div className={`battle-result ${battleResult}`}>
            <strong>{battleResult === 'victory' ? 'VITORIA' : 'DERROTA'}</strong>
            <span>{battleResult === 'victory' ? `${fighterName} dominou o boss em 3D.` : `${boss.name} venceu esta rodada. Tente novamente.`}</span>
          </div>
        )}

        <div className="live-action-badge">
          <Sparkles size={15} />
          <span>Arena 3D live action</span>
        </div>
      </div>

      <div className="battle-footer">
        <div>
          <span>Transformacao</span>
          <strong>{transformation}</strong>
        </div>
        <div>
          <span>Combo</span>
          <strong>{comboLevel}</strong>
        </div>
        <div>
          <span>Desafiador</span>
          <strong>{boss.role || 'Boss da linguagem'}</strong>
        </div>
        <div>
          <span>Boss phase</span>
          <strong>{bossPhase}</strong>
        </div>
      </div>

      <div className="ai-narrator">
        <RadioTower size={18} />
        <p>{narration}</p>
      </div>
    </div>
  );
}

function CharactersPage() {
  const [selected, setSelected] = React.useState('Goku');
  const fighter = fighters[selected];

  return (
    <section className="characters-page">
      <div className="characters-hero">
        <div>
          <span className="eyebrow">Sistema de imagens do jogo</span>
          <h1>Personagens, sprites e movimentos holograficos</h1>
          <p>Atlas visual integrado ao game usando o PNG local. Os recortes alimentam selecao de personagem, batalha, bosses e animacoes de impacto.</p>
        </div>
        <div className="featured-character" style={{ '--fighter-color': fighter.color }}>
          <div className="featured-ring">
            <div className="featured-fullbody" style={fullBodyStyle(fighter)} />
          </div>
          <strong>{fighterDisplayName(selected, fighter)}</strong>
          <span>{fighter.attack}</span>
        </div>
      </div>

      <div className="featured-roster">
        {Object.entries(fighters).map(([name, item]) => (
          <button
            key={name}
            className={selected === name ? 'active' : ''}
            onClick={() => setSelected(name)}
            style={{ '--fighter-color': item.color }}
          >
            <i className="roster-fullbody" style={fullBodyStyle(item)} />
            <strong>{fighterDisplayName(name, item)}</strong>
            <span>{item.special}</span>
          </button>
        ))}
      </div>

      <div className="movement-gallery">
        {movementCards.map((card) => (
          <article className={`movement-preview ${card.event}`} key={card.title} style={{ '--fighter-color': fighter.color }}>
            <div className="preview-stage">
              <div className="preview-aura" />
              <div className="preview-body" style={fullBodyStyle(fighter)} />
              <div className="preview-beam" />
            </div>
            <strong>{card.title}</strong>
            <p>{card.text}</p>
          </article>
        ))}
      </div>

      <div className="sprite-atlas-panel">
        <div className="section-head"><Sparkles size={18} /> Atlas completo do PNG</div>
        <div className="sprite-atlas-grid">
          {allCharacterSprites.map((sprite) => (
            <div className="atlas-tile" key={sprite.id}>
              <i style={spriteStyle(sprite)} />
              <span>#{sprite.id}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PowerBar({ label, value, tone, detail }) {
  return (
    <div className={`power-card ${tone}`}>
      <div>
        <strong>{label}</strong>
        <span>{detail}</span>
      </div>
      <b>{value}%</b>
      <div className="power-track">
        <span style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function LibraryPage() {
  const [query, setQuery] = React.useState('');
  const [languageFilter, setLanguageFilter] = React.useState('Todas');
  const normalizedQuery = query.toLowerCase().trim();
  const visibleSections = Object.entries(libraryCurriculum)
    .filter(([languageName]) => languageFilter === 'Todas' || languageName === languageFilter)
    .flatMap(([languageName, sections]) => sections.map((group) => {
      const items = group.items
        .map((label) => buildCurriculumCard(languageName, group.title, label))
        .filter((item) => {
          const haystack = `${item.language} ${item.keyword} ${item.topic} ${item.meaning} ${item.child} ${item.example}`.toLowerCase();
          return !normalizedQuery || haystack.includes(normalizedQuery);
        });
      return { language: languageName, title: group.title, items };
    }))
    .filter((group) => group.items.length);
  const visibleCount = visibleSections.reduce((total, group) => total + group.items.length, 0);
  const curriculumCount = Object.values(libraryCurriculum).flatMap((sections) => sections.flatMap((group) => group.items)).length;

  return (
    <section className="library-page">
      <div className="library-hero">
        <div>
          <span className="eyebrow">Biblioteca de estudo</span>
          <h1>Busque comandos, conceitos e exemplos</h1>
          <p>Uma pagina dedicada para estudar Python, Java, JavaScript e SQL antes de entrar nos desafios. Trilha atual: {curriculumCount} topicos organizados, {visibleCount} visiveis no filtro.</p>
        </div>
        <div className="library-search">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por print, JOIN, DOM, loops..."
          />
          <select value={languageFilter} onChange={(event) => setLanguageFilter(event.target.value)}>
            <option>Todas</option>
            {Object.keys(languages).map((languageName) => <option key={languageName}>{languageName}</option>)}
          </select>
        </div>
      </div>

      <div className="library-sections">
        {visibleSections.length ? visibleSections.map((group) => (
          <section className="library-section" key={`${group.language}-${group.title}`}>
            <div className="library-section-head">
              <div>
                <span>{group.language}</span>
                <h2>{group.title}</h2>
              </div>
              <b>{group.items.length} topicos</b>
            </div>
            <div className="library-grid">
              {group.items.map((item) => (
                <article className="library-card" key={`${item.language}-${item.topic}-${item.keyword}`}>
                  <div className="library-meta">
                    <span>{item.language}</span>
                    <b>{item.sourceKeyword ? `ref: ${item.sourceKeyword}` : item.topic}</b>
                  </div>
                  <h2>{item.keyword}</h2>
                  <p>{item.meaning}</p>
                  <div className="kid-note">{item.child}</div>
                  <pre>{item.example}</pre>
                </article>
              ))}
            </div>
          </section>
        )) : (
          <article className="library-card">
            <div className="library-meta">
              <span>Busca</span>
              <b>Sem resultado</b>
            </div>
            <h2>Nada encontrado</h2>
            <p>Ajuste o termo ou escolha outra linguagem para explorar os topicos disponiveis.</p>
          </article>
        )}
      </div>
    </section>
  );
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="stat">
      <Icon size={18} />
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function StudentDashboard({ history, activeLanguage, playerProfile, fighter, difficulty, activeGame, boss }) {
  return (
    <section className="dashboard">
      <Panel title="Player Dashboard" icon={Users}>
        <div className="player-dashboard-card">
          <i style={portraitStyle(fighter)} />
          <div>
            <span>Nick</span>
            <strong>{playerProfile.nick || playerProfile.name}</strong>
          </div>
          <div>
            <span>Personagem</span>
            <strong>{fighterDisplayName(playerProfile.fighterName, fighter)}</strong>
          </div>
          <div>
            <span>Nivel</span>
            <strong>{playerLevelFromXp(playerProfile.xp)}</strong>
          </div>
          <div>
            <span>Arena atual</span>
            <strong>{activeLanguage} Planet</strong>
          </div>
          <div>
            <span>Boss atual</span>
            <strong>{boss.name}</strong>
          </div>
        </div>
      </Panel>
      <Panel title="Historico do Aluno" icon={History}>
        <div className="history-list">
          {(history.length ? history : [
            { title: 'Primeiro login', language: activeLanguage, difficulty: 'Basico', ok: true, gained: 0, date: 'agora' }
          ]).map((item, index) => (
            <div className="history-item" key={`${item.title}-${index}`}>
              {item.ok ? <CheckCircle2 size={18} /> : <RadioTower size={18} />}
              <div>
                <strong>{item.title}</strong>
                <span>{item.language} | {item.difficulty} | {item.date}</span>
              </div>
              <b>+{item.gained}</b>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Progresso e Arenas" icon={Trophy}>
        <div className="progress-dashboard-grid">
          <div><span>XP</span><strong>{Number(playerProfile.xp || 0).toLocaleString('pt-BR')}</strong></div>
          <div><span>Moedas</span><strong>{playerProfile.coins}</strong></div>
          <div><span>Cristais</span><strong>{playerProfile.crystals}</strong></div>
          <div><span>Combos</span><strong>{playerProfile.combo}</strong></div>
        </div>
        <div className="battle-modes">
          <button><Code2 size={18} />{activeGame === 'quiz' ? 'Quiz de Interpretacao' : gameModes[activeGame]?.label}</button>
          <button><Activity size={18} />{difficulty}</button>
          <button><Rocket size={18} />{activeLanguage} Planet</button>
          <button><Crown size={18} />Boss: {boss.name}</button>
        </div>
      </Panel>
    </section>
  );
}

function AdminDashboard({ invalidAttempts, onReturnUser }) {
  return (
    <section className="dashboard admin">
      <Panel title="Painel Admin" icon={BarChart3}>
        <div className="metric-line"><span>Usuarios ativos</span><strong>1.248</strong></div>
        <div className="metric-line"><span>Taxa de acerto</span><strong>84%</strong></div>
        <div className="metric-line"><span>Tempo medio</span><strong>3m 12s</strong></div>
        <button className="admin-user-return" onClick={onReturnUser}><Users size={18} />Responder como usuario</button>
      </Panel>
      <Panel title="Gestao de Arenas" icon={Code2}>
        <div className="admin-form">
          <input value="Python Planet liberado" readOnly />
          <select defaultValue="Python"><option>Python</option><option>Java</option><option>JavaScript</option><option>SQL</option></select>
          <button><Sparkles size={18} />Liberar arena</button>
        </div>
      </Panel>
      <Panel title="Relatorios" icon={Award}>
        <div className="report-tags">
          <span>erros comuns</span>
          <span>linguagens estudadas</span>
          <span>medalhas</span>
          <span>login</span>
          <span>progresso</span>
        </div>
      </Panel>
      <Panel title="Tentativas Invalidas" icon={RadioTower}>
        <div className="invalid-attempts">
          {(invalidAttempts.length ? invalidAttempts.slice(0, 4) : [
            { id: 'empty', title: 'Sem tentativas registradas', rawAnswer: 'Aguardando dados reais', score: 0, reason: 'monitoramento ativo' }
          ]).map((item) => (
            <div className="invalid-attempt" key={item.id}>
              <strong>{item.title}</strong>
              <span>{item.rawAnswer}</span>
              <small>score {item.score}% | {item.reason}</small>
            </div>
          ))}
        </div>
      </Panel>
    </section>
  );
}

function readAccessRequest() {
  try {
    return JSON.parse(window.localStorage.getItem(ACCESS_GATE_STORAGE_KEY));
  } catch (error) {
    return null;
  }
}

function writeAccessRequest(request) {
  window.localStorage.setItem(ACCESS_GATE_STORAGE_KEY, JSON.stringify(request));
}

function calculateAgeFromBirthDate(value) {
  if (!value) return 0;
  const birthDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age;
}

function normalizeAccessForm(form) {
  const birthDate = form.birthDate.trim();
  const age = calculateAgeFromBirthDate(birthDate);
  return {
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    city: form.city.trim(),
    state: form.state.trim().toUpperCase(),
    birthDate,
    age,
    isAdult: age >= MINIMUM_ACCESS_AGE,
    email: form.email.trim().toLowerCase(),
    emailConfirmation: form.emailConfirmation.trim().toLowerCase(),
    phone: form.phone.trim(),
    acceptedTerms: form.acceptedTerms,
    acceptedPrivacy: form.acceptedPrivacy,
    consentEmail: form.consentEmail
  };
}

function validateAccessForm(form) {
  const errors = {};
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!form.firstName) errors.firstName = 'Informe seu nome.';
  if (!form.lastName) errors.lastName = 'Informe seu sobrenome.';
  if (!form.city) errors.city = 'Informe sua cidade.';
  if (!form.state) errors.state = 'Informe seu estado.';
  if (!form.birthDate) errors.birthDate = 'Informe sua data de nascimento.';
  if (form.birthDate && !form.isAdult) errors.birthDate = 'Acesso permitido apenas para maiores de 18 anos.';
  if (!form.email) errors.email = 'Informe seu email.';
  if (form.email && !emailPattern.test(form.email)) errors.email = 'Digite um email valido.';
  if (!form.emailConfirmation) errors.emailConfirmation = 'Confirme seu email.';
  if (form.email && form.emailConfirmation && form.email !== form.emailConfirmation) {
    errors.emailConfirmation = 'Os emails precisam ser iguais.';
  }
  if (!form.phone) errors.phone = 'Informe um telefone ou WhatsApp.';
  if (!form.acceptedTerms) errors.acceptedTerms = 'Aceite os termos de uso para continuar.';
  if (!form.acceptedPrivacy) errors.acceptedPrivacy = 'Aceite a politica de privacidade para continuar.';
  if (!form.consentEmail) errors.consentEmail = 'Autorize o contato por email para receber a confirmacao.';

  return errors;
}

function AccessRequestGate({ onCreatorUnlock }) {
  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    city: '',
    state: '',
    birthDate: '',
    email: '',
    emailConfirmation: '',
    phone: '',
    acceptedTerms: false,
    acceptedPrivacy: false,
    consentEmail: false
  });
  const [errors, setErrors] = React.useState({});
  const [status, setStatus] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(Boolean(readAccessRequest()?.submitted));
  const [creatorPassword, setCreatorPassword] = React.useState('');
  const [creatorStatus, setCreatorStatus] = React.useState('');

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  async function submitRequest(event) {
    event.preventDefault();
    const normalized = normalizeAccessForm(form);
    const validationErrors = validateAccessForm(normalized);
    const lastSubmit = Number(window.localStorage.getItem(ACCESS_GATE_LAST_SUBMIT_KEY) || 0);

    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      setStatus('Revise os campos destacados antes de enviar.');
      return;
    }

    if (Date.now() - lastSubmit < 60000) {
      setStatus('Aguarde um minuto antes de enviar uma nova solicitacao.');
      return;
    }

    setIsSubmitting(true);
    setStatus('Enviando solicitacao com seguranca...');

    try {
      const response = await fetch(ACCESS_REQUEST_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized)
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || 'Nao foi possivel enviar os emails agora.');
      }

      const request = {
        ...normalized,
        submitted: true,
        requestId: payload.requestId,
        requestedAt: payload.requestedAt || new Date().toISOString()
      };
      writeAccessRequest(request);
      window.localStorage.setItem(ACCESS_GATE_LAST_SUBMIT_KEY, String(Date.now()));
      setSubmitted(true);
      setStatus('Sua solicitacao de acesso foi recebida com sucesso. Em breve ela sera analisada.');
    } catch (error) {
      setStatus(error.message || 'Erro ao enviar. Verifique a configuracao de email e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function unlockCreatorAccess(event) {
    event.preventDefault();
    if (creatorPassword !== CREATOR_PASSWORD) {
      setCreatorStatus('Senha incorreta.');
      return;
    }
    setCreatorStatus('');
    onCreatorUnlock();
  }

  return (
    <main className="access-gate" style={{ '--accent': '#29d9ff' }}>
      <div className="space-scene" aria-hidden="true">
        <div className="planet planet-one" />
        <div className="planet planet-two" />
        <div className="stars" />
        <div className="ki-field">
          {Array.from({ length: 38 }).map((_, index) => (
            <span key={index} style={{ '--delay': `${index * -0.29}s`, '--x': `${(index * 37) % 100}%` }} />
          ))}
        </div>
      </div>

      <motion.section
        className="access-gate-shell"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="access-copy">
          <span className="eyebrow">Bem-vindos a Arena TEC</span>
          <h1>Arena TEC</h1>
          <p>Cadastre seus dados para solicitar acesso ao projeto games. A entrada na arena so e liberada apos o envio da solicitacao.</p>

          <form className="access-form" onSubmit={submitRequest} noValidate>
            <label className={errors.firstName ? 'invalid' : ''}>
              <span>Nome</span>
              <input value={form.firstName} onChange={(event) => updateField('firstName', event.target.value)} placeholder="Seu nome" maxLength={48} autoComplete="given-name" disabled={isSubmitting || submitted} />
              {errors.firstName && <small>{errors.firstName}</small>}
            </label>
            <label className={errors.lastName ? 'invalid' : ''}>
              <span>Sobrenome</span>
              <input value={form.lastName} onChange={(event) => updateField('lastName', event.target.value)} placeholder="Seu sobrenome" maxLength={64} autoComplete="family-name" disabled={isSubmitting || submitted} />
              {errors.lastName && <small>{errors.lastName}</small>}
            </label>
            <label className={errors.city ? 'invalid' : ''}>
              <span>Cidade</span>
              <input value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="Sao Paulo" maxLength={64} autoComplete="address-level2" disabled={isSubmitting || submitted} />
              {errors.city && <small>{errors.city}</small>}
            </label>
            <label className={errors.state ? 'invalid' : ''}>
              <span>Estado</span>
              <input value={form.state} onChange={(event) => updateField('state', event.target.value)} placeholder="SP" maxLength={2} autoComplete="address-level1" disabled={isSubmitting || submitted} />
              {errors.state && <small>{errors.state}</small>}
            </label>
            <label className={errors.birthDate ? 'invalid' : ''}>
              <span>Data de nascimento</span>
              <input value={form.birthDate} onChange={(event) => updateField('birthDate', event.target.value)} type="date" disabled={isSubmitting || submitted} />
              {errors.birthDate && <small>{errors.birthDate}</small>}
            </label>
            <label className={errors.phone ? 'invalid' : ''}>
              <span>Telefone ou WhatsApp</span>
              <input value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="(11) 99999-9999" maxLength={24} autoComplete="tel" disabled={isSubmitting || submitted} />
              {errors.phone && <small>{errors.phone}</small>}
            </label>
            <label className={errors.email ? 'invalid' : ''}>
              <span>Email</span>
              <input value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="voce@email.com" type="email" maxLength={80} autoComplete="email" disabled={isSubmitting || submitted} />
              {errors.email && <small>{errors.email}</small>}
            </label>
            <label className={errors.emailConfirmation ? 'invalid' : ''}>
              <span>Confirmar email</span>
              <input value={form.emailConfirmation} onChange={(event) => updateField('emailConfirmation', event.target.value)} placeholder="repita seu email" type="email" maxLength={80} autoComplete="email" disabled={isSubmitting || submitted} />
              {errors.emailConfirmation && <small>{errors.emailConfirmation}</small>}
            </label>
            <div className="access-checks">
              <label className={errors.acceptedTerms ? 'invalid' : ''}>
                <input type="checkbox" checked={form.acceptedTerms} onChange={(event) => updateField('acceptedTerms', event.target.checked)} disabled={isSubmitting || submitted} />
                <span>Aceito os termos de uso.</span>
                {errors.acceptedTerms && <small>{errors.acceptedTerms}</small>}
              </label>
              <label className={errors.acceptedPrivacy ? 'invalid' : ''}>
                <input type="checkbox" checked={form.acceptedPrivacy} onChange={(event) => updateField('acceptedPrivacy', event.target.checked)} disabled={isSubmitting || submitted} />
                <span>Aceito a politica de privacidade.</span>
                {errors.acceptedPrivacy && <small>{errors.acceptedPrivacy}</small>}
              </label>
              <label className={errors.consentEmail ? 'invalid' : ''}>
                <input type="checkbox" checked={form.consentEmail} onChange={(event) => updateField('consentEmail', event.target.checked)} disabled={isSubmitting || submitted} />
                <span>Autorizo contato por email sobre minha solicitacao.</span>
                {errors.consentEmail && <small>{errors.consentEmail}</small>}
              </label>
            </div>
            <button className="primary" type="submit" disabled={isSubmitting || submitted}>
              <Shield size={18} />{isSubmitting ? 'Enviando...' : submitted ? 'Solicitacao enviada' : 'Pedir solicitacao'}
            </button>
          </form>

          <div className={`access-status ${submitted ? 'success' : status ? 'warning' : ''}`} role="status">
            {submitted ? <CheckCircle2 size={18} /> : status ? <RadioTower size={18} /> : <Lock size={18} />}
            <span>{status || 'Acesso protegido. Sua solicitacao sera encaminhada para Samantha por email.'}</span>
          </div>

          {submitted && (
            <div className="access-confirmation">
              <CheckCircle2 size={20} />
              <span>Cadastro registrado. Aguarde a analise para liberacao do acesso.</span>
            </div>
          )}

          <form className="creator-access" onSubmit={unlockCreatorAccess}>
            <span>Acesso da criadora</span>
            <div>
              <input
                value={creatorPassword}
                onChange={(event) => setCreatorPassword(event.target.value)}
                type="password"
                placeholder="Senha admin"
                autoComplete="current-password"
              />
              <button type="submit"><Lock size={16} />Entrar</button>
            </div>
            {creatorStatus && <small>{creatorStatus}</small>}
          </form>
        </div>

        <div className="access-hero">
          <img src={dataEngineerGokuUrl} alt="Goku engenheiro de dados na Arena TEC" />
          <div>
            <strong>Code Ki</strong>
            <span>Pipeline, codigo e ki em modo producao.</span>
          </div>
        </div>
      </motion.section>
    </main>
  );
}

function App() {
  const [playerProfile, setPlayerProfile] = React.useState(null);
  const [creatorUnlocked, setCreatorUnlocked] = React.useState(false);

  function openPlayer(profile) {
    writePlayerProfile(profile);
    setPlayerProfile(profile);
  }

  return (
    <AnimatePresence mode="wait">
      {!creatorUnlocked ? (
        <motion.div key="access-gate" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <AccessRequestGate onCreatorUnlock={() => setCreatorUnlocked(true)} />
        </motion.div>
      ) : !playerProfile ? (
        <motion.div key="admin-console" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
          <AdminConsole onOpenPlayer={openPlayer} />
        </motion.div>
      ) : (
        <motion.div key="game" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.55 }}>
          <GameApp playerProfile={playerProfile} onPlayerUpdate={setPlayerProfile} onAdminConsole={() => setPlayerProfile(null)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Panel({ title, icon: Icon, children }) {
  return (
    <article className="panel">
      <div className="panel-title"><Icon size={18} /> {title}</div>
      {children}
    </article>
  );
}

createRoot(document.getElementById('root')).render(<App />);
