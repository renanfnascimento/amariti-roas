// =============================================================================
// AMARITI ROAS — Troca de "code" por refresh_token/access_token (Shopee v2)
// Uso: node trocar_code_shopee.js <code> <shop_id>
//
// Ex.: node trocar_code_shopee.js abc123def 123456789
//
// Lê SHOPEE_PARTNER_ID / SHOPEE_PARTNER_KEY do ambiente (ou de env.local).
// =============================================================================

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');

function loadEnvLocal() {
  const envPath = path.join(__dirname, 'env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

const PARTNER_ID  = Number(process.env.SHOPEE_PARTNER_ID || '2036495');
const PARTNER_KEY = String(process.env.SHOPEE_PARTNER_KEY || '').trim();
const TOKEN_PATH  = '/api/v2/auth/token/get';
const BASE_URL    = 'https://partner.shopeemobile.com';

const [, , code, shopIdArg] = process.argv;

if (!code || !shopIdArg) {
  console.error('\nUso: node trocar_code_shopee.js <code> <shop_id>');
  console.error('Exemplo: node trocar_code_shopee.js abc123def 123456789\n');
  process.exit(1);
}

if (!PARTNER_KEY) {
  console.error('\n[ERRO] SHOPEE_PARTNER_KEY não encontrada em env.local ou nas env vars.\n');
  process.exit(1);
}

const shopId = Number(shopIdArg);
const timestamp = Math.floor(Date.now() / 1000);
const baseString = `${PARTNER_ID}${TOKEN_PATH}${timestamp}`;
const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');

const url = new URL(BASE_URL + TOKEN_PATH);
url.searchParams.set('partner_id', String(PARTNER_ID));
url.searchParams.set('timestamp', String(timestamp));
url.searchParams.set('sign', sign);

const body = JSON.stringify({
  code,
  shop_id: shopId,
  partner_id: PARTNER_ID,
});

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
}, (res) => {
  let raw = '';
  res.on('data', (c) => { raw += c; });
  res.on('end', () => {
    let parsed;
    try { parsed = JSON.parse(raw); } catch { parsed = null; }

    console.log('\n=============================================================');
    console.log('  RESPOSTA DA SHOPEE (auth/token/get)');
    console.log('=============================================================\n');
    console.log(raw);

    if (parsed && parsed.access_token) {
      console.log('\n-------------------------------------------------------------');
      console.log('access_token :', parsed.access_token);
      console.log('refresh_token:', parsed.refresh_token);
      console.log('expire_in    :', parsed.expire_in, 'segundos');
      console.log('-------------------------------------------------------------');
      console.log('\nProximo passo: atualizar SHOPEE_ACCESS_TOKEN_1 (ou _2) e');
      console.log('SHOPEE_REFRESH_TOKEN_1 (ou _2) nas env vars da Vercel e do n8n.\n');
    } else if (parsed && parsed.error) {
      console.error('\n[ERRO SHOPEE]', parsed.error, '-', parsed.message);
    }
  });
});

req.on('error', (e) => console.error('[ERRO HTTPS]', e.message));
req.write(body);
req.end();
