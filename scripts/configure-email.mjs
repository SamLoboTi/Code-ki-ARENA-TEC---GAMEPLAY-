import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const envPath = '.env';
const current = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';

function readExisting(key, fallback = '') {
  const match = current.match(new RegExp(`^${key}=(.*)$`, 'm'));
  return match ? match[1].trim() : fallback;
}

const rl = createInterface({ input, output });

console.log('Configuracao de email transacional do Code Ki Arena');
console.log('A chave fica apenas no .env local, que esta ignorado pelo Git.');

const resendKey = await rl.question('RESEND_API_KEY: ');
const fromEmail = await rl.question(`ACCESS_EMAIL_FROM [${readExisting('ACCESS_EMAIL_FROM', 'Code Ki Arena <noreply@seudominio.com>')}]: `);
const toEmail = await rl.question(`ACCESS_EMAIL_TO [${readExisting('ACCESS_EMAIL_TO', 'samanthaocireulobo93@gmail.com')}]: `);
const publicUrl = await rl.question(`PUBLIC_APP_URL [${readExisting('PUBLIC_APP_URL', 'http://localhost:5292')}]: `);
rl.close();

const env = [
  'PORT=5292',
  `PUBLIC_APP_URL=${publicUrl.trim() || readExisting('PUBLIC_APP_URL', 'http://localhost:5292')}`,
  `RESEND_API_KEY=${resendKey.trim()}`,
  `ACCESS_EMAIL_FROM=${fromEmail.trim() || readExisting('ACCESS_EMAIL_FROM', 'Code Ki Arena <noreply@seudominio.com>')}`,
  `ACCESS_EMAIL_TO=${toEmail.trim() || readExisting('ACCESS_EMAIL_TO', 'samanthaocireulobo93@gmail.com')}`,
  '',
  'ACCESS_TEST_EMAIL=samanthaocireulobo93@gmail.com',
  'ACCESS_TEST_FIRST_NAME=Teste',
  'ACCESS_TEST_LAST_NAME=Arena',
  'ACCESS_TEST_CITY=Sao Paulo',
  'ACCESS_TEST_STATE=SP',
  'ACCESS_TEST_BIRTH_DATE=1990-01-01',
  'ACCESS_TEST_PHONE=(11) 99999-9999',
  ''
].join('\n');

writeFileSync(envPath, env, 'utf8');
console.log('.env atualizado. Rode: npm run build && npm run serve:app');

