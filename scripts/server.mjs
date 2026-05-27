import { createServer } from 'node:http';
import { mkdir, readFile, stat, appendFile } from 'node:fs/promises';
import { createReadStream, existsSync, readFileSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { randomUUID } from 'node:crypto';

function loadDotEnv() {
  const envPath = join(process.cwd(), '.env');
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator === -1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim().replace(/^["']|["']$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv();

const PORT = Number(process.env.PORT || 5292);
const ADMIN_EMAIL = process.env.ACCESS_EMAIL_TO || 'samanthaocireulobo93@gmail.com';
const FROM_EMAIL = process.env.ACCESS_EMAIL_FROM || '';
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const PUBLIC_APP_URL = process.env.PUBLIC_APP_URL || `http://localhost:${PORT}`;
const DIST_DIR = join(process.cwd(), 'dist');
const DATA_DIR = join(process.cwd(), 'data');
const REQUEST_LOG = join(DATA_DIR, 'access-requests.jsonl');
const rateLimit = new Map();

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webm': 'video/webm',
  '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml'
};

function json(res, status, payload) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(payload));
}

function getIp(req) {
  return String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
}

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 32_000) throw new Error('Payload muito grande.');
  }
  return JSON.parse(body || '{}');
}

function calculateAgeFromBirthDate(value) {
  const birthDate = new Date(`${value}T00:00:00`);
  if (Number.isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDelta = today.getMonth() - birthDate.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) age -= 1;
  return age;
}

function normalizeAccessRequest(input) {
  const birthDate = String(input.birthDate || '').trim();
  const age = calculateAgeFromBirthDate(birthDate);
  return {
    firstName: String(input.firstName || '').trim(),
    lastName: String(input.lastName || '').trim(),
    city: String(input.city || '').trim(),
    state: String(input.state || '').trim().toUpperCase(),
    birthDate,
    age,
    isAdult: age >= 18,
    email: String(input.email || '').trim().toLowerCase(),
    emailConfirmation: String(input.emailConfirmation || input.email || '').trim().toLowerCase(),
    phone: String(input.phone || '').trim(),
    acceptedTerms: Boolean(input.acceptedTerms),
    acceptedPrivacy: Boolean(input.acceptedPrivacy),
    consentEmail: Boolean(input.consentEmail)
  };
}

function validateAccessRequest(data) {
  const errors = [];
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.firstName) errors.push('Nome obrigatorio.');
  if (!data.lastName) errors.push('Sobrenome obrigatorio.');
  if (!data.city) errors.push('Cidade obrigatoria.');
  if (!data.state) errors.push('Estado obrigatorio.');
  if (!data.birthDate) errors.push('Data de nascimento obrigatoria.');
  if (!data.isAdult) errors.push('Usuario precisa ser maior de 18 anos.');
  if (!emailPattern.test(data.email)) errors.push('Email invalido.');
  if (data.email !== data.emailConfirmation) errors.push('Confirmacao de email diferente.');
  if (!data.phone) errors.push('Telefone ou WhatsApp obrigatorio.');
  if (!data.acceptedTerms) errors.push('Termos de uso nao aceitos.');
  if (!data.acceptedPrivacy) errors.push('Politica de privacidade nao aceita.');
  if (!data.consentEmail) errors.push('Consentimento por email nao aceito.');
  return errors;
}

function checkRateLimit(ip, email) {
  const now = Date.now();
  const key = `${ip}:${email}`;
  const previous = rateLimit.get(key) || 0;
  if (now - previous < 60_000) return false;
  rateLimit.set(key, now);
  return true;
}

function userEmailHtml(data, requestedAt) {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  return `
    <p>Ola, ${fullName}.</p>
    <p>Recebemos sua solicitacao de acesso ao projeto games.</p>
    <p>Seus dados foram enviados com sucesso e serao analisados em breve.</p>
    <h3>Resumo da solicitacao</h3>
    <p><strong>Nome:</strong> ${fullName}</p>
    <p><strong>Cidade/Estado:</strong> ${data.city} - ${data.state}</p>
    <p><strong>E-mail:</strong> ${data.email}</p>
    <p><strong>Data da solicitacao:</strong> ${requestedAt}</p>
    <p>Obrigado.</p>
  `;
}

