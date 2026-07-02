// =============================================================================
// AMARITI ROAS — Gerador de Auth Link (Shopee Open Platform v2)
// Uso: node gerar_link_shopee.js
//
// Lê SHOPEE_PARTNER_ID / SHOPEE_PARTNER_KEY do ambiente (ou do arquivo
// env.local na raiz do projeto). Nenhuma chave fica hardcoded aqui.
// =============================================================================

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Carrega env.local (se existir) sem depender de dotenv ──────────────────────
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

// ── Credenciais ──────────────────────────────────────────────────────────────
const PARTNER_ID  = Number(process.env.SHOPEE_PARTNER_ID || '2036495');
const PARTNER_KEY = String(process.env.SHOPEE_PARTNER_KEY || '').trim();
const REDIRECT_URL = 'https://seller.shopee.com.br/';
const AUTH_PATH    = '/api/v2/shop/auth_partner';
const BASE_URL     = 'https://partner.shopeemobile.com';

if (!PARTNER_KEY) {
  console.error('\n[ERRO] SHOPEE_PARTNER_KEY não encontrada.');
  console.error('Ela não está em env.local nem nas variáveis de ambiente deste shell.');
  console.error('Defina-a antes de rodar o script, por exemplo:');
  console.error('  PowerShell:  $env:SHOPEE_PARTNER_KEY = "sua_chave_aqui"');
  console.error('  ou adicione a linha SHOPEE_PARTNER_KEY=sua_chave_aqui no arquivo env.local\n');
  process.exit(1);
}

// ── Sign HMAC-SHA256 (endpoints públicos: partner_id + path + timestamp) ───────
const timestamp = Math.floor(Date.now() / 1000);
const baseString = `${PARTNER_ID}${AUTH_PATH}${timestamp}`;
const sign = crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');

const url = new URL(BASE_URL + AUTH_PATH);
url.searchParams.set('partner_id', String(PARTNER_ID));
url.searchParams.set('redirect', REDIRECT_URL);
url.searchParams.set('timestamp', String(timestamp));
url.searchParams.set('sign', sign);

console.log('\n=============================================================');
console.log('  LINK DE AUTORIZACAO SHOPEE (valido por poucos minutos)');
console.log('=============================================================\n');
console.log(url.toString());
console.log('\n=============================================================');
console.log('Instrucoes para o Gestor:');
console.log('  1. Clicar no link acima.');
console.log('  2. Fazer login na conta Shopee da loja.');
console.log('  3. Apos autorizar, a Shopee vai redirecionar para uma URL');
console.log('     do tipo: https://seller.shopee.com.br/?code=XXXXXX&shop_id=YYYYYY');
console.log('  4. Copiar o valor do parametro "code" (e confirmar o "shop_id").');
console.log('=============================================================\n');
