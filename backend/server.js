const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const STATIC_DIR = path.join(__dirname, '..', 'frontend', 'build');
const IS_PROD = process.env.NODE_ENV === 'production';

const MIME = {
  '.html': 'text/html',
  '.js':   'application/javascript',
  '.css':  'text/css',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff2':'font/woff2',
  '.woff': 'font/woff',
};

function serveStatic(res, filePath) {
  const ext = path.extname(filePath);
  const mime = MIME[ext] || 'application/octet-stream';
  try {
    const data = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  } catch {
    const index = fs.readFileSync(path.join(STATIC_DIR, 'index.html'));
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(index);
  }
}

const PORT = process.env.PORT || 8000;
const DATA = path.join(__dirname, 'data');

const FILES = {
  orders:    path.join(DATA, 'orders.json'),
  analytics: path.join(DATA, 'analytics.json'),
  portfolio: path.join(DATA, 'portfolio.json'),
  services:  path.join(DATA, 'services.json'),
  team:      path.join(DATA, 'team.json'),
  site:      path.join(DATA, 'site.json'),
};

// In-memory session store
const sessions = new Set();

// ── Helpers ──────────────────────────────────────────

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return file.includes('site') ? {} : [];
  }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function send(res, data, code = 200) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
}

function getCookie(req, name) {
  const match = (req.headers.cookie || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function isAuthed(req) {
  return sessions.has(getCookie(req, 'session_id'));
}

function requireAuth(req, res) {
  if (!isAuthed(req)) { send(res, { error: 'Unauthorized' }, 401); return false; }
  return true;
}

function genId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// ── Generic CRUD for list resources ──────────────────
// GET    /resource       → all items
// POST   /resource       → create (needs auth)
// PUT    /resource?id=X  → update by id (needs auth)
// DELETE /resource?id=X  → delete by id (needs auth)

async function handleList(req, res, file, method, query) {
  if (method === 'GET') {
    return send(res, readJson(file));
  }
  if (!requireAuth(req, res)) return;

  const body = await parseBody(req);

  if (method === 'POST') {
    const items = readJson(file);
    const item = { ...body, id: body.id || genId() };
    items.push(item);
    writeJson(file, items);
    return send(res, item, 201);
  }

  if (method === 'PUT') {
    const id = query.id;
    if (!id) return send(res, { error: 'id required' }, 400);
    const items = readJson(file);
    const idx = items.findIndex(i => String(i.id) === String(id));
    if (idx === -1) return send(res, { error: 'Not found' }, 404);
    items[idx] = { ...items[idx], ...body, id: items[idx].id };
    writeJson(file, items);
    return send(res, items[idx]);
  }

  if (method === 'DELETE') {
    const id = query.id;
    if (!id) return send(res, { error: 'id required' }, 400);
    const items = readJson(file);
    const filtered = items.filter(i => String(i.id) !== String(id));
    if (filtered.length === items.length) return send(res, { error: 'Not found' }, 404);
    writeJson(file, filtered);
    return send(res, { success: true });
  }

  send(res, { error: 'Method not allowed' }, 405);
}

// ── Server ────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || 'http://localhost:3002';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed = url.parse(req.url, true);
  // strip /api prefix if present
  const pathname = parsed.pathname.replace(/^\/api/, '').replace(/\.php$/, '');
  const method = req.method;
  const query = parsed.query;

  // ── Auth ────────────────────────────────────────────
  if (pathname === '/auth') {
    const sid = getCookie(req, 'session_id');

    if (method === 'GET') return send(res, { authenticated: sessions.has(sid) });

    if (method === 'POST') {
      const body = await parseBody(req);
      if (body.login === 'admin' && body.password === 'dform2025') {
        const id = `sess_${genId()}`;
        sessions.add(id);
        res.setHeader('Set-Cookie', `session_id=${id}; Path=/; HttpOnly; SameSite=Lax`);
        return send(res, { success: true });
      }
      return send(res, { error: 'Invalid credentials' }, 401);
    }

    if (method === 'DELETE') {
      if (sid) sessions.delete(sid);
      res.setHeader('Set-Cookie', 'session_id=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
      return send(res, { success: true });
    }
  }

  // ── Orders ──────────────────────────────────────────
  if (pathname === '/orders') {
    if (method === 'GET') {
      const orders = readJson(FILES.orders);
      orders.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return send(res, orders);
    }

    if (method === 'POST') {
      const body = await parseBody(req);
      for (const f of ['name', 'email', 'service', 'description']) {
        if (!body[f]) return send(res, { error: `Field '${f}' is required` }, 400);
      }
      if (!/\S+@\S+\.\S+/.test(body.email)) return send(res, { error: 'Invalid email' }, 400);

      const orders = readJson(FILES.orders);
      const order = {
        id: `ord_${genId()}`,
        name: String(body.name).trim(),
        email: String(body.email).trim(),
        phone: String(body.phone || '').trim(),
        service: String(body.service).trim(),
        description: String(body.description).trim(),
        budget: String(body.budget || '').trim(),
        status: 'new',
        created_at: new Date().toISOString(),
      };
      orders.push(order);
      writeJson(FILES.orders, orders);

      const analytics = readJson(FILES.analytics);
      const day = new Date().toISOString().slice(0, 10);
      analytics.total_orders = (analytics.total_orders || 0) + 1;
      analytics.orders_by_day = analytics.orders_by_day || {};
      analytics.orders_by_day[day] = (analytics.orders_by_day[day] || 0) + 1;
      writeJson(FILES.analytics, analytics);

      return send(res, { success: true, order }, 201);
    }

    if (method === 'PUT') {
      if (!requireAuth(req, res)) return;
      const id = query.id;
      if (!id) return send(res, { error: 'Order id required' }, 400);
      const body = await parseBody(req);
      const allowed = ['new', 'in_progress', 'completed', 'cancelled'];
      if (!allowed.includes(body.status)) return send(res, { error: 'Invalid status' }, 400);
      const orders = readJson(FILES.orders);
      let found = false;
      for (const o of orders) {
        if (o.id === id) { o.status = body.status; o.updated_at = new Date().toISOString(); found = true; break; }
      }
      if (!found) return send(res, { error: 'Not found' }, 404);
      writeJson(FILES.orders, orders);
      return send(res, { success: true });
    }
  }

  // ── Analytics ────────────────────────────────────────
  if (pathname === '/analytics') {
    if (method !== 'GET') return send(res, { error: 'Method not allowed' }, 405);
    const orders = readJson(FILES.orders);
    const analytics = readJson(FILES.analytics);
    const by_status = { new: 0, in_progress: 0, completed: 0, cancelled: 0 };
    const by_service = {};
    for (const o of orders) {
      if (by_status[o.status] !== undefined) by_status[o.status]++;
      by_service[o.service] = (by_service[o.service] || 0) + 1;
    }
    const orders_by_day = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      orders_by_day[d] = (analytics.orders_by_day || {})[d] || 0;
    }
    return send(res, { total_orders: orders.length, by_status, by_service, orders_by_day });
  }

  // ── Portfolio ────────────────────────────────────────
  if (pathname === '/portfolio') {
    return handleList(req, res, FILES.portfolio, method, query);
  }

  // ── Services ─────────────────────────────────────────
  if (pathname === '/services') {
    return handleList(req, res, FILES.services, method, query);
  }

  // ── Team ─────────────────────────────────────────────
  if (pathname === '/team') {
    return handleList(req, res, FILES.team, method, query);
  }

  // ── Site settings ────────────────────────────────────
  // GET  /site          → full site object
  // PUT  /site?section= → update specific section (auth required)
  if (pathname === '/site') {
    if (method === 'GET') {
      return send(res, readJson(FILES.site));
    }

    if (!requireAuth(req, res)) return;

    if (method === 'PUT') {
      const section = query.section;
      const body = await parseBody(req);
      const site = readJson(FILES.site);

      if (section) {
        site[section] = body;
      } else {
        Object.assign(site, body);
      }
      writeJson(FILES.site, site);
      return send(res, { success: true, data: section ? site[section] : site });
    }
  }

  // ── Site sub-lists (clients, stats, values, contacts, social) ──
  // These are arrays inside site.json, managed via:
  // GET    /site/clients          → array
  // POST   /site/clients          → add item (auth)
  // PUT    /site/clients?idx=N    → replace item at index (auth)
  // DELETE /site/clients?idx=N    → remove item (auth)
  const siteListMatch = pathname.match(/^\/site\/(clients|stats|values|contacts|social)$/);
  if (siteListMatch) {
    const key = siteListMatch[1];
    const site = readJson(FILES.site);
    const list = site[key] || [];

    if (method === 'GET') return send(res, list);

    if (!requireAuth(req, res)) return;

    const body = await parseBody(req);

    if (method === 'POST') {
      list.push(body);
      site[key] = list;
      writeJson(FILES.site, site);
      return send(res, { success: true, data: list }, 201);
    }

    const idx = parseInt(query.idx, 10);
    if (isNaN(idx) || idx < 0 || idx >= list.length) return send(res, { error: 'Invalid index' }, 400);

    if (method === 'PUT') {
      list[idx] = body;
      site[key] = list;
      writeJson(FILES.site, site);
      return send(res, { success: true, data: list });
    }

    if (method === 'DELETE') {
      list.splice(idx, 1);
      site[key] = list;
      writeJson(FILES.site, site);
      return send(res, { success: true, data: list });
    }
  }

  // В production — отдаём статику React
  if (IS_PROD) {
    const filePath = path.join(STATIC_DIR, pathname === '/' ? 'index.html' : pathname);
    return serveStatic(res, filePath);
  }

  send(res, { error: 'Not found' }, 404);
});

server.listen(PORT, () => {
  console.log(`DFORM Backend running at http://localhost:${PORT}`);
});
