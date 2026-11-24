/**
 * MatchaTcih • Native SQLite & HTTP Server
 * Serves web application assets and provides a persistent SQLite database for orders.
 * Zero external dependencies — uses Node.js 22+ native node:sqlite and built-in modules.
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'matcha_cafe.sqlite');
const BACKUP_JSON_FILE = path.join(DATA_DIR, 'orders_backup.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize SQLite Database
let db = null;
let useJsonFallback = false;

try {
  const { DatabaseSync } = await import('node:sqlite');
  db = new DatabaseSync(DB_FILE);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');

  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_name TEXT NOT NULL,
      menu_items TEXT NOT NULL,
      total_qty INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      status TEXT DEFAULT 'brewing',
      table_number TEXT,
      created_at TEXT NOT NULL,
      date_formatted TEXT,
      time_formatted TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_name);
  `);
  // Safe migration: add payment_status column if it does not exist yet
  try {
    db.exec("ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'unpaid'");
  } catch (_) {}
  console.log('✅ SQLite Database initialized:', DB_FILE);
} catch (err) {
  console.warn('⚠️ node:sqlite unavailable, using JSON file database fallback:', err.message);
  useJsonFallback = true;
  if (!fs.existsSync(BACKUP_JSON_FILE)) {
    fs.writeFileSync(BACKUP_JSON_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

// JSON Fallback Helpers
function readJsonDb() {
  try {
    if (fs.existsSync(BACKUP_JSON_FILE)) {
      return JSON.parse(fs.readFileSync(BACKUP_JSON_FILE, 'utf-8'));
    }
  } catch (e) {
    console.error('Failed reading backup json:', e);
  }
  return [];
}

function writeJsonDb(data) {
  try {
    fs.writeFileSync(BACKUP_JSON_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed writing backup json:', e);
  }
}

// Database Operations
function getAllOrdersFromDb() {
  if (!useJsonFallback && db) {
    const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
    const rows = stmt.all();
    return rows.map(r => {
      let items = [];
      try { items = JSON.parse(r.menu_items); } catch { items = []; }
      return {
        id: r.id,
        customerName: r.customer_name,
        table: r.table_number,
        status: r.status,
        paymentStatus: r.payment_status || 'unpaid',
        totalQty: r.total_qty,
        total: r.total_price,
        totalIDR: r.total_price,
        totalFormattedIDR: `Rp ${Number(r.total_price).toLocaleString('id-ID')}`,
        timestamp: r.created_at,
        dateFormatted: r.date_formatted,
        timeFormatted: r.time_formatted,
        items: items
      };
    });
  }
  return readJsonDb();
}

function insertOrderIntoDb(order) {
  const customerName = order.customerName || order.customer_name || 'Pelanggan';
  const table = order.table || order.table_number || 'Kiosk';
  const status = order.status || 'brewing';
  const paymentStatus = order.paymentStatus || order.payment_status || 'unpaid';
  const items = Array.isArray(order.items) ? order.items : [];
  const totalQty = order.totalQty || items.reduce((s, i) => s + (i.qty || 1), 0);
  const totalIDR = order.totalIDR || order.total || order.total_price || 0;
  const createdAt = order.timestamp || order.created_at || new Date().toISOString();
  const dateFormatted = order.dateFormatted || new Date(createdAt).toLocaleDateString('id-ID');
  const timeFormatted = order.timeFormatted || new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (!useJsonFallback && db) {
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO orders 
      (id, customer_name, menu_items, total_qty, total_price, status, payment_status, table_number, created_at, date_formatted, time_formatted)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      order.id,
      customerName,
      JSON.stringify(items),
      totalQty,
      totalIDR,
      status,
      paymentStatus,
      table,
      createdAt,
      dateFormatted,
      timeFormatted
    );
  }

  // Also sync to human-readable backup JSON for easy inspection
  const currentJson = readJsonDb().filter(o => o.id !== order.id);
  currentJson.unshift({
    id: order.id,
    customerName,
    table,
    status,
    paymentStatus,
    totalQty,
    total: totalIDR,
    totalIDR,
    totalFormattedIDR: `Rp ${Number(totalIDR).toLocaleString('id-ID')}`,
    timestamp: createdAt,
    dateFormatted,
    timeFormatted,
    items
  });
  writeJsonDb(currentJson);

  return {
    id: order.id,
    customerName,
    totalQty,
    totalIDR,
    status,
    paymentStatus,
    timestamp: createdAt
  };
}

function updateOrderInDb(id, fields = {}) {
  if (!useJsonFallback && db) {
    if (fields.status) {
      db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(fields.status, id);
    }
    if (fields.paymentStatus) {
      db.prepare('UPDATE orders SET payment_status = ? WHERE id = ?').run(fields.paymentStatus, id);
    }
  }
  const currentJson = readJsonDb();
  const item = currentJson.find(o => o.id === id);
  if (item) {
    if (fields.status) item.status = fields.status;
    if (fields.paymentStatus) item.paymentStatus = fields.paymentStatus;
    writeJsonDb(currentJson);
  }
}

function deleteOrderFromDb(id) {
  if (!useJsonFallback && db) {
    const stmt = db.prepare('DELETE FROM orders WHERE id = ?');
    stmt.run(id);
  }
  const currentJson = readJsonDb().filter(o => o.id !== id);
  writeJsonDb(currentJson);
}

function clearAllOrdersFromDb() {
  if (!useJsonFallback && db) {
    db.prepare('DELETE FROM orders').run();
  }
  writeJsonDb([]);
}

// MIME Types Map
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.glb': 'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.obj': 'text/plain',
  '.mtl': 'text/plain',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

// HTTP Request Handler
const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Set CORS headers for local development flexibility
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API ROUTING
  // 1. GET /api/orders -> List all orders
  if (pathname === '/api/orders' && req.method === 'GET') {
    const orders = getAllOrdersFromDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, synced: true, driver: useJsonFallback ? 'JSON File' : 'SQLite 3', count: orders.length, orders }));
    return;
  }

  // 2. POST /api/orders -> Insert new order
  if (pathname === '/api/orders' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const orderData = JSON.parse(body);
        if (!orderData.id) {
          orderData.id = 'MTC-' + Math.floor(1000 + Math.random() * 9000);
        }
        const saved = insertOrderIntoDb(orderData);
        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, synced: true, message: 'Pesanan berhasil disimpan ke database!', order: saved }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 3. PUT /api/orders/:id or /api/orders?id=... -> Update status / paymentStatus
  if ((pathname === '/api/orders' || pathname.startsWith('/api/orders/')) && req.method === 'PUT') {
    const orderId = pathname.startsWith('/api/orders/')
      ? decodeURIComponent(pathname.replace('/api/orders/', ''))
      : parsedUrl.searchParams.get('id');
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body || '{}');
        const targetId = orderId || payload.id;
        updateOrderInDb(targetId, payload);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, synced: true, message: `Pesanan #${targetId} diperbarui` }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: err.message }));
      }
    });
    return;
  }

  // 4. DELETE /api/orders/:id or /api/orders?id=... or /api/orders?all=true
  if ((pathname === '/api/orders' || pathname.startsWith('/api/orders/')) && req.method === 'DELETE') {
    if (parsedUrl.searchParams.get('all') === 'true') {
      clearAllOrdersFromDb();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, synced: true, cleared: true }));
      return;
    }
    const orderId = pathname.startsWith('/api/orders/')
      ? decodeURIComponent(pathname.replace('/api/orders/', ''))
      : parsedUrl.searchParams.get('id');
    deleteOrderFromDb(orderId);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, synced: true, message: `Pesanan #${orderId} dihapus dari database` }));
    return;
  }

  // 5. GET /api/database/status
  if (pathname === '/api/database/status' && req.method === 'GET') {
    const orders = getAllOrdersFromDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      ok: true,
      driver: useJsonFallback ? 'JSON File Database' : 'SQLite 3 (Native)',
      databaseFile: DB_FILE,
      backupFile: BACKUP_JSON_FILE,
      totalRecords: orders.length,
      connectedAt: new Date().toISOString()
    }));
    return;
  }

  // 6. GET /api/database/export-sql
  if (pathname === '/api/database/export-sql' && req.method === 'GET') {
    const orders = getAllOrdersFromDb();
    let sql = `-- MatchaTcih SQLite Database Export\n-- Generated: ${new Date().toISOString()}\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS orders (\n  id TEXT PRIMARY KEY,\n  customer_name TEXT NOT NULL,\n  menu_items TEXT NOT NULL,\n  total_qty INTEGER NOT NULL,\n  total_price INTEGER NOT NULL,\n  status TEXT DEFAULT 'brewing',\n  table_number TEXT,\n  created_at TEXT NOT NULL,\n  date_formatted TEXT,\n  time_formatted TEXT\n);\n\n`;
    orders.forEach(o => {
      const itemsEscaped = JSON.stringify(o.items || []).replace(/'/g, "''");
      const nameEscaped = (o.customerName || 'Customer').replace(/'/g, "''");
      sql += `INSERT INTO orders VALUES ('${o.id}', '${nameEscaped}', '${itemsEscaped}', ${o.totalQty || 1}, ${o.totalIDR || 0}, '${o.status || 'brewing'}', '${o.table || 'Kiosk'}', '${o.timestamp}', '${o.dateFormatted}', '${o.timeFormatted}');\n`;
    });
    res.writeHead(200, {
      'Content-Type': 'application/sql',
      'Content-Disposition': 'attachment; filename="matcha_database_dump.sql"'
    });
    res.end(sql);
    return;
  }

  // STATIC ASSET SERVING
  // If customer visits root '/', redirect directly to Kiosk (with full Thumbnail Attract Screensaver)
  if (pathname === '/') {
    res.writeHead(302, { 'Location': '/pages/menu/menu.html' });
    res.end();
    return;
  }

  let relativePath = pathname.replace(/^\//, '');
  let filePath = path.join(__dirname, relativePath);

  // Security check: prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // If folder, try index.html inside
      if (stats && stats.isDirectory()) {
        const subIndex = path.join(filePath, 'index.html');
        if (fs.existsSync(subIndex)) {
          serveFile(subIndex, res);
          return;
        }
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404 Not Found: ${pathname}`);
      return;
    }
    serveFile(filePath, res);
  });
});

function serveFile(file, res) {
  const ext = path.extname(file).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(file, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end(`500 Internal Server Error: ${err.message}`);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  });
}

function startServer(portToUse) {
  server.listen(portToUse, () => {
    console.log(`🍵 MatchaTcih Server & Database running on http://localhost:${portToUse}`);
    console.log(`📋 Kiosk Pemesanan (Pelanggan - Menampilkan Thumbnail Terlebih Dahulu): http://localhost:${portToUse}/`);
    console.log(`📊 Admin Portal (Pemilik Bisnis - Langsung Tanpa Thumbnail): http://localhost:${portToUse}/admin.html`);
    console.log(`💾 Database: ${useJsonFallback ? BACKUP_JSON_FILE : DB_FILE}`);
  });
}

server.on('error', (e) => {
  if (e.code === 'EADDRINUSE') {
    const nextPort = Number(PORT) + 1;
    console.warn(`Port ${PORT} in use, automatically trying port ${nextPort}...`);
    startServer(nextPort);
  } else {
    console.error('Server error:', e);
  }
});

startServer(PORT);
