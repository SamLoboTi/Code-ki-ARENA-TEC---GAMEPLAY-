import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const columns = 13;
const rows = 8;

const featured = {
  '0-0': { name: 'Goku', role: 'Herói veloz', motion: 'Kamehameha em túnel holográfico' },
  '1-0': { name: 'Vegeta', role: 'Rival explosivo', motion: 'Final Flash com rachadura neon' },
  '2-0': { name: 'Gohan', role: 'Ataque técnico', motion: 'Masenko com escudo de código' },
  '4-0': { name: 'Trunks', role: 'Corte temporal', motion: 'Espada do futuro em glitch azul' },
  '5-0': { name: 'Piccolo', role: 'Estrategista', motion: 'Makankosappo de precisão' },
  '10-1': { name: 'Freeza', role: 'Boss de fase', motion: 'Raio mortal com zoom frio' },
  '0-6': { name: 'Cell', role: 'Boss evolutivo', motion: 'Absorção de combo' },
  '12-4': { name: 'Majin Buu', role: 'Boss caótico', motion: 'Explosão elástica rosa' },
  '12-1': { name: 'Beerus', role: 'Boss supremo', motion: 'Hakai com distorção espacial' }
};

const motionIdeas = [
  ['Impacto de Ficção', 'Câmera aproxima 1.2x, o fundo congela por 0.25s e o golpe atravessa a arena como uma linha de energia volumétrica.'],
  ['Combo Relâmpago', 'A cada acerto consecutivo, clones holográficos aparecem por 6 frames, simulando velocidade absurda.'],
  ['Transformação Neon', 'A aura troca de cor em três pulsos, o chão vira grade 3D e números de dano flutuam como hologramas.'],
  ['Erro Engraçado', 'O personagem tropeça em um ponto e vírgula gigante, o scouter apita e aparece uma plaquinha "bug detectado".'],
  ['Ataque do Debug', 'O personagem pausa no ar, abre um painel holográfico e corrige a lógica antes de disparar o golpe.'],
  ['Teleporte Errado', 'O guerreiro some, reaparece atrás do próprio avatar por engano e volta rindo para a posição de luta.'],
  ['Boss Provocador', 'O chefe aponta para a resposta errada, ri, e solta um mini ataque que faz o HUD piscar em vermelho.'],
  ['Vitória Cinemática', 'Slow motion, partículas subindo, pose final e o planeta de linguagem brilhando atrás do personagem.']
];

function spriteStyle(x, y) {
  const posX = (x / (columns - 1)) * 100;
  const posY = (y / (rows - 1)) * 100;
  return `background-image:url('../R.png');background-size:${columns * 100}% ${rows * 100}%;background-position:${posX}% ${posY}%;`;
}

function characterCards() {
  const cards = [];
  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < columns; x += 1) {
      const key = `${x}-${y}`;
      const data = featured[key] ?? {
        name: `Personagem ${String(cards.length + 1).padStart(3, '0')}`,
        role: 'Participante do atlas',
        motion: 'Entrada holográfica com aura, idle flutuante e reação de impacto.'
      };
      cards.push(`
        <article class="character-card ${featured[key] ? 'featured' : ''}">
          <div class="portrait" style="${spriteStyle(x, y)}"></div>
          <div class="card-copy">
            <strong>${data.name}</strong>
            <span>${data.role}</span>
            <p>${data.motion}</p>
          </div>
        </article>
      `);
    }
  }
  return cards.join('');
}

