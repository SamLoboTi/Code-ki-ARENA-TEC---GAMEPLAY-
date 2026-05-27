const PORT = Number(process.env.PORT || 5292);
const baseUrl = process.env.ACCESS_TEST_BASE_URL || `http://127.0.0.1:${PORT}`;

const payload = {
  firstName: process.env.ACCESS_TEST_FIRST_NAME || 'Teste',
  lastName: process.env.ACCESS_TEST_LAST_NAME || 'Arena',
  city: process.env.ACCESS_TEST_CITY || 'Sao Paulo',
  state: process.env.ACCESS_TEST_STATE || 'SP',
  birthDate: process.env.ACCESS_TEST_BIRTH_DATE || '1990-01-01',
  age: 36,
  isAdult: true,
  email: process.env.ACCESS_TEST_EMAIL || 'samanthaocireulobo93@gmail.com',
  emailConfirmation: process.env.ACCESS_TEST_EMAIL || 'samanthaocireulobo93@gmail.com',
  phone: process.env.ACCESS_TEST_PHONE || '(11) 99999-9999',
  acceptedTerms: true,
  acceptedPrivacy: true,
  consentEmail: true
};

console.log(`[test-access-email] Enviando teste para ${baseUrl}/api/access-request`);
const response = await fetch(`${baseUrl}/api/access-request`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload)
});
const body = await response.json().catch(() => ({}));
console.log('[test-access-email] Status:', response.status);
console.log('[test-access-email] Resposta:', JSON.stringify(body, null, 2));

if (!response.ok || !body.ok) {
  process.exitCode = 1;
}

