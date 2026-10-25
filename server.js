import { createServer } from 'node:http';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomBytes, createHash, createHmac, scryptSync, timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { copy as defaults } from './src/translations.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(root, 'data');
const contentFile = path.join(dataDir, 'content.json');
const adminFile = path.join(dataDir, 'admin.json');
const secretFile = path.join(dataDir, 'session-secret');
const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('--production');
const mimeTypes = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon' };
const attempts = new Map();
let vite;
let sessionSecret;

await fs.mkdir(dataDir, { recursive: true });
try { await fs.access(contentFile); }
catch { await fs.writeFile(contentFile, JSON.stringify(defaults, null, 2)); }

let admin;
try { admin = JSON.parse(await fs.readFile(adminFile, 'utf8')); }
catch {
  const initialPassword = process.env.ADMIN_PASSWORD || randomBytes(18).toString('base64url');
  const salt = randomBytes(16).toString('hex');
  admin = { salt, hash: scryptSync(initialPassword, salt, 64).toString('hex') };
  await fs.writeFile(adminFile, JSON.stringify(admin), { mode: 0o600 });
  console.log('\nAdmin username: admin');
  console.log(`Admin password: ${initialPassword}`);
  console.log('Save this password somewhere safe. It will not be shown again.\n');
}
try { sessionSecret = await fs.readFile(secretFile, 'utf8'); }
catch {
  sessionSecret = randomBytes(48).toString('hex');
  await fs.writeFile(secretFile, sessionSecret, { mode: 0o600 });
}

async function readContent() {
  try { return JSON.parse(await fs.readFile(contentFile, 'utf8')); }
  catch { return defaults; }
}

function json(res, status, value, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(value));
}

function cookieValue(req, name) {
  const cookies = req.headers.cookie || '';
  const part = cookies.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return part ? decodeURIComponent(part.slice(name.length + 1)) : '';
}

function createSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url');
  const signature = createHmac('sha256', sessionSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function hasSession(req) {
  const [payload, signature, extra] = cookieValue(req, 'muslima_admin').split('.');
  if (!payload || !signature || extra) return false;
  const expected = createHmac('sha256', sessionSecret).update(payload).digest();
  let received;
  try { received = Buffer.from(signature, 'base64url'); } catch { return false; }
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return false;
  try { return JSON.parse(Buffer.from(payload, 'base64url').toString()).exp > Date.now(); }
  catch { return false; }
}

function cookie(session, maxAge = 8 * 60 * 60) {
  return `muslima_admin=${encodeURIComponent(session)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${maxAge}${isProduction ? '; Secure' : ''}`;
}

function validPassword(password) {
  if (typeof password !== 'string') return false;
  const actual = scryptSync(password, admin.salt, 64);
  const expected = Buffer.from(admin.hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function takeLoginAttempt(ip) {
  const now = Date.now();
  const current = attempts.get(ip) || { count: 0, since: now };
  if (now - current.since > 15 * 60 * 1000) { current.count = 0; current.since = now; }
  if (current.count >= 8) return false;
  current.count += 1;
  attempts.set(ip, current);
  return true;
}

async function bodyJson(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk;
    if (body.length > 400_000) throw new Error('So‘rov hajmi juda katta.');
  }
  if (!body) return {};
  return JSON.parse(body);
}

function validContent(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  for (const locale of Object.keys(defaults)) {
    if (!value[locale] || typeof value[locale] !== 'object' || Array.isArray(value[locale])) return false;
    for (const key of Object.keys(defaults[locale])) {
      if (typeof value[locale][key] !== 'string' || value[locale][key].length > 5000) return false;
    }
  }
  return true;
}

async function handleApi(req, res, pathname) {
  if (req.method === 'GET' && pathname === '/api/content') return json(res, 200, await readContent());
  if (req.method === 'GET' && pathname === '/api/admin/session') return json(res, 200, { authenticated: hasSession(req) });

  if (req.method === 'POST' && pathname === '/api/admin/login') {
    const ip = req.socket.remoteAddress || 'unknown';
    if (!takeLoginAttempt(ip)) return json(res, 429, { error: 'Urinishlar limiti tugadi. 15 daqiqadan keyin urinib ko‘ring.' });
    try {
      const body = await bodyJson(req);
      if (!validPassword(body.password)) return json(res, 401, { error: 'Parol noto‘g‘ri.' });
      attempts.delete(ip);
      return json(res, 200, { ok: true, content: await readContent() }, { 'Set-Cookie': cookie(createSession()) });
    } catch { return json(res, 400, { error: 'So‘rovni o‘qib bo‘lmadi.' }); }
  }

  if (req.method === 'POST' && pathname === '/api/admin/logout') {
    return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
  }

  if (pathname.startsWith('/api/admin/')) {
    if (!hasSession(req)) return json(res, 401, { error: 'Avval admin panelga kiring.' });
    if (req.method === 'GET' && pathname === '/api/admin/content') return json(res, 200, await readContent());
    if (req.method === 'PUT' && pathname === '/api/admin/content') {
      try {
        const next = await bodyJson(req);
        if (!validContent(next)) return json(res, 400, { error: 'Matnlar formati noto‘g‘ri yoki juda uzun.' });
        await fs.writeFile(contentFile, JSON.stringify(next, null, 2));
        return json(res, 200, { ok: true, content: next });
      } catch { return json(res, 400, { error: 'Matnlarni saqlab bo‘lmadi.' }); }
    }
    if (req.method === 'POST' && pathname === '/api/admin/password') {
      try {
        const body = await bodyJson(req);
        if (!validPassword(body.currentPassword)) return json(res, 401, { error: 'Joriy parol noto‘g‘ri.' });
        if (typeof body.newPassword !== 'string' || body.newPassword.length < 12) return json(res, 400, { error: 'Yangi parol kamida 12 ta belgidan iborat bo‘lsin.' });
        admin = { salt: randomBytes(16).toString('hex') };
        admin.hash = scryptSync(body.newPassword, admin.salt, 64).toString('hex');
        await fs.writeFile(adminFile, JSON.stringify(admin), { mode: 0o600 });
        sessionSecret = randomBytes(48).toString('hex');
        await fs.writeFile(secretFile, sessionSecret, { mode: 0o600 });
        return json(res, 200, { ok: true }, { 'Set-Cookie': cookie('', 0) });
      } catch { return json(res, 400, { error: 'Parolni yangilab bo‘lmadi.' }); }
    }
    return json(res, 404, { error: 'Admin API manzili topilmadi.' });
  }

  return false;
}

async function sendStatic(req, res, pathname) {
  const dist = path.join(root, 'dist');
  let requested = path.resolve(dist, `.${decodeURIComponent(pathname)}`);
  if (!requested.startsWith(dist + path.sep) && requested !== path.join(dist, 'index.html')) requested = path.join(dist, 'index.html');
  try {
    const stat = await fs.stat(requested);
    if (stat.isDirectory()) requested = path.join(requested, 'index.html');
    const file = await fs.readFile(requested);
    res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(requested)] || 'application/octet-stream' });
    res.end(file);
  } catch {
    const index = await fs.readFile(path.join(dist, 'index.html'));
    res.writeHead(200, { 'Content-Type': mimeTypes['.html'] }); res.end(index);
  }
}

const server = createServer(async (req, res) => {
  const pathname = new URL(req.url, 'http://localhost').pathname;
  if (pathname.startsWith('/api/')) {
    try {
      if (req.method !== 'GET' && req.method !== 'HEAD' && !String(req.headers['content-type'] || '').startsWith('application/json')) {
        return json(res, 415, { error: 'JSON so‘rovi yuboring.' });
      }
      const handled = await handleApi(req, res, pathname);
      if (handled !== false) return;
      return json(res, 404, { error: 'API manzili topilmadi.' });
    } catch (error) { return json(res, 400, { error: error.message || 'So‘rovni bajarib bo‘lmadi.' }); }
  }
  if (isProduction) return sendStatic(req, res, pathname);
  vite.middlewares(req, res, (error) => {
    if (error) { res.statusCode = 500; res.end('Development server error'); }
    else { res.statusCode = 404; res.end('Not found'); }
  });
});

if (!isProduction) {
  const { createServer: createViteServer } = await import('vite');
  vite = await createViteServer({ server: { middlewareMode: true, hmr: { server } }, appType: 'spa' });
}

const port = Number(process.env.PORT || 5173);
server.listen(port, '0.0.0.0', () => {
  console.log(`Portfolio is running at http://localhost:${port}`);
  console.log(`Admin panel: http://localhost:${port}/admin`);
});

for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, async () => {
  if (vite) await vite.close();
  server.close(() => process.exit(0));
});
