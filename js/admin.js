/**
 * Admin & Kitchen Order Monitor Engine (Matcha Tcih KDS)
 * Handles real-time order tracking, status toggling, and live revenue analytics.
 */

export class AdminOrderMonitor {
    constructor() {
        this.ordersGrid = document.querySelector('#orders-grid');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.searchInput = document.querySelector('#search-orders');
        this.liveClock = document.querySelector('#admin-clock');

        // KPI elements
        this.statRevenue = document.querySelector('#stat-revenue');
        this.statActive = document.querySelector('#stat-active');
        this.statCompleted = document.querySelector('#stat-completed');
        this.statTotal = document.querySelector('#stat-total');

        // Header action buttons
        this.clearBtn = document.querySelector('#clear-orders-btn');
        this.sampleOrderBtn = document.querySelector('#sample-order-btn');

        // State
        this.currentFilter = 'all'; // 'all' | 'brewing' | 'completed'
        this.searchQuery = '';
        this.orders = this.loadOrders();

        this.init();
    }

    init() {
        this.bindEvents();
        this.startClock();
        this.render();
        this.setupRealtimeSync();
    }

    loadOrders() {
        try {
            const saved = localStorage.getItem('matcha_orders');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            }
        } catch (e) {
            console.warn('Failed to parse orders:', e);
        }