function adminEmailHtml(data, requestedAt, requestId, ip) {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  return `
    <p>Uma nova solicitacao de acesso foi enviada.</p>
    <h3>Dados do usuario</h3>
    <p><strong>Nome:</strong> ${fullName}</p>
    <p><strong>Cidade:</strong> ${data.city}</p>
    <p><strong>Estado:</strong> ${data.state}</p>
    <p><strong>Idade:</strong> ${data.age}</p>
    <p><strong>Maior de 18 anos:</strong> ${data.isAdult ? 'Sim' : 'Nao'}</p>
    <p><strong>E-mail:</strong> ${data.email}</p>
    <p><strong>Telefone/WhatsApp:</strong> ${data.phone}</p>
    <p><strong>Aceitou termos:</strong> Sim</p>
    <p><strong>Aceitou politica de privacidade:</strong> Sim</p>
    <p><strong>Consentiu contato por e-mail:</strong> Sim</p>
    <p><strong>Data e hora:</strong> ${requestedAt}</p>
    <p><strong>ID da solicitacao:</strong> ${requestId}</p>
    <p><strong>IP:</strong> ${ip}</p>
    <p>Verificar se o cadastro deve ser aprovado/liberado.</p>
  `;
}

async function sendResendEmail({ to, subject, html, replyTo }) {
  if (!RESEND_API_KEY) {
    const error = new Error('RESEND_API_KEY nao configurada no servidor.');
    error.code = 'MISSING_RESEND_API_KEY';
    throw error;
  }
  if (!FROM_EMAIL) {
    const error = new Error('ACCESS_EMAIL_FROM nao configurado. Configure um remetente verificado no Resend.');
    error.code = 'MISSING_ACCESS_EMAIL_FROM';
    throw error;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      reply_to: replyTo
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || `Falha Resend HTTP ${response.status}`);
    error.code = payload.name || 'RESEND_API_ERROR';
    error.details = payload;
    throw error;
  }
  return payload;
}

async function handleAccessRequest(req, res) {
  const ip = getIp(req);
  try {
    const payload = await readJsonBody(req);
    if (payload.website) return json(res, 200, { ok: true, skipped: true });

    const data = normalizeAccessRequest(payload);
    const errors = validateAccessRequest(data);
    if (errors.length) return json(res, 400, { ok: false, message: errors.join(' ') });
    if (!checkRateLimit(ip, data.email)) {
      return json(res, 429, { ok: false, message: 'Muitas solicitacoes em pouco tempo. Aguarde um minuto e tente novamente.' });
    }

    const requestId = randomUUID();
    const requestedAt = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    await mkdir(DATA_DIR, { recursive: true });
    await appendFile(REQUEST_LOG, `${JSON.stringify({ requestId, requestedAt, ip, ...data })}\n`, 'utf8');

    console.info(`[access-request] ${requestId} recebido para ${data.email}`);
    const adminResult = await sendResendEmail({
      to: ADMIN_EMAIL,
      subject: 'Nova solicitacao de acesso ao projeto games',
      html: adminEmailHtml(data, requestedAt, requestId, ip),
      replyTo: data.email
    });
    const userResult = await sendResendEmail({
      to: data.email,
      subject: 'Solicitacao de acesso recebida',
      html: userEmailHtml(data, requestedAt),
      replyTo: ADMIN_EMAIL
    });
    console.info(`[access-request] ${requestId} emails enviados`, { adminId: adminResult.id, userId: userResult.id });
    return json(res, 200, { ok: true, requestId, requestedAt });
  } catch (error) {
    console.error('[access-request] erro', {
      code: error.code,
      message: error.message,
      details: error.details
    });
    return json(res, 500, {
      ok: false,
      code: error.code || 'ACCESS_REQUEST_ERROR',
      message: error.message || 'Erro ao enviar solicitacao de acesso.'
    });
  }
}

async function serveStatic(req, res) {
  const url = new URL(req.url, PUBLIC_APP_URL);
  const requestedPath = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = join(DIST_DIR, safePath);
  if (!filePath.startsWith(DIST_DIR)) return json(res, 403, { ok: false, message: 'Forbidden' });

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error('not file');
    res.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
      'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=3600'
    });
    createReadStream(filePath).pipe(res);
  } catch {
    const indexHtml = await readFile(join(DIST_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    res.end(indexHtml);
  }
}

createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/access-request') {
    return handleAccessRequest(req, res);
  }
  if (req.method === 'GET' && req.url === '/api/health') {
    return json(res, 200, {
      ok: true,
      emailConfigured: Boolean(RESEND_API_KEY && FROM_EMAIL),
      adminEmail: ADMIN_EMAIL
    });
  }
  if (req.method === 'GET' || req.method === 'HEAD') {
    return serveStatic(req, res);
  }
  return json(res, 405, { ok: false, message: 'Method not allowed' });
}).listen(PORT, '0.0.0.0', () => {
  console.info(`[server] Code Ki Arena ouvindo em ${PUBLIC_APP_URL}`);
  console.info(`[server] Email transacional ${RESEND_API_KEY && FROM_EMAIL ? 'configurado' : 'pendente de configuracao'}`);
});
