/**
 * MatchaTcih • Universal Database Manager (Client-Side)
 * Orchestrates dual-layer persistence:
 * 1. Persistent IndexedDB (Standard client-side browser database)
 * 2. SQLite Backend API (/api/orders) when server.js is running
 * 3. LocalStorage fallback & cross-tab synchronization
 */

export class MatchaDatabaseManager {
    constructor() {
        this.dbName = 'MatchaCafeDB';
        this.dbVersion = 1;
        this.storeName = 'orders';
        this.idb = null;
        this.isServerAvailable = false;
        this.initPromise = this.init();
    }

    async init() {
        // 1. Initialize IndexedDB
        await this.initIndexedDB();
        // 2. Check Backend Server API
        await this.checkServerAvailability();
        return true;
    }

    /**
     * Initialize standard IndexedDB
     */
    initIndexedDB() {
        return new Promise((resolve) => {
            if (typeof window === 'undefined' || !window.indexedDB) {
                console.warn('[MatchaDB] IndexedDB not supported, falling back to localStorage');
                resolve(null);
                return;
            }

            const request = window.indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
                    store.createIndex('customerName', 'customerName', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('totalIDR', 'totalIDR', { unique: false });
                    console.log('[MatchaDB] IndexedDB Schema initialized (orders store)');
                }
            };

            request.onsuccess = (event) => {
                this.idb = event.target.result;
                console.log('[MatchaDB] IndexedDB connected successfully');
                resolve(this.idb);
            };

            request.onerror = (event) => {
                console.warn('[MatchaDB] IndexedDB open error:', event.target.error);
                resolve(null);
            };
        });
    }

    /**
     * Check if Node.js SQLite server is reachable
     */
    async checkServerAvailability() {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 1200);
            const res = await fetch('/api/database/status', { signal: controller.signal });
            clearTimeout(timeoutId);
            if (res.ok) {
                const data = await res.json();
                this.isServerAvailable = true;
                this.serverDriver = data.driver || 'SQLite 3';
                console.log(`[MatchaDB] Backend SQLite Server active: ${this.serverDriver}`);
                return true;
            }
        } catch {
            this.isServerAvailable = false;
        }
        return false;
    }

    /**
     * Save an order to both IndexedDB and SQLite Server Database
     * @param {Object} order
     */
    async saveOrder(order) {
        await this.initPromise;

        // Ensure proper fields
        const orderRecord = {
            id: order.id || ('MTC-' + Math.floor(1000 + Math.random() * 9000)),
            customerName: (order.customerName || order.nama || 'Pelanggan').trim(),
            table: order.table || 'Kiosk Order #' + Math.floor(1 + Math.random() * 20),
            status: order.status || 'brewing',
            items: Array.isArray(order.items) ? order.items : [],
            totalQty: order.totalQty || (order.items || []).reduce((s, i) => s + (i.qty || 1), 0),
            totalIDR: order.totalIDR || order.total_price || 0,
            totalFormattedIDR: order.totalFormattedIDR || `Rp ${(order.totalIDR || 0).toLocaleString('id-ID')}`,
            timestamp: order.timestamp || new Date().toISOString(),
            dateFormatted: order.dateFormatted || new Date().toLocaleDateString('id-ID'),
            timeFormatted: order.timeFormatted || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        // 1. Save to IndexedDB
        if (this.idb) {
            try {
                await new Promise((resolve, reject) => {
                    const tx = this.idb.transaction(this.storeName, 'readwrite');
                    const store = tx.objectStore(this.storeName);
                    const req = store.put(orderRecord);
                    req.onsuccess = () => resolve(true);
                    req.onerror = (e) => reject(e);
                });
            } catch (err) {
                console.warn('[MatchaDB] Failed to save in IndexedDB:', err);
            }
        }

        // 2. Save to Backend SQLite Server if connected
        if (this.isServerAvailable) {
            try {
                await fetch('/api/orders', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(orderRecord)
                });
            } catch (err) {
                console.warn('[MatchaDB] Server POST failed, order remains in IndexedDB:', err);
            }
        }

        // 3. Sync to localStorage for instant cross-tab KDS events
        try {
            const raw = localStorage.getItem('matcha_orders');
            let list = raw ? JSON.parse(raw) : [];
            list = list.filter(o => o.id !== orderRecord.id);
            list.unshift(orderRecord);
            localStorage.setItem('matcha_orders', JSON.stringify(list));
            window.dispatchEvent(new Event('storage'));
        } catch (e) {
            console.warn('[MatchaDB] LocalStorage sync warning:', e);
        }

        return orderRecord;
    }

    /**
     * Retrieve all orders from database (Priority: SQLite Server -> IndexedDB -> LocalStorage)
     */
    async getAllOrders() {
        await this.initPromise;

        // 1. Try Backend SQLite API
        if (this.isServerAvailable) {
            try {
                const res = await fetch('/api/orders');
                if (res.ok) {
                    const data = await res.json();
                    if (data && Array.isArray(data.orders)) {
                        // Mirror to IndexedDB
                        this.syncToIndexedDB(data.orders);
                        return data.orders;
                    }
                }
            } catch (err) {
                console.warn('[MatchaDB] Failed fetching from server:', err);
            }
        }

        // 2. Try IndexedDB
        if (this.idb) {
            try {
                const idbOrders = await new Promise((resolve) => {
                    const tx = this.idb.transaction(this.storeName, 'readonly');
                    const store = tx.objectStore(this.storeName);
                    const req = store.getAll();
                    req.onsuccess = () => resolve(req.result || []);
                    req.onerror = () => resolve([]);
                });

                if (idbOrders && idbOrders.length > 0) {
                    // Sort by timestamp DESC
                    idbOrders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                    return idbOrders;
                }
            } catch (err) {
                console.warn('[MatchaDB] IndexedDB read error:', err);
            }
        }

        // 3. Fallback to localStorage
        try {
            const raw = localStorage.getItem('matcha_orders');
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    }

    /**
     * Internal sync helper to keep IndexedDB populated
     */
    async syncToIndexedDB(orders) {
        if (!this.idb || !Array.isArray(orders)) return;
        try {
            const tx = this.idb.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            for (const order of orders) {
                store.put(order);
            }
        } catch {}
    }

    /**
     * Update order status
     */
    async updateOrderStatus(id, status) {
        await this.initPromise;

        // 1. Update IndexedDB
        if (this.idb) {
            try {
                await new Promise((resolve) => {
                    const tx = this.idb.transaction(this.storeName, 'readwrite');
                    const store = tx.objectStore(this.storeName);
                    const req = store.get(id);
                    req.onsuccess = () => {
                        const order = req.result;
                        if (order) {
                            order.status = status;
                            store.put(order);
                        }
                        resolve(true);
                    };
                    req.onerror = () => resolve(false);
                });
            } catch {}
        }

        // 2. Update Server
        if (this.isServerAvailable) {
            try {
                await fetch(`/api/orders/${encodeURIComponent(id)}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });
            } catch {}
        }

        // 3. Update localStorage
        try {
            const raw = localStorage.getItem('matcha_orders');
            if (raw) {
                const list = JSON.parse(raw);
                const item = list.find(o => o.id === id);
                if (item) {
                    item.status = status;
                    localStorage.setItem('matcha_orders', JSON.stringify(list));
                    window.dispatchEvent(new Event('storage'));
                }
            }
        } catch {}
    }

    /**
     * Delete an order
     */
    async deleteOrder(id) {
        await this.initPromise;

        // 1. Delete from IndexedDB
        if (this.idb) {
            try {
                const tx = this.idb.transaction(this.storeName, 'readwrite');
                tx.objectStore(this.storeName).delete(id);
            } catch {}
        }

        // 2. Delete from Server
        if (this.isServerAvailable) {
            try {
                await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE' });
            } catch {}
        }

        // 3. Delete from localStorage
        try {
            const raw = localStorage.getItem('matcha_orders');
            if (raw) {
                const list = JSON.parse(raw).filter(o => o.id !== id);
                localStorage.setItem('matcha_orders', JSON.stringify(list));
                window.dispatchEvent(new Event('storage'));
            }
        } catch {}
    }

    /**
     * Clear all orders
     */
    async clearAllOrders() {
        await this.initPromise;

        if (this.idb) {
            try {
                const tx = this.idb.transaction(this.storeName, 'readwrite');
                tx.objectStore(this.storeName).clear();
            } catch {}
        }

        localStorage.removeItem('matcha_orders');
        window.dispatchEvent(new Event('storage'));
    }

    /**
     * Get Database Information and Status for Admin Panel
     */
    async getDatabaseInfo() {
        await this.initPromise;
        const orders = await this.getAllOrders();

        let storageTypes = [];
        if (this.isServerAvailable) storageTypes.push(`SQLite Database (server.js - ${this.serverDriver || 'Active'})`);
        if (this.idb) storageTypes.push('IndexedDB (Browser Disk)');
        storageTypes.push('LocalStorage (Realtime Channel)');

        return {
            connected: true,
            storageType: storageTypes.join(' + '),
            isServerAvailable: this.isServerAvailable,
            hasIndexedDB: !!this.idb,
            totalOrders: orders.length,
            dbName: this.dbName,
            orders
        };
    }
}

// Global Singleton Instance
export const matchaDB = new MatchaDatabaseManager();
if (typeof window !== 'undefined') {
    window.matchaDB = matchaDB;
}