        // Default seed orders so the monitor looks rich immediately
        const seedOrders = [
            {
                id: 'MTC-7241',
                timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
                timeFormatted: new Date(Date.now() - 6 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dateFormatted: new Date().toLocaleDateString(),
                status: 'brewing',
                table: 'Bar #2',
                items: [
                    { name: 'Custom Uji Ceremonial', spec: '2.5g Matcha • Oat Milk Cloud', price: 4.50, qty: 2 },
                    { name: 'Matcha Yuzu Sparkle', spec: 'Citrus Botanical', price: 5.20, qty: 1 }
                ],
                total: 14.20
            },
            {
                id: 'MTC-6819',
                timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
                timeFormatted: new Date(Date.now() - 18 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dateFormatted: new Date().toLocaleDateString(),
                status: 'completed',
                table: 'Takeaway Kiosk',
                items: [
                    { name: 'Ceremonial Cold Foam', spec: 'Signature Cold', price: 4.80, qty: 1 },
                    { name: 'Sakura Cloud Latte', spec: 'Floral Fusion', price: 5.50, qty: 1 }
                ],
                total: 10.30
            }
        ];

        this.saveOrders(seedOrders);
        return seedOrders;
    }

    saveOrders(ordersToSave = null) {
        try {
            const data = ordersToSave || this.orders;
            localStorage.setItem('matcha_orders', JSON.stringify(data));
        } catch (e) {
            console.warn('Failed to save orders:', e);
        }
    }

    bindEvents() {
        // Filter tabs
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter || 'all';
                this.render();
            });
        });

        // Search input
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase().trim();
                this.render();
            });
        }

        // Test sample order button
        if (this.sampleOrderBtn) {
            this.sampleOrderBtn.addEventListener('click', () => {
                this.generateTestOrder();
            });
        }

        // Clear orders button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat pesanan monitor?')) {
                    this.orders = [];
                    this.saveOrders();
                    this.render();
                }
            });
        }
    }

    startClock() {
        const update = () => {
            if (this.liveClock) {
                const now = new Date();
                this.liveClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
            }
        };
        update();
        setInterval(update, 1000);
    }

    setupRealtimeSync() {
        // Cross-tab storage synchronization
        window.addEventListener('storage', (e) => {
            if (!e.key || e.key === 'matcha_orders') {
                this.orders = this.loadOrders();
                this.render();
                this.playChime();
            }
        });

        // Light polling fallback
        setInterval(() => {
            const raw = localStorage.getItem('matcha_orders');
            if (raw) {
                const currentCount = this.orders.length;
                const parsed = JSON.parse(raw);
                if (parsed.length !== currentCount) {
                    this.orders = parsed;
                    this.render();
                    if (parsed.length > currentCount) {
                        this.playChime();
                    }
                }
            }
        }, 2000);
    }

    playChime() {
        try {
            // Synthesize subtle pleasant audio notification via Web Audio API
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch {}
    }

    generateTestOrder() {
        const sampleRecipes = [
            { name: 'Custom Uji Ceremonial', spec: '3.0g Matcha • Oat Cloud', price: 4.70 },
            { name: 'Matcha Yuzu Sparkle', spec: 'Citrus Botanical', price: 5.20 },
            { name: 'Custom Hojicha Blend', spec: '2.5g Hojicha • Vanilla Foam', price: 4.50 },
            { name: 'Ceremonial Cold Foam', spec: 'Signature Cold', price: 4.80 }
        ];

        const pick1 = sampleRecipes[Math.floor(Math.random() * sampleRecipes.length)];
        const pick2 = Math.random() > 0.4 ? sampleRecipes[Math.floor(Math.random() * sampleRecipes.length)] : null;

        const items = [{ ...pick1, qty: 1 }];
        if (pick2 && pick2.name !== pick1.name) items.push({ ...pick2, qty: 1 });

        const total = items.reduce((sum, i) => sum + (i.price * i.qty), 0);

        const newOrder = {
            id: 'MTC-' + Math.floor(1000 + Math.random() * 9000),
            timestamp: new Date().toISOString(),
            timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateFormatted: new Date().toLocaleDateString(),
            status: 'brewing',
            table: 'Kiosk Order #' + Math.floor(1 + Math.random() * 12),
            items: items,
            total: parseFloat(total.toFixed(2))
        };

        this.orders.unshift(newOrder);
        this.saveOrders();
        this.render();
        this.playChime();
    }

    toggleStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = order.status === 'brewing' ? 'completed' : 'brewing';
        this.saveOrders();
        this.render();
    }

    updateKPIs() {
        const totalRevenue = this.orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);

        const activeCount = this.orders.filter(o => o.status === 'brewing').length;
        const completedCount = this.orders.filter(o => o.status === 'completed').length;

        if (this.statRevenue) this.statRevenue.textContent = `$${totalRevenue.toFixed(2)}`;
        if (this.statActive) this.statActive.textContent = activeCount;
        if (this.statCompleted) this.statCompleted.textContent = completedCount;
        if (this.statTotal) this.statTotal.textContent = this.orders.length;
    }

    render() {
        this.updateKPIs();
        if (!this.ordersGrid) return;

        // Apply filters
        let filtered = this.orders;

        if (this.currentFilter === 'brewing') {
            filtered = filtered.filter(o => o.status === 'brewing');
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(o => o.status === 'completed');
        }

        // Apply search query
        if (this.searchQuery) {
            filtered = filtered.filter(o => {
                const matchId = o.id.toLowerCase().includes(this.searchQuery);
                const matchTable = (o.table || '').toLowerCase().includes(this.searchQuery);
                const matchItem = o.items && o.items.some(i => i.name.toLowerCase().includes(this.searchQuery) || (i.spec && i.spec.toLowerCase().includes(this.searchQuery)));
                return matchId || matchTable || matchItem;
            });
        }

        if (!filtered.length) {
            this.ordersGrid.innerHTML = `
                <div class="orders-empty-state">
                    <div class="orders-empty-icon">🍵</div>
                    <h3>Tidak Ada Pesanan</h3>
                    <p>Pesanan baru yang dicheckout dari kiosk akan otomatis muncul di sini.</p>
                </div>
            `;
            return;
        }

        this.ordersGrid.innerHTML = '';
        filtered.forEach(order => {
            const isBrewing = order.status === 'brewing';
            const card = document.createElement('article');
            card.className = `order-card status-${order.status}`;

            const itemsHtml = (order.items || []).map(item => `
                <div class="order-item-row">
                    <div class="order-item-main">
                        <span class="order-item-title">${item.qty}x ${item.name}</span>
                        <span class="order-item-spec">${item.spec || ''}</span>
                    </div>
                    <span class="order-item-price">$${(item.price * item.qty).toFixed(2)}</span>
                </div>
            `).join('');

            card.innerHTML = `
                <div class="order-card-header">
                    <div class="order-id-wrap">
                        <span class="order-id">#${order.id}</span>
                        <span class="order-timestamp">${order.timeFormatted} • ${order.table || 'Kiosk'}</span>
                    </div>
                    <span class="status-badge ${order.status}">
                        ${isBrewing ? '⏳ Brewing' : '✔ Completed'}
                    </span>
                </div>

                <div class="order-items-list">
                    ${itemsHtml}
                </div>

                <div class="order-card-footer">
                    <div class="order-total-block">
                        <span class="order-total-label">Total Amount</span>
                        <span class="order-total-amount">$${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                    <button class="order-action-btn ${isBrewing ? 'finish-btn' : 'reopen-btn'}" data-order-id="${order.id}">
                        ${isBrewing ? 'Selesai Seduh ✔' : 'Buka Ulang ↺'}
                    </button>
                </div>
            `;

            this.ordersGrid.appendChild(card);
        });

        // Bind status toggle buttons
        this.ordersGrid.querySelectorAll('.order-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.orderId;
                this.toggleStatus(id);
            });
        });
    }
}

// Auto-initialize when loaded in browser
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminOrderMonitor = new AdminOrderMonitor();
    });
}
