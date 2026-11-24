/**
 * Admin & Kitchen Order Monitor Engine (MatchaTcih KDS)
 * Handles real-time cross-device order tracking, payment verification, status toggling, and Excel/PDF exports.
 */
import { matchaDB } from './db.js';

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

        // Export elements
        this.excelBtn = document.querySelector('#export-excel-btn');
        this.pdfBtn = document.querySelector('#export-pdf-btn');
        this.exportCountLabel = document.querySelector('#export-orders-count');

        // Authentication Elements
        this.authOverlay = document.querySelector('#admin-auth-overlay');
        this.authCard = document.querySelector('#auth-card');
        this.authForm = document.querySelector('#admin-auth-form');
        this.userInput = document.querySelector('#admin-auth-user');
        this.passInput = document.querySelector('#admin-auth-pass');
        this.feedback = document.querySelector('#admin-auth-feedback');
        this.togglePassBtn = document.querySelector('#auth-toggle-pass');
        this.logoutBtn = document.querySelector('#admin-logout-btn');
        this.adminMain = document.querySelector('.admin-main');
        this.adminHeader = document.querySelector('.admin-header');
        this.syncStatusText = document.querySelector('#sync-status-text');

        // State
        this.currentFilter = 'all'; // 'all' | 'unpaid' | 'paid' | 'brewing' | 'completed'
        this.searchQuery = '';
        this.orders = this.loadOrders();
        this.lastOrderIds = new Set(this.orders.map(o => o.id));

        this.init();
    }

    init() {
        this.initAuth();
        this.bindEvents();
        this.startClock();
        this.render();
        this.setupRealtimeSync();
        this.syncFromCloud(false);
    }

    initAuth() {
        this.bindAuthEvents();
        const isAuth = sessionStorage.getItem('matchatcih_admin_auth') === 'verified';
        if (isAuth) {
            this.unlockDashboard(false);
        } else {
            this.lockDashboard();
        }
    }

    unlockDashboard(smooth = true) {
        if (!this.authOverlay) return;
        this.authOverlay.classList.add('unlocked');
        if (this.adminMain) this.adminMain.style.filter = '';
        if (this.adminHeader) this.adminHeader.style.filter = '';
        if (smooth) {
            setTimeout(() => {
                if (this.authOverlay) this.authOverlay.style.display = 'none';
            }, 400);
        } else {
            this.authOverlay.style.display = 'none';
        }
    }

    lockDashboard() {
        if (!this.authOverlay) return;
        this.authOverlay.style.display = 'flex';
        // Force reflow
        void this.authOverlay.offsetWidth;
        this.authOverlay.classList.remove('unlocked');
        if (this.adminMain) this.adminMain.style.filter = 'blur(12px)';
        if (this.adminHeader) this.adminHeader.style.filter = 'blur(12px)';
        if (this.passInput) this.passInput.value = '';
        if (this.userInput) {
            this.userInput.value = '';
            setTimeout(() => this.userInput.focus(), 100);
        }
        if (this.feedback) {
            this.feedback.style.display = 'none';
            this.feedback.textContent = '';
        }
    }

    bindAuthEvents() {
        // Toggle password show/hide
        if (this.togglePassBtn && this.passInput) {
            this.togglePassBtn.addEventListener('click', () => {
                const isPassword = this.passInput.type === 'password';
                this.passInput.type = isPassword ? 'text' : 'password';
                const eyeOpen = this.togglePassBtn.querySelector('.eye-open');
                const eyeClosed = this.togglePassBtn.querySelector('.eye-closed');
                if (eyeOpen) eyeOpen.style.display = isPassword ? 'none' : 'block';
                if (eyeClosed) eyeClosed.style.display = isPassword ? 'block' : 'none';
            });
        }

        // Form Submit Authentication
        if (this.authForm) {
            this.authForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const user = (this.userInput?.value || '').trim();
                const pass = (this.passInput?.value || '').trim();

                // Strict Credentials verification: admin / matchatcih.enak
                if (user === 'admin' && pass === 'matchatcih.enak') {
                    sessionStorage.setItem('matchatcih_admin_auth', 'verified');
                    this.unlockDashboard(true);
                    this.playChime();
                } else {
                    if (this.feedback) {
                        this.feedback.textContent = 'Username atau password salah. Akses ditolak!';
                        this.feedback.style.display = 'block';
                    }
                    if (this.authCard) {
                        this.authCard.classList.remove('shake');
                        void this.authCard.offsetWidth; // trigger reflow
                        this.authCard.classList.add('shake');
                    }
                    if (this.passInput) {
                        this.passInput.value = '';
                        this.passInput.focus();
                    }
                }
            });
        }

        // Logout Button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                if (confirm('Kunci dan keluar dari sesi dashboard admin?')) {
                    sessionStorage.removeItem('matchatcih_admin_auth');
                    this.lockDashboard();
                }
            });
        }
    }

    loadOrders() {
        try {
            const saved = localStorage.getItem('matcha_orders');
            if (saved !== null) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) return parsed;
            }
        } catch (e) {
            console.warn('Failed to parse orders:', e);
        }

        // Only create seed orders if matcha_orders has never been initialized at all
        const isInitialized = localStorage.getItem('matcha_orders_init');
        if (isInitialized) {
            return [];
        }

        localStorage.setItem('matcha_orders_init', 'true');
        const seedOrders = [
            {
                id: 'MTC-7241',
                customerName: 'Alya Ramadhani',
                timestamp: new Date(Date.now() - 6 * 60000).toISOString(),
                timeFormatted: new Date(Date.now() - 6 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dateFormatted: new Date().toLocaleDateString('id-ID'),
                status: 'brewing',
                table: 'Bar #2',
                items: [
                    { name: 'ICE MATCHA LATTE', spec: '2.5g Matcha • Fresh Milk • 70% Gula', priceIDR: 25000, price: 25000, qty: 2 },
                    { name: 'ICE MATCHARICANO', spec: 'Americano Matcha • Normal Ice', priceIDR: 22000, price: 22000, qty: 1 }
                ],
                totalIDR: 72000,
                total: 72000
            },
            {
                id: 'MTC-6819',
                customerName: 'Dimas Prasetyo',
                timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
                timeFormatted: new Date(Date.now() - 18 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dateFormatted: new Date().toLocaleDateString('id-ID'),
                status: 'completed',
                table: 'Takeaway Kiosk',
                items: [
                    { name: 'ICE MATCHA CHOCOLATE', spec: 'Layer Cokelat Belgia • Oat Milk', priceIDR: 28000, price: 28000, qty: 1 },
                    { name: 'ICE MATCHA VANILLA FOAM', spec: 'Cloud Foam • Less Sweet', priceIDR: 28000, price: 28000, qty: 1 }
                ],
                totalIDR: 56000,
                total: 56000
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
            this.clearBtn.addEventListener('click', async () => {
                if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat pesanan monitor?')) {
                    this.orders = [];
                    this.saveOrders();
                    await matchaDB.clearAllOrders();
                    this.render();
                }
            });
        }

        // Export Excel (.xlsx) button
        if (this.excelBtn) {
            this.excelBtn.addEventListener('click', () => this.exportToExcel());
        }

        // Export PDF (.pdf) button
        if (this.pdfBtn) {
            this.pdfBtn.addEventListener('click', () => this.exportToPDF());
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

    async syncFromCloud(allowChime = true) {
        try {
            const fetched = await matchaDB.getAllOrders();
            if (this.syncStatusText) {
                this.syncStatusText.textContent = matchaDB.isServerAvailable
                    ? `Live Sync • ${matchaDB.serverDriver || 'Cloud'}`
                    : 'Live Monitor • Mode Lokal';
            }
            if (Array.isArray(fetched) && (matchaDB.isServerAvailable || fetched.length > 0)) {
                const prevIds = this.lastOrderIds;
                const hasNewOrder = fetched.some(o => !prevIds.has(o.id));
                const serializedNext = JSON.stringify(fetched);
                const serializedCurr = JSON.stringify(this.orders);
                if (serializedNext !== serializedCurr) {
                    this.orders = fetched;
                    this.lastOrderIds = new Set(fetched.map(o => o.id));
                    this.render();
                    if (allowChime && hasNewOrder) {
                        this.playChime();
                    }
                }
            }
        } catch (err) {
            console.warn('[Admin] Sync warning:', err);
        }
    }

    setupRealtimeSync() {
        // Cross-tab storage synchronization
        window.addEventListener('storage', (e) => {
            if (!e.key || e.key === 'matcha_orders') {
                const prevCount = this.orders.length;
                this.orders = this.loadOrders();
                this.lastOrderIds = new Set(this.orders.map(o => o.id));
                this.render();
                if (this.orders.length > prevCount) {
                    this.playChime();
                }
            }
        });

        // Live Cloud / Backend polling every 3.5 seconds so all devices stay synced
        setInterval(() => {
            this.syncFromCloud(true);
        }, 3500);
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

    formatIDR(amount) {
        const val = Math.round(Number(amount) || 0);
        return 'Rp ' + val.toLocaleString('id-ID');
    }

    getOrderTotalIDR(order) {
        if (order.totalIDR && !isNaN(order.totalIDR) && Number(order.totalIDR) > 0) {
            return Number(order.totalIDR);
        }
        if (order.total && !isNaN(order.total)) {
            if (Number(order.total) > 1000) return Number(order.total);
            return Math.round(Number(order.total) * 5300);
        }
        if (Array.isArray(order.items)) {
            return order.items.reduce((sum, item) => sum + (this.getItemPriceIDR(item) * (item.qty || 1)), 0);
        }
        return 0;
    }

    getItemPriceIDR(item) {
        if (item.priceIDR && !isNaN(item.priceIDR)) return Number(item.priceIDR);
        if (item.price && !isNaN(item.price)) {
            if (Number(item.price) > 1000) return Number(item.price);
            return Math.round(Number(item.price) * 5300);
        }
        return 25000;
    }

    generateTestOrder() {
        const sampleRecipes = [
            { name: 'ICE MATCHA LATTE', spec: '2.5g Matcha • Fresh Milk • 70% Gula', priceIDR: 25000 },
            { name: 'ICE MATCHARICANO', spec: 'Americano Matcha • Normal Ice', priceIDR: 22000 },
            { name: 'ICE MATCHA CHOCOLATE', spec: 'Layer Cokelat Belgia • Oat Milk', priceIDR: 28000 },
            { name: 'ICE MATCHA VANILLA FOAM', spec: 'Cloud Foam • Less Sweet', priceIDR: 28000 },
            { name: 'ICE CHOCOLATE', spec: 'Pure Dark Cocoa • Fresh Milk', priceIDR: 24000 }
        ];

        const pick1 = sampleRecipes[Math.floor(Math.random() * sampleRecipes.length)];
        const pick2 = Math.random() > 0.4 ? sampleRecipes[Math.floor(Math.random() * sampleRecipes.length)] : null;

        const items = [{ ...pick1, qty: 1 }];
        if (pick2 && pick2.name !== pick1.name) items.push({ ...pick2, qty: 1 });

        const totalIDR = items.reduce((sum, i) => sum + (i.priceIDR * i.qty), 0);
        const sampleNames = ['Rian Pratama', 'Siti Rahma', 'Bagas Wijaya', 'Clara Anindya', 'Fajar Sidik'];
        const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];

        const newOrder = {
            id: 'MTC-' + Math.floor(1000 + Math.random() * 9000),
            customerName: randomName,
            timestamp: new Date().toISOString(),
            timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateFormatted: new Date().toLocaleDateString('id-ID'),
            status: 'brewing',
            paymentStatus: 'unpaid',
            table: 'Kiosk Order #' + Math.floor(1 + Math.random() * 12),
            items: items,
            totalIDR: totalIDR,
            total: totalIDR
        };

        this.orders.unshift(newOrder);
        this.lastOrderIds.add(newOrder.id);
        this.saveOrders();
        matchaDB.saveOrder(newOrder);
        this.render();
        this.playChime();
    }

    async toggleStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = order.status === 'brewing' ? 'completed' : 'brewing';
        this.saveOrders();
        this.render();
        await matchaDB.updateOrder(orderId, { status: order.status });
    }

    async togglePaymentStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        order.paymentStatus = order.paymentStatus === 'paid' ? 'unpaid' : 'paid';
        this.saveOrders();
        this.render();
        await matchaDB.updateOrder(orderId, { paymentStatus: order.paymentStatus });
    }

    async deleteOrder(orderId) {
        if (!confirm(`Hapus tiket pesanan #${orderId}?`)) return;

        this.orders = this.orders.filter(o => o.id !== orderId);
        this.saveOrders();
        this.render();
        await matchaDB.deleteOrder(orderId);
    }

    updateKPIs() {
        const totalRevenue = this.orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + this.getOrderTotalIDR(o), 0);

        const activeCount = this.orders.filter(o => o.status === 'brewing').length;
        const completedCount = this.orders.filter(o => o.status === 'completed').length;

        if (this.statRevenue) this.statRevenue.textContent = this.formatIDR(totalRevenue);
        if (this.statActive) this.statActive.textContent = activeCount;
        if (this.statCompleted) this.statCompleted.textContent = completedCount;
        if (this.statTotal) this.statTotal.textContent = this.orders.length;

        // Update Export bar count description
        if (this.exportCountLabel) {
            if (this.orders.length > 0) {
                this.exportCountLabel.textContent = `${this.orders.length} pesanan (${completedCount} selesai) siap diunduh`;
            } else {
                this.exportCountLabel.textContent = 'Belum ada data pesanan untuk diunduh';
            }
        }
    }

    render() {
        this.updateKPIs();
        if (!this.ordersGrid) return;

        // Apply filters
        let filtered = this.orders;

        if (this.currentFilter === 'unpaid') {
            filtered = filtered.filter(o => (o.paymentStatus || 'unpaid') !== 'paid');
        } else if (this.currentFilter === 'paid') {
            filtered = filtered.filter(o => o.paymentStatus === 'paid');
        } else if (this.currentFilter === 'brewing') {
            filtered = filtered.filter(o => o.status === 'brewing');
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(o => o.status === 'completed');
        }

        // Apply search query
        if (this.searchQuery) {
            filtered = filtered.filter(o => {
                const matchId = o.id.toLowerCase().includes(this.searchQuery);
                const matchName = (o.customerName || '').toLowerCase().includes(this.searchQuery);
                const matchTable = (o.table || '').toLowerCase().includes(this.searchQuery);
                const matchItem = o.items && o.items.some(i => i.name.toLowerCase().includes(this.searchQuery) || (i.spec && i.spec.toLowerCase().includes(this.searchQuery)));
                return matchId || matchName || matchTable || matchItem;
            });
        }

        if (!filtered.length) {
            this.ordersGrid.innerHTML = `
                <div class="orders-empty-state">
                    <h3>Tidak Ada Pesanan</h3>
                    <p>Pesanan baru yang dicheckout dari web customer akan otomatis muncul di sini.</p>
                </div>
            `;
            return;
        }

        this.ordersGrid.innerHTML = '';
        filtered.forEach(order => {
            const isBrewing = order.status === 'brewing';
            const isPaid = order.paymentStatus === 'paid';
            const card = document.createElement('article');
            card.className = `order-card status-${order.status}`;
            const totalAmountIDR = this.getOrderTotalIDR(order);
            const customerDisplay = order.customerName ? ` • ${order.customerName}` : '';

            const itemsHtml = (order.items || []).map(item => {
                const itemPrice = this.getItemPriceIDR(item);
                return `
                <div class="order-item-row">
                    <div class="order-item-main">
                        <span class="order-item-title">${item.qty}x ${item.name}</span>
                        <span class="order-item-spec">${item.spec || ''}</span>
                    </div>
                    <span class="order-item-price">${this.formatIDR(itemPrice * item.qty)}</span>
                </div>
            `;
            }).join('');

            card.innerHTML = `
                <div class="order-card-header">
                    <div class="order-id-wrap">
                        <span class="order-id">#${order.id}</span>
                        <span class="order-timestamp">${order.timeFormatted}${customerDisplay} • ${order.table || 'Kiosk'}</span>
                    </div>
                    <div class="order-header-right">
                        <span class="payment-badge ${isPaid ? 'paid' : 'unpaid'}">
                            ${isPaid ? 'Sudah Bayar' : 'Belum Bayar'}
                        </span>
                        <span class="status-badge ${order.status}">
                            ${isBrewing ? 'Brewing' : 'Completed'}
                        </span>
                        <button class="order-delete-single-btn" data-order-id="${order.id}" title="Hapus pesanan #${order.id}" aria-label="Hapus pesanan">
                            Hapus
                        </button>
                    </div>
                </div>

                <div class="order-items-list">
                    ${itemsHtml}
                </div>

                <div class="order-card-footer">
                    <div class="order-total-block">
                        <span class="order-total-label">Total Amount</span>
                        <span class="order-total-amount">${this.formatIDR(totalAmountIDR)}</span>
                    </div>
                    <div class="order-card-actions">
                        <button class="order-pay-btn ${isPaid ? 'mark-unpaid' : 'mark-paid'}" data-order-id="${order.id}">
                            ${isPaid ? 'Sudah Bayar ✓' : 'Tandai Sudah Bayar'}
                        </button>
                        <button class="order-action-btn ${isBrewing ? 'finish-btn' : 'reopen-btn'}" data-order-id="${order.id}">
                            ${isBrewing ? 'Selesai Seduh' : 'Buka Ulang'}
                        </button>
                    </div>
                </div>
            `;

            this.ordersGrid.appendChild(card);
        });

        // Bind payment status toggle buttons
        this.ordersGrid.querySelectorAll('.order-pay-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.orderId;
                this.togglePaymentStatus(id);
            });
        });

        // Bind status toggle buttons
        this.ordersGrid.querySelectorAll('.order-action-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.orderId;
                this.toggleStatus(id);
            });
        });

        // Bind individual order delete buttons
        this.ordersGrid.querySelectorAll('.order-delete-single-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.orderId;
                this.deleteOrder(id);
            });
        });
    }

    showAdminToast(message, type = 'warning') {
        let toast = document.querySelector('#admin-web-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'admin-web-toast';
            toast.style.cssText = 'position:fixed;top:1.25rem;left:50%;transform:translateX(-50%) translateY(-140%);z-index:999999;padding:0.85rem 1.35rem;border-radius:12px;font-family:Inter,sans-serif;font-size:0.86rem;font-weight:600;box-shadow:0 12px 32px rgba(0,0,0,0.45);transition:transform 0.3s ease,opacity 0.25s ease;opacity:0;max-width:90vw;text-align:center;';
            document.body.appendChild(toast);
        }
        toast.style.background = type === 'error' ? '#7f1d1d' : '#0b140b';
        toast.style.color = type === 'error' ? '#fecaca' : '#a3e635';
        toast.style.border = type === 'error' ? '1px solid rgba(252,165,165,0.4)' : '1px solid rgba(163,230,53,0.4)';
        toast.textContent = message;
        clearTimeout(this._toastTimer);
        requestAnimationFrame(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
            toast.style.opacity = '1';
        });
        this._toastTimer = setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(-140%)';
            toast.style.opacity = '0';
        }, 3200);
    }

    /**
     * Export all orders to Excel spreadsheet (.xlsx) using SheetJS
     */
    exportToExcel() {
        if (!this.orders.length) {
            this.showAdminToast('Tidak ada data pesanan untuk diexport!', 'warning');
            return;
        }

        if (typeof XLSX === 'undefined') {
            this.showAdminToast('Library Excel belum siap dimuat. Silakan refresh halaman.', 'error');
            return;
        }

        // Sheet 1: Orders Summary
        const summaryRows = this.orders.map(order => {
            const itemsSummary = (order.items || []).map(i => `${i.qty}x ${i.name} (${i.spec || ''})`).join('; ');
            const totalItemsQty = (order.items || []).reduce((sum, i) => sum + (i.qty || 1), 0);
            const totalIDR = this.getOrderTotalIDR(order);

            return {
                'Order ID': '#' + order.id,
                'Nama Pemesan': order.customerName || 'Pelanggan',
                'Tanggal': order.dateFormatted || new Date(order.timestamp).toLocaleDateString('id-ID'),
                'Waktu': order.timeFormatted || new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                'Pembayaran': order.paymentStatus === 'paid' ? 'Sudah Bayar' : 'Belum Bayar',
                'Status': order.status === 'completed' ? 'Selesai (Completed)' : 'Sedang Diseduh (Brewing)',
                'Sumber / Meja': order.table || 'Kiosk',
                'Rincian Menu & Racikan': itemsSummary,
                'Total Qty': totalItemsQty,
                'Total (IDR)': totalIDR
            };
        });

        // Sheet 2: Itemized Breakdown
        const itemizedRows = [];
        this.orders.forEach(order => {
            (order.items || []).forEach(item => {
                const itemPrice = this.getItemPriceIDR(item);
                itemizedRows.push({
                    'Order ID': '#' + order.id,
                    'Nama Pemesan': order.customerName || 'Pelanggan',
                    'Tanggal': order.dateFormatted || new Date(order.timestamp).toLocaleDateString('id-ID'),
                    'Waktu': order.timeFormatted || new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    'Status': order.status === 'completed' ? 'Selesai' : 'Sedang Diseduh',
                    'Nama Menu': item.name,
                    'Spesifikasi Racikan': item.spec || 'Standard',
                    'Jumlah (Qty)': item.qty,
                    'Harga Satuan (IDR)': itemPrice,
                    'Subtotal (IDR)': itemPrice * item.qty
                });
            });
        });

        const wb = XLSX.utils.book_new();

        // Add Sheet 1
        const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
        wsSummary['!cols'] = [
            { wch: 14 }, // Order ID
            { wch: 20 }, // Nama Pemesan
            { wch: 14 }, // Tanggal
            { wch: 10 }, // Waktu
            { wch: 24 }, // Status
            { wch: 18 }, // Meja
            { wch: 48 }, // Rincian
            { wch: 10 }, // Qty
            { wch: 16 }  // Total (IDR)
        ];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Pesanan');

        // Add Sheet 2
        const wsItems = XLSX.utils.json_to_sheet(itemizedRows);
        wsItems['!cols'] = [
            { wch: 14 },
            { wch: 20 },
            { wch: 14 },
            { wch: 10 },
            { wch: 16 },
            { wch: 28 },
            { wch: 35 },
            { wch: 14 },
            { wch: 18 },
            { wch: 18 }
        ];
        XLSX.utils.book_append_sheet(wb, wsItems, 'Detail Item');

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        XLSX.writeFile(wb, `Matcha_Tcih_Orders_${dateStr}.xlsx`);
    }

    /**
     * Export all orders to PDF document (.pdf) using jsPDF & autoTable
     */
    exportToPDF() {
        if (!this.orders.length) {
            this.showAdminToast('Tidak ada data pesanan untuk diexport!', 'warning');
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            this.showAdminToast('Library PDF belum siap dimuat. Silakan refresh halaman.', 'error');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        // Brand Header Banner (Matcha Dark Emerald)
        doc.setFillColor(6, 32, 16);
        doc.rect(0, 0, 210, 42, 'F');

        // Title & Logo
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('MATCHATCIH', 14, 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(251, 207, 232); // Sakura Pink accent
        doc.text('KITCHEN DISPLAY SYSTEM — OFFICIAL ORDER REPORT', 14, 26);

        const nowStr = new Date().toLocaleString();
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(8.5);
        doc.text(`Waktu Cetak: ${nowStr}`, 14, 34);

        // Summary Statistics Cards
        const totalRev = this.orders.reduce((sum, o) => sum + this.getOrderTotalIDR(o), 0);
        const completedCount = this.orders.filter(o => o.status === 'completed').length;
        const brewingCount = this.orders.filter(o => o.status === 'brewing').length;

        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('Ringkasan Kinerja Pesanan:', 14, 52);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`• Total Tiket: ${this.orders.length} Pesanan`, 14, 59);
        doc.text(`• Sedang Diseduh: ${brewingCount} Tiket`, 65, 59);
        doc.text(`• Selesai: ${completedCount} Tiket`, 115, 59);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 120, 50);
        doc.text(`• Total Pendapatan: ${this.formatIDR(totalRev)}`, 155, 59);

        // Table Data mapping
        const tableBody = this.orders.map(order => {
            const itemsText = (order.items || []).map(i => `${i.qty}x ${i.name}\n(${i.spec || 'Standard'})`).join('\n\n');
            const statusText = order.status === 'completed' ? 'Selesai' : 'Sedang Diseduh';
            const payText = order.paymentStatus === 'paid' ? 'Sudah Bayar' : 'Belum Bayar';
            const customerStr = order.customerName ? `\n[${order.customerName}]` : '';
            const dateText = `${order.dateFormatted || ''}\n${order.timeFormatted || ''}${customerStr}`;

            return [
                '#' + order.id,
                dateText,
                payText,
                statusText,
                itemsText,
                this.formatIDR(this.getOrderTotalIDR(order))
            ];
        });

        // AutoTable
        doc.autoTable({
            startY: 65,
            head: [['Order ID', 'Waktu & Nama', 'Pembayaran', 'Status', 'Rincian Menu & Racikan', 'Total']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: [21, 128, 61], // Emerald Matcha
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9
            },
            bodyStyles: {
                fontSize: 8.5,
                cellPadding: 4,
                textColor: [40, 40, 40]
            },
            columnStyles: {
                0: { cellWidth: 22, fontStyle: 'bold' },
                1: { cellWidth: 25 },
                2: { cellWidth: 22 },
                3: { cellWidth: 26 },
                4: { cellWidth: 'auto' },
                5: { cellWidth: 22, halign: 'right', fontStyle: 'bold', textColor: [16, 120, 50] }
            },
            alternateRowStyles: {
                fillColor: [245, 250, 246]
            },
            foot: [[
                'TOTAL PENDAPATAN',
                '',
                '',
                '',
                `${this.orders.length} Tiket Pesanan`,
                `$${totalRev.toFixed(2)}`
            ]],
            footStyles: {
                fillColor: [6, 32, 16],
                textColor: [251, 207, 232],
                fontStyle: 'bold',
                fontSize: 9.5
            },
            didDrawPage: (data) => {
                const str = 'Halaman ' + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(140);
                doc.text(str, 196, 290, { align: 'right' });
                doc.text('MatchaTcih KDS — Laporan Resmi Penjualan & Dapur', 14, 290);
            }
        });

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        doc.save(`Matcha_Tcih_Orders_${dateStr}.pdf`);
    }
}

// Auto-initialize when loaded in browser
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminOrderMonitor = new AdminOrderMonitor();
    });
}
