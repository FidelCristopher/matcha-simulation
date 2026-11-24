/**
 * MatchaTcih • Vercel Serverless Cloud Orders API (/api/orders)
 * Zero-dependency REST handler using Upstash Redis / Vercel KV REST API.
 * Enables real-time order synchronization across all devices (Customer Phones -> All Admin Dashboards).
 */

const ORDERS_KEY = 'matchatcih:orders:v1';

function getRedisConfig() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (url && token) {
    return { url: url.replace(/\/$/, ''), token };
  }
  return null;
}

async function redisCommand(config, commandParts) {
  const res = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(commandParts)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Redis REST error (${res.status}): ${text}`);
  }
  const data = await res.json();
  return data.result;
}

async function loadOrdersFromCloud(config) {
  const raw = await redisCommand(config, ['GET', ORDERS_KEY]);
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveOrdersToCloud(config, orders) {
  await redisCommand(config, ['SET', ORDERS_KEY, JSON.stringify(orders)]);
}

function normalizeOrder(order) {
  return {
    id: order.id || 'MTC-' + Math.floor(1000 + Math.random() * 9000),
    customerName: order.customerName || 'Pelanggan',
    table: order.table || 'Kiosk',
    status: order.status || 'brewing',
    paymentStatus: order.paymentStatus || 'unpaid',
    items: Array.isArray(order.items) ? order.items : [],
    totalQty: Number(order.totalQty) || (Array.isArray(order.items) ? order.items.reduce((s, i) => s + (i.qty || 1), 0) : 1),
    total: Number(order.totalIDR || order.total || 0),
    totalIDR: Number(order.totalIDR || order.total || 0),
    totalFormattedIDR: order.totalFormattedIDR || `Rp ${Number(order.totalIDR || order.total || 0).toLocaleString('id-ID')}`,
    timestamp: order.timestamp || new Date().toISOString(),
    dateFormatted: order.dateFormatted || new Date().toLocaleDateString('id-ID'),
    timeFormatted: order.timeFormatted || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  const redis = getRedisConfig();
  if (!redis) {
    return res.status(200).json({
      ok: false,
      synced: false,
      driver: 'Local Browser Storage Only',
      reason: 'CLOUD_DB_NOT_CONFIGURED',
      orders: []
    });
  }

  try {
    // 1. GET /api/orders -> Fetch all synced orders
    if (req.method === 'GET') {
      const orders = await loadOrdersFromCloud(redis);
      orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return res.status(200).json({
        ok: true,
        synced: true,
        driver: 'Cloud Redis Sync',
        count: orders.length,
        orders
      });
    }

    // 2. POST /api/orders -> Insert new order
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const newOrder = normalizeOrder(body);
      const orders = await loadOrdersFromCloud(redis);
      const filtered = orders.filter(o => o.id !== newOrder.id);
      filtered.unshift(newOrder);
      // Keep latest 500 orders
      const trimmed = filtered.slice(0, 500);
      await saveOrdersToCloud(redis, trimmed);
      return res.status(201).json({
        ok: true,
        synced: true,
        order: newOrder
      });
    }

    // 3. PUT /api/orders?id=... -> Update status or paymentStatus
    if (req.method === 'PUT') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
      const targetId = req.query?.id || body.id;
      if (!targetId) {
        return res.status(400).json({ ok: false, error: 'Missing order id' });
      }
      const orders = await loadOrdersFromCloud(redis);
      const target = orders.find(o => o.id === targetId);
      if (!target) {
        return res.status(404).json({ ok: false, error: 'Order not found' });
      }
      if (body.status) target.status = body.status;
      if (body.paymentStatus) target.paymentStatus = body.paymentStatus;
      await saveOrdersToCloud(redis, orders);
      return res.status(200).json({
        ok: true,
        synced: true,
        order: target
      });
    }

    // 4. DELETE /api/orders?id=... or ?all=true -> Delete one or all orders
    if (req.method === 'DELETE') {
      const deleteAll = req.query?.all === 'true';
      const targetId = req.query?.id;
      if (deleteAll) {
        await saveOrdersToCloud(redis, []);
        return res.status(200).json({ ok: true, synced: true, cleared: true });
      }
      if (!targetId) {
        return res.status(400).json({ ok: false, error: 'Missing order id' });
      }
      const orders = await loadOrdersFromCloud(redis);
      const next = orders.filter(o => o.id !== targetId);
      await saveOrdersToCloud(redis, next);
      return res.status(200).json({ ok: true, synced: true, deletedId: targetId });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    console.error('[API /api/orders] Error:', err);
    return res.status(500).json({
      ok: false,
      synced: false,
      error: err.message || 'Internal Server Error'
    });
  }
}