const html = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <title>Atlas Holográfico Dragon Code</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #050711;
      color: #f8fbff;
      font-family: Inter, Arial, sans-serif;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .page {
      min-height: 273mm;
      padding: 18mm;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      background:
        radial-gradient(circle at 80% 12%, rgba(49,208,255,.38), transparent 25%),
        radial-gradient(circle at 12% 80%, rgba(255,176,46,.26), transparent 26%),
        linear-gradient(135deg, #070a16 0%, #111a34 52%, #050711 100%);
    }
    .page::before {
      content: "";
      position: absolute;
      inset: 0;
      background:
        repeating-linear-gradient(0deg, transparent 0 9px, rgba(255,255,255,.08) 10px),
        radial-gradient(circle, rgba(255,255,255,.22) 1px, transparent 1px);
      background-size: auto, 80px 80px;
      opacity: .32;
      pointer-events: none;
    }
    .content { position: relative; z-index: 1; }
    h1 {
      margin: 0;
      max-width: 780px;
      font-size: 54px;
      line-height: .92;
      letter-spacing: 0;
    }
    h2 {
      margin: 0 0 10px;
      font-size: 30px;
      letter-spacing: 0;
    }
    .eyebrow {
      color: #31d0ff;
      font-weight: 900;
      text-transform: uppercase;
      font-size: 12px;
    }
    .lead {
      max-width: 720px;
      color: #c8d6f0;
      font-size: 18px;
      line-height: 1.45;
    }
    .hero-strip {
      margin-top: 28px;
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 10px;
    }
    .hero-cell, .character-card, .motion-card {
      border: 1px solid rgba(255,255,255,.15);
      border-radius: 8px;
      background: linear-gradient(180deg, rgba(18,28,58,.78), rgba(5,8,20,.72));
      box-shadow: 0 20px 60px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.1);
    }
    .hero-cell {
      min-height: 150px;
      display: grid;
      place-items: center;
      padding: 10px;
    }
    .portrait {
      width: 96px;
      aspect-ratio: 1;
      border-radius: 50%;
      background-repeat: no-repeat;
      border: 2px solid rgba(255,255,255,.6);
      box-shadow: 0 0 28px rgba(49,208,255,.62);
    }
    .hero-cell .portrait { width: 118px; }
    .note {
      margin-top: 26px;
      border-left: 4px solid #31d0ff;
      padding: 12px 16px;
      color: #dce8ff;
      background: rgba(255,255,255,.07);
      border-radius: 0 8px 8px 0;
      line-height: 1.45;
    }
    .atlas {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    .character-card {
      min-height: 142px;
      padding: 9px;
      display: grid;
      grid-template-columns: 68px 1fr;
      gap: 9px;
      align-items: center;
      break-inside: avoid;
    }
    .character-card .portrait {
      width: 68px;
      box-shadow: 0 0 18px rgba(49,208,255,.45);
    }
    .character-card.featured {
      border-color: rgba(255,224,92,.72);
      box-shadow: 0 0 24px rgba(255,224,92,.28);
    }
    .card-copy strong, .card-copy span {
      display: block;
    }
    .card-copy strong { font-size: 13px; }
    .card-copy span {
      color: #31d0ff;
      font-size: 10px;
      margin-top: 2px;
    }
    .card-copy p {
      margin: 5px 0 0;
      color: #c8d6f0;
      font-size: 9.6px;
      line-height: 1.28;
    }
    .motion-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      margin-top: 14px;
    }
    .motion-card {
      min-height: 112px;
      padding: 16px;
      break-inside: avoid;
    }
    .motion-card strong {
      display: block;
      color: #ffe45e;
      font-size: 18px;
      margin-bottom: 8px;
    }
    .motion-card p {
      margin: 0;
      color: #d8e5ff;
      line-height: 1.42;
      font-size: 13px;
    }
    .pipeline {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-top: 20px;
    }
    .step {
      min-height: 118px;
      padding: 14px;
      border-radius: 8px;
      background: rgba(255,255,255,.08);
      border: 1px solid rgba(255,255,255,.12);
    }
    .step b {
      display: block;
      color: #31d0ff;
      font-size: 24px;
      margin-bottom: 8px;
    }
    .step span {
      color: #dbe8ff;
      font-size: 13px;
      line-height: 1.35;
    }
  </style>
</head>
<body>
  <section class="page">
    <div class="content">
      <span class="eyebrow">Documento visual de produção</span>
      <h1>Atlas Holográfico de Personagens e Movimentos</h1>
      <p class="lead">PDF conceitual para o game educativo de programação: personagens do sprite sheet local, ações cinematográficas, impacto de ficção e movimentos engraçados para acertos, erros, combos e transformações.</p>
      <div class="hero-strip">
        ${Object.entries(featured).slice(0, 5).map(([key]) => {
          const [x, y] = key.split('-').map(Number);
          return `<div class="hero-cell"><div class="portrait" style="${spriteStyle(x, y)}"></div></div>`;
        }).join('')}
      </div>
      <div class="note">Base visual usada: arquivo local R.png. O objetivo deste PDF é servir como guia de animação e direção de arte para o jogo, com recortes do atlas existente e propostas de movimentos inovadores.</div>
      <div class="pipeline">
        <div class="step"><b>01</b><span>Idle holográfico: personagem flutua, aura respira e linhas de scan passam pelo corpo.</span></div>
        <div class="step"><b>02</b><span>Acerto: avanço rápido, golpe de energia e dano flutuante no boss.</span></div>
        <div class="step"><b>03</b><span>Erro: recuo cômico, HUD vermelho e dica do narrador IA.</span></div>
        <div class="step"><b>04</b><span>Combo: slow motion, câmera tremendo e transformação quando o KI chega a 100%.</span></div>
      </div>
    </div>
  </section>

  <section class="page">
    <div class="content">
      <span class="eyebrow">Todos os recortes do PNG</span>
      <h2>Atlas de personagens</h2>
      <div class="atlas">${characterCards()}</div>
    </div>
  </section>

  <section class="page">
    <div class="content">
      <span class="eyebrow">Direção de animação</span>
      <h2>Movimentos inovadores e engraçados</h2>
      <div class="motion-grid">
        ${motionIdeas.map(([title, body]) => `<article class="motion-card"><strong>${title}</strong><p>${body}</p></article>`).join('')}
      </div>
      <div class="note">Sugestão de implementação: cada movimento pode ser uma classe CSS/Framer Motion acionada por eventos do jogo: resposta correta, resposta errada, combo x5, KI 100%, boss derrotado e vitória multiplayer.</div>
    </div>
  </section>
</body>
</html>`;

writeFileSync(resolve('docs-personagens-dragon-code.html'), html, 'utf8');
console.log('docs-personagens-dragon-code.html');
