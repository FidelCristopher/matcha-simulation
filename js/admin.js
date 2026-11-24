/**
 * MatchaTcih • Admin Hub & Business Sales Analytics
 * Handles:
 * 1. Owner PIN Security Gate (Dedicated private access for business owner)
 * 2. Real-time Kitchen Order Monitoring (KDS) & Order Processing
 * 3. Business & Sales Analytics Recap (Omset, Menu Terlaris, Kustomisasi, AOV)
 * 4. Multi-Layer Database Management & Explorer (SQLite 3 & IndexedDB)
 * 5. Thermal Receipt & POS Struk Printing (Per-order & Daily Summary)
 * 6. Official Excel & PDF Export Reports in Indonesian Rupiah (IDR)
 */

import { matchaDB } from './db.js';

export class AdminOrderMonitor {
    constructor() {
        // PIN Security Gate
        this.pinModal = document.querySelector('#admin-pin-modal');
        this.pinDots = document.querySelectorAll('#pin-dots .pin-dot');
        this.pinFeedback = document.querySelector('#pin-feedback');
        this.logoutBtn = document.querySelector('#admin-logout-btn');
        this.enteredPin = '';
        this.validPins = ['8888', '1234', 'admin123', 'matcha888'];

        // View Navigation Switcher
        this.tabBtnOrders = document.querySelector('#tab-btn-orders');
        this.tabBtnRecap = document.querySelector('#tab-btn-recap');
        this.tabBtnDatabase = document.querySelector('#tab-btn-database');
        this.viewOrders = document.querySelector('#view-orders-section');
        this.viewRecap = document.querySelector('#view-recap-section');
        this.viewDatabase = document.querySelector('#view-database-section');
        this.currentView = 'orders'; // 'orders' | 'recap' | 'database'

        // Database Explorer Elements
        this.dbRefreshBtn = document.querySelector('#db-refresh-btn');
        this.dbExportSqlBtn = document.querySelector('#db-export-sql-btn');
        this.dbExportJsonBtn = document.querySelector('#db-export-json-btn');
        this.dbSearchInput = document.querySelector('#db-search-input');
        this.dbTableBody = document.querySelector('#db-table-body');
        this.dbRecordCount = document.querySelector('#db-record-count');
        this.dbConnectionStatus = document.querySelector('#db-connection-status');
        this.dbDriverTitle = document.querySelector('#db-driver-title');
        this.dbSearchQuery = '';

        // Order Monitor Elements
        this.ordersGrid = document.querySelector('#orders-grid');
        this.filterTabs = document.querySelectorAll('.filter-tab');
        this.searchInput = document.querySelector('#search-orders');
        this.liveClock = document.querySelector('#admin-clock');

        // Order Monitor KPI elements
        this.statRevenue = document.querySelector('#stat-revenue');
        this.statActive = document.querySelector('#stat-active');
        this.statCompleted = document.querySelector('#stat-completed');
        this.statTotal = document.querySelector('#stat-total');

        // Actions
        this.clearBtn = document.querySelector('#clear-orders-btn');
        this.sampleOrderBtn = document.querySelector('#sample-order-btn');

        // Recap Elements
        this.recapRangeTabs = document.querySelectorAll('.range-tab');
        this.currentRecapRange = 'today'; // 'today' | 'week' | 'all'
        this.recapTotalRevenue = document.querySelector('#recap-total-revenue');
        this.recapTotalDrinks = document.querySelector('#recap-total-drinks');
        this.recapAov = document.querySelector('#recap-aov');
        this.recapCompletionRate = document.querySelector('#recap-completion-rate');
        this.recapCompletionSub = document.querySelector('#recap-completion-sub');
        this.recapPeriodLabel = document.querySelector('#recap-period-label');
        this.recapMenuCount = document.querySelector('#recap-menu-count');
        this.recapBestsellerList = document.querySelector('#recap-bestseller-list');
        this.recapMilkBreakdown = document.querySelector('#recap-milk-breakdown');
        this.recapToppingsBreakdown = document.querySelector('#recap-toppings-breakdown');
        this.printSummaryBtn = document.querySelector('#print-daily-summary-btn');

        // Export elements
        this.excelBtn = document.querySelector('#export-excel-btn');
        this.pdfBtn = document.querySelector('#export-pdf-btn');
        this.exportCountLabel = document.querySelector('#export-orders-count');

        // Receipt Modal
        this.receiptModal = document.querySelector('#receipt-modal');
        this.receiptPaper = document.querySelector('#receipt-paper');
        this.receiptDoPrintBtn = document.querySelector('#receipt-do-print');
        this.receiptCloseBtn = document.querySelector('#receipt-close-btn');

        // State
        this.currentFilter = 'all'; // 'all' | 'brewing' | 'completed'
        this.searchQuery = '';
        this.orders = this.loadOrders();

        this.init();
    }

    init() {
        this.initPinGate();
        this.bindEvents();
        this.startClock();
        this.render();
        this.setupRealtimeSync();
        this.syncFromDatabase();
    }

    /**
     * 1. PIN Security Gate Logic
     */
    initPinGate() {
        // Check session authorization
        const isAuth = sessionStorage.getItem('matcha_admin_auth') === 'true';
        if (isAuth) {
            this.hidePinModal();
        } else {
            this.showPinModal();
        }

        // Keypad buttons click
        const keypadBtns = document.querySelectorAll('.keypad-btn');
        keypadBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const key = btn.dataset.key;
                if (key === 'clear') {
                    this.clearPin();
                } else if (key === 'enter') {
                    this.verifyPin();
                } else {
                    this.appendPin(key);
                }
            });
        });

        // Keyboard support
        window.addEventListener('keydown', (e) => {
            if (!this.pinModal || this.pinModal.classList.contains('hidden')) return;

            if (e.key >= '0' && e.key <= '9') {
                this.appendPin(e.key);
            } else if (e.key === 'Backspace') {
                this.backspacePin();
            } else if (e.key === 'Enter') {
                this.verifyPin();
            } else if (e.key === 'Escape') {
                this.clearPin();
            }
        });

        // Logout / Lock Button
        if (this.logoutBtn) {
            this.logoutBtn.addEventListener('click', () => {
                if (confirm('Kunci kembali portal admin?')) {
                    sessionStorage.removeItem('matcha_admin_auth');
                    this.clearPin();
                    this.showPinModal();
                }
            });
        }
    }

    showPinModal() {
        if (!this.pinModal) return;
        this.pinModal.classList.remove('hidden');
        this.clearPin();
    }

    hidePinModal() {
        if (!this.pinModal) return;
        this.pinModal.classList.add('hidden');
    }

    appendPin(digit) {
        if (this.enteredPin.length < 4) {
            this.enteredPin += digit;
            this.updatePinDots();
            if (this.enteredPin.length === 4) {
                setTimeout(() => this.verifyPin(), 120);
            }
        }
    }

    backspacePin() {
        this.enteredPin = this.enteredPin.slice(0, -1);
        this.updatePinDots();
    }

    clearPin() {
        this.enteredPin = '';
        this.updatePinDots();
        if (this.pinFeedback) this.pinFeedback.textContent = '';
    }

    updatePinDots() {
        this.pinDots.forEach((dot, idx) => {
            dot.classList.toggle('filled', idx < this.enteredPin.length);
        });
    }

    verifyPin() {
        if (this.validPins.includes(this.enteredPin)) {
            sessionStorage.setItem('matcha_admin_auth', 'true');
            if (this.pinFeedback) {
                this.pinFeedback.style.color = '#86efac';
                this.pinFeedback.textContent = '✓ PIN Benar. Membuka Dashboard...';
            }
            setTimeout(() => {
                this.hidePinModal();
                this.render();
            }, 300);
        } else {
            const pinCard = document.querySelector('.pin-card-box');
            if (pinCard) {
                pinCard.classList.add('pin-shake');
                setTimeout(() => pinCard.classList.remove('pin-shake'), 450);
            }
            if (this.pinFeedback) {
                this.pinFeedback.style.color = '#f87171';
                this.pinFeedback.textContent = 'PIN Salah! Silakan coba lagi.';
            }
            setTimeout(() => {
                this.clearPin();
            }, 600);
        }
    }

    /**
     * 2. Load & Save Orders Database
     */
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

        const isInitialized = localStorage.getItem('matcha_orders_init_v2');
        if (isInitialized) {
            return [];
        }

        localStorage.setItem('matcha_orders_init_v2', 'true');
        const now = Date.now();
        const seedOrders = [
            {
                id: 'MTC-7241',
                customerName: 'Aditya Pratama',
                timestamp: new Date(now - 12 * 60000).toISOString(),
                timeFormatted: new Date(now - 12 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dateFormatted: new Date().toLocaleDateString('id-ID'),
                status: 'brewing',
                table: 'Kiosk Meja #2',
                items: [
                    { name: 'ICE MATCHA LATTE', spec: 'Base Matcha, Fresh Milk, 70% Gula, Normal Ice', price: 4.70, priceIDR: 25000, qty: 2 },
                    { name: 'ICE MATCHA CHOCOLATE', spec: 'Base Matcha, Fresh Milk, Lapisan Cokelat Bawah', price: 5.20, priceIDR: 28000, qty: 1 }
                ],
                total: 14.60,
                totalIDR: 78000,
                totalFormattedIDR: 'Rp 78.000'
            },
            {
                id: 'MTC-6819',
                customerName: 'Siti Rahma',
                timestamp: new Date(now - 45 * 60000).toISOString(),
                timeFormatted: new Date(now - 45 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dateFormatted: new Date().toLocaleDateString('id-ID'),
                status: 'completed',
                table: 'Takeaway Kiosk #1',
                items: [
                    { name: 'ICE MATCHA VANILLA CLOUD FOAM', spec: 'Base Matcha, Fresh Milk, Vanilla Cloud Foam', price: 5.20, priceIDR: 28000, qty: 1 },
                    { name: 'ICE MATCHARICANO', spec: 'Base Matcha, Tanpa Susu, Normal Ice', price: 4.15, priceIDR: 22000, qty: 1 }
                ],
                total: 9.35,
                totalIDR: 50000,
                totalFormattedIDR: 'Rp 50.000'
            },
            {
                id: 'MTC-5432',
                customerName: 'Kevin Wijaya',
                timestamp: new Date(now - 90 * 60000).toISOString(),
                timeFormatted: new Date(now - 90 * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                dateFormatted: new Date().toLocaleDateString('id-ID'),
                status: 'completed',
                table: 'Kiosk Meja #4',
                items: [
                    { name: 'CUSTOM DRINK', spec: 'Base Matcha, Oat Milk (+2k), Lapisan Cokelat Bawah (+3k)', price: 5.60, priceIDR: 30000, qty: 1 }
                ],
                total: 5.60,
                totalIDR: 30000,
                totalFormattedIDR: 'Rp 30.000'
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

    /**
     * 3. Event Listeners & View Switcher
     */
    bindEvents() {
        // View Navigation Switcher
        if (this.tabBtnOrders) {
            this.tabBtnOrders.addEventListener('click', () => {
                this.switchView('orders');
            });
        }
        if (this.tabBtnRecap) {
            this.tabBtnRecap.addEventListener('click', () => {
                this.switchView('recap');
            });
        }
        if (this.tabBtnDatabase) {
            this.tabBtnDatabase.addEventListener('click', () => {
                this.switchView('database');
            });
        }

        // Database actions
        if (this.dbRefreshBtn) {
            this.dbRefreshBtn.addEventListener('click', () => {
                this.syncFromDatabase(true);
            });
        }
        if (this.dbExportSqlBtn) {
            this.dbExportSqlBtn.addEventListener('click', () => {
                this.exportDatabaseSqlDump();
            });
        }
        if (this.dbExportJsonBtn) {
            this.dbExportJsonBtn.addEventListener('click', () => {
                this.exportDatabaseJsonDump();
            });
        }
        if (this.dbSearchInput) {
            this.dbSearchInput.addEventListener('input', (e) => {
                this.dbSearchQuery = e.target.value.toLowerCase().trim();
                this.renderDatabaseView();
            });
        }

        // Filter tabs in Orders view
        this.filterTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.filterTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentFilter = tab.dataset.filter || 'all';
                this.render();
            });
        });

        // Recap Range Tabs (Today, Week, All)
        this.recapRangeTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.recapRangeTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentRecapRange = tab.dataset.range || 'today';
                this.renderRecap();
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

        // Reset all orders button
        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin menghapus seluruh riwayat pesanan? Data rekapan akan direset.')) {
                    this.orders = [];
                    this.saveOrders();
                    this.render();
                }
            });
        }

        // Print Daily Summary button
        if (this.printSummaryBtn) {
            this.printSummaryBtn.addEventListener('click', () => {
                this.openDailySummaryReceipt();
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

        // Receipt Modal actions
        if (this.receiptDoPrintBtn) {
            this.receiptDoPrintBtn.addEventListener('click', () => {
                window.print();
            });
        }
        if (this.receiptCloseBtn) {
            this.receiptCloseBtn.addEventListener('click', () => {
                this.closeReceiptModal();
            });
        }
        if (this.receiptModal) {
            this.receiptModal.addEventListener('click', (e) => {
                if (e.target === this.receiptModal) this.closeReceiptModal();
            });
        }
    }

    switchView(viewName) {
        this.currentView = viewName;
        if (this.tabBtnOrders) this.tabBtnOrders.classList.toggle('active', viewName === 'orders');
        if (this.tabBtnRecap) this.tabBtnRecap.classList.toggle('active', viewName === 'recap');
        if (this.tabBtnDatabase) this.tabBtnDatabase.classList.toggle('active', viewName === 'database');
        if (this.viewOrders) this.viewOrders.classList.toggle('active', viewName === 'orders');
        if (this.viewRecap) this.viewRecap.classList.toggle('active', viewName === 'recap');
        if (this.viewDatabase) this.viewDatabase.classList.toggle('active', viewName === 'database');

        if (viewName === 'recap') {
            this.renderRecap();
        } else if (viewName === 'database') {
            this.renderDatabaseView();
        } else {
            this.render();
        }
    }

    formatIDR(amount) {
        return `Rp ${(amount || 0).toLocaleString('id-ID')}`;
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
        window.addEventListener('storage', (e) => {
            if (!e.key || e.key === 'matcha_orders') {
                const prevCount = this.orders.length;
                this.orders = this.loadOrders();
                this.render();
                if (this.orders.length > prevCount) {
                    this.playChime();
                }
            }
        });

        // Polling fallback every 2.5s
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
        }, 2500);
    }

    playChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch {}
    }

    generateTestOrder() {
        const sampleRecipes = [
            { name: 'ICE MATCHA LATTE', spec: 'Base Matcha, Fresh Milk, 70% Gula, Normal Ice', priceIDR: 25000 },
            { name: 'ICE MATCHARICANO', spec: 'Base Matcha, Tanpa Susu, Normal Ice', priceIDR: 22000 },
            { name: 'ICE MATCHA CHOCOLATE', spec: 'Base Matcha, Fresh Milk, Lapisan Cokelat Bawah', priceIDR: 28000 },
            { name: 'ICE MATCHA VANILLA CLOUD FOAM', spec: 'Base Matcha, Fresh Milk, Vanilla Cloud Foam', priceIDR: 28000 },
            { name: 'CUSTOM DRINK', spec: 'Base Matcha, Oat Milk (+2k), Lapisan Cokelat Bawah (+3k)', priceIDR: 30000 }
        ];

        const testNames = ['Sarah Jenkins', 'Budi Santoso', 'Clarissa Dewanti', 'Dimas Anggara', 'Fadhil Rahman', 'Nadia Safitri'];
        const randomName = testNames[Math.floor(Math.random() * testNames.length)];

        const pick1 = sampleRecipes[Math.floor(Math.random() * sampleRecipes.length)];
        const pick2 = Math.random() > 0.45 ? sampleRecipes[Math.floor(Math.random() * sampleRecipes.length)] : null;

        const items = [{ ...pick1, price: parseFloat((pick1.priceIDR / 5300).toFixed(2)), qty: 1 }];
        if (pick2 && pick2.name !== pick1.name) {
            items.push({ ...pick2, price: parseFloat((pick2.priceIDR / 5300).toFixed(2)), qty: 1 });
        }

        const totalIDR = items.reduce((sum, i) => sum + (i.priceIDR * i.qty), 0);
        const totalUSD = parseFloat((totalIDR / 5300).toFixed(2));

        const newOrder = {
            id: 'MTC-' + Math.floor(1000 + Math.random() * 9000),
            customerName: randomName,
            timestamp: new Date().toISOString(),
            timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            dateFormatted: new Date().toLocaleDateString('id-ID'),
            status: 'brewing',
            table: 'Kiosk Order #' + Math.floor(1 + Math.random() * 15),
            items: items,
            totalQty: items.reduce((s, i) => s + (i.qty || 1), 0),
            total: totalUSD,
            totalIDR: totalIDR,
            totalFormattedIDR: this.formatIDR(totalIDR)
        };

        this.orders.unshift(newOrder);
        this.saveOrders();
        try { matchaDB.saveOrder(newOrder); } catch {}
        this.render();
        this.playChime();
    }

    async toggleStatus(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        order.status = order.status === 'brewing' ? 'completed' : 'brewing';
        this.saveOrders();
        try { await matchaDB.updateOrderStatus(orderId, order.status); } catch {}
        this.render();
    }

    async deleteOrder(orderId) {
        if (!confirm(`Hapus tiket pesanan #${orderId}?`)) return;

        this.orders = this.orders.filter(o => o.id !== orderId);
        this.saveOrders();
        try { await matchaDB.deleteOrder(orderId); } catch {}
        this.render();
    }

    getOrderTotalIDR(order) {
        if (order.totalIDR && !isNaN(order.totalIDR)) return order.totalIDR;
        if (order.items && Array.isArray(order.items)) {
            const sum = order.items.reduce((acc, item) => acc + ((item.priceIDR || (item.price * 5300)) * (item.qty || 1)), 0);
            if (sum > 0) return sum;
        }
        return Math.round((parseFloat(order.total) || 0) * 5300);
    }

    getItemPriceIDR(item) {
        if (item.priceIDR && !isNaN(item.priceIDR)) return item.priceIDR;
        return Math.round((parseFloat(item.price) || 0) * 5300);
    }

    /**
     * 4. Update KPI Statistics
     */
    updateKPIs() {
        const totalRevenueIDR = this.orders
            .filter(o => o.status !== 'cancelled')
            .reduce((sum, o) => sum + this.getOrderTotalIDR(o), 0);

        const activeCount = this.orders.filter(o => o.status === 'brewing').length;
        const completedCount = this.orders.filter(o => o.status === 'completed').length;

        if (this.statRevenue) this.statRevenue.textContent = this.formatIDR(totalRevenueIDR);
        if (this.statActive) this.statActive.textContent = activeCount;
        if (this.statCompleted) this.statCompleted.textContent = completedCount;
        if (this.statTotal) this.statTotal.textContent = this.orders.length;

        if (this.exportCountLabel) {
            if (this.orders.length > 0) {
                this.exportCountLabel.textContent = `${this.orders.length} pesanan (${completedCount} selesai) • Total: ${this.formatIDR(totalRevenueIDR)}`;
            } else {
                this.exportCountLabel.textContent = 'Belum ada data pesanan untuk diunduh';
            }
        }
    }

    /**
     * 5. Render Kitchen Display Orders Grid
     */
    render() {
        this.updateKPIs();
        if (this.currentView === 'recap') {
            this.renderRecap();
        }
        if (!this.ordersGrid) return;

        let filtered = this.orders;

        if (this.currentFilter === 'brewing') {
            filtered = filtered.filter(o => o.status === 'brewing');
        } else if (this.currentFilter === 'completed') {
            filtered = filtered.filter(o => o.status === 'completed');
        }

        if (this.searchQuery) {
            filtered = filtered.filter(o => {
                const matchId = o.id.toLowerCase().includes(this.searchQuery);
                const matchCustomer = (o.customerName || '').toLowerCase().includes(this.searchQuery);
                const matchTable = (o.table || '').toLowerCase().includes(this.searchQuery);
                const matchItem = o.items && o.items.some(i => i.name.toLowerCase().includes(this.searchQuery) || (i.spec && i.spec.toLowerCase().includes(this.searchQuery)));
                return matchId || matchCustomer || matchTable || matchItem;
            });
        }

        if (!filtered.length) {
            this.ordersGrid.innerHTML = `
                <div class="orders-empty-state">
                    <h3>Tidak Ada Pesanan</h3>
                    <p>Pesanan baru yang dicheckout dari customer kiosk akan otomatis muncul secara live di sini.</p>
                </div>
            `;
            return;
        }

        this.ordersGrid.innerHTML = '';
        filtered.forEach(order => {
            const isBrewing = order.status === 'brewing';
            const card = document.createElement('article');
            card.className = `order-card status-${order.status}`;

            const orderTotalIDR = this.getOrderTotalIDR(order);

            const itemsHtml = (order.items || []).map(item => {
                const itemPriceIDR = this.getItemPriceIDR(item);
                return `
                    <div class="order-item-row">
                        <div class="order-item-main">
                            <span class="order-item-title">${item.qty}x ${item.name}</span>
                            <span class="order-item-spec">${item.spec || 'Standard Recipe'}</span>
                        </div>
                        <span class="order-item-price">${this.formatIDR(itemPriceIDR * item.qty)}</span>
                    </div>
                `;
            }).join('');

            card.innerHTML = `
                <div class="order-card-header">
                    <div class="order-id-wrap">
                        <span class="order-id">#${order.id}</span>
                        <span class="order-customer-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <span>${order.customerName || 'Pelanggan'}</span>
                        </span>
                        <span class="order-timestamp">${order.timeFormatted} • ${order.table || 'Kiosk'}</span>
                    </div>
                    <div class="order-header-right">
                        <span class="status-badge ${order.status}">
                            ${isBrewing ? 'Sedang Diseduh' : 'Selesai'}
                        </span>
                        <button class="order-delete-single-btn" data-order-id="${order.id}" title="Hapus tiket #${order.id}" aria-label="Hapus pesanan">
                            &times;
                        </button>
                    </div>
                </div>

                <div class="order-items-list">
                    ${itemsHtml}
                </div>

                <div class="order-card-footer">
                    <div class="order-total-block">
                        <span class="order-total-label">Total Pembayaran</span>
                        <span class="order-total-amount">${this.formatIDR(orderTotalIDR)}</span>
                    </div>
                    <div class="order-footer-actions">
                        <button class="order-receipt-btn" data-order-id="${order.id}" title="Cetak Struk Transaksi">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                            <span>Struk</span>
                        </button>
                        <button class="order-action-btn ${isBrewing ? 'finish-btn' : 'reopen-btn'}" data-order-id="${order.id}">
                            ${isBrewing ? 'Selesai Seduh' : 'Buka Ulang'}
                        </button>
                    </div>
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

        // Bind delete buttons
        this.ordersGrid.querySelectorAll('.order-delete-single-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.orderId;
                this.deleteOrder(id);
            });
        });

        // Bind receipt buttons
        this.ordersGrid.querySelectorAll('.order-receipt-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.orderId;
                this.openOrderReceipt(id);
            });
        });
    }

    /**
     * 6. Render Business Sales Recap & Analytics
     */
    renderRecap() {
        const now = new Date();
        let filteredOrders = this.orders;

        if (this.currentRecapRange === 'today') {
            const todayStr = now.toDateString();
            filteredOrders = this.orders.filter(o => new Date(o.timestamp).toDateString() === todayStr);
            if (this.recapPeriodLabel) this.recapPeriodLabel.textContent = `Penjualan Hari Ini (${now.toLocaleDateString('id-ID')})`;
        } else if (this.currentRecapRange === 'week') {
            const weekAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
            filteredOrders = this.orders.filter(o => new Date(o.timestamp).getTime() >= weekAgo);
            if (this.recapPeriodLabel) this.recapPeriodLabel.textContent = 'Penjualan 7 Hari Terakhir';
        } else {
            if (this.recapPeriodLabel) this.recapPeriodLabel.textContent = 'Semua Riwayat Penjualan';
        }

        // 1. Financial Metrics
        const totalRevenue = filteredOrders.reduce((sum, o) => sum + this.getOrderTotalIDR(o), 0);
        const totalDrinks = filteredOrders.reduce((sum, o) => {
            const itemsCount = (o.items || []).reduce((iSum, i) => iSum + (i.qty || 1), 0);
            return sum + itemsCount;
        }, 0);
        const aov = filteredOrders.length > 0 ? Math.round(totalRevenue / filteredOrders.length) : 0;
        const completedCount = filteredOrders.filter(o => o.status === 'completed').length;
        const completionRate = filteredOrders.length > 0 ? Math.round((completedCount / filteredOrders.length) * 100) : 0;

        if (this.recapTotalRevenue) this.recapTotalRevenue.textContent = this.formatIDR(totalRevenue);
        if (this.recapTotalDrinks) this.recapTotalDrinks.textContent = `${totalDrinks} Gelas`;
        if (this.recapAov) this.recapAov.textContent = this.formatIDR(aov);
        if (this.recapCompletionRate) this.recapCompletionRate.textContent = `${completionRate}%`;
        if (this.recapCompletionSub) this.recapCompletionSub.textContent = `${completedCount} dari ${filteredOrders.length} pesanan selesai`;

        // 2. Best Seller Menu Breakdown
        const menuStats = {};
        filteredOrders.forEach(order => {
            (order.items || []).forEach(item => {
                const name = item.name.toUpperCase();
                if (!menuStats[name]) {
                    menuStats[name] = { qty: 0, revenue: 0 };
                }
                const itemQty = item.qty || 1;
                const itemPrice = this.getItemPriceIDR(item);
                menuStats[name].qty += itemQty;
                menuStats[name].revenue += itemPrice * itemQty;
            });
        });

        const sortedMenu = Object.entries(menuStats).sort((a, b) => b[1].qty - a[1].qty);
        const maxQty = sortedMenu.length > 0 ? sortedMenu[0][1].qty : 1;

        if (this.recapMenuCount) {
            this.recapMenuCount.textContent = `${sortedMenu.length} Varian Menu`;
        }

        if (this.recapBestsellerList) {
            if (!sortedMenu.length) {
                this.recapBestsellerList.innerHTML = `<p style="color: rgba(255,255,255,0.6); font-size: 0.85rem;">Belum ada data transaksi pada periode ini.</p>`;
            } else {
                this.recapBestsellerList.innerHTML = sortedMenu.map(([name, stat], idx) => {
                    const percent = Math.min(100, Math.round((stat.qty / maxQty) * 100));
                    return `
                        <div class="bestseller-item">
                            <div class="bestseller-meta-row">
                                <span class="bestseller-rank-name">
                                    <span class="bestseller-rank-badge ${idx === 0 ? 'top-1' : ''}">${idx + 1}</span>
                                    <span>${name}</span>
                                </span>
                                <span class="bestseller-stats-text">
                                    <strong>${stat.qty} Gelas</strong> • ${this.formatIDR(stat.revenue)}
                                </span>
                            </div>
                            <div class="bestseller-bar-track">
                                <div class="bestseller-bar-fill" style="width: ${percent}%;"></div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        }

        // 3. Milk Base Customization Analysis
        const milkCounts = { 'Fresh Milk': 0, 'Oat Milk': 0, 'Tanpa Susu': 0 };
        filteredOrders.forEach(o => {
            (o.items || []).forEach(item => {
                const spec = (item.spec || '').toLowerCase();
                const qty = item.qty || 1;
                if (spec.includes('oat')) milkCounts['Oat Milk'] += qty;
                else if (spec.includes('tanpa susu') || spec.includes('no milk')) milkCounts['Tanpa Susu'] += qty;
                else milkCounts['Fresh Milk'] += qty;
            });
        });

        const totalMilkPicks = Object.values(milkCounts).reduce((a, b) => a + b, 0) || 1;
        if (this.recapMilkBreakdown) {
            this.recapMilkBreakdown.innerHTML = Object.entries(milkCounts).map(([type, count]) => {
                const pct = Math.round((count / totalMilkPicks) * 100);
                return `
                    <div class="analytic-item-row">
                        <div class="analytic-item-meta">
                            <span>${type}</span>
                            <span>${count}x (${pct}%)</span>
                        </div>
                        <div class="bestseller-bar-track">
                            <div class="bestseller-bar-fill" style="width: ${pct}%; background: #86efac;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // 4. Toppings Customization Analysis
        const toppingCounts = { 'Vanilla Cloud Foam': 0, 'Lapisan Cokelat Bawah': 0 };
        filteredOrders.forEach(o => {
            (o.items || []).forEach(item => {
                const spec = (item.spec || '').toLowerCase();
                const qty = item.qty || 1;
                if (spec.includes('foam') || spec.includes('vanilla')) toppingCounts['Vanilla Cloud Foam'] += qty;
                if (spec.includes('cokelat') || spec.includes('chocolate')) toppingCounts['Lapisan Cokelat Bawah'] += qty;
            });
        });

        const totalTopPicks = Object.values(toppingCounts).reduce((a, b) => a + b, 0) || 1;
        if (this.recapToppingsBreakdown) {
            this.recapToppingsBreakdown.innerHTML = Object.entries(toppingCounts).map(([type, count]) => {
                const pct = Math.round((count / totalTopPicks) * 100);
                return `
                    <div class="analytic-item-row">
                        <div class="analytic-item-meta">
                            <span>${type}</span>
                            <span>${count}x (${pct}%)</span>
                        </div>
                        <div class="bestseller-bar-track">
                            <div class="bestseller-bar-fill" style="width: ${pct}%; background: #fbcfe8;"></div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    /**
     * 7. Thermal Receipt Modal & Printing
     */
    openOrderReceipt(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order || !this.receiptPaper) return;

        const totalIDR = this.getOrderTotalIDR(order);
        const itemsHtml = (order.items || []).map(item => {
            const priceIDR = this.getItemPriceIDR(item);
            return `
                <div class="receipt-item-block">
                    <div class="receipt-row bold">
                        <span>${item.qty}x ${item.name}</span>
                        <span>${this.formatIDR(priceIDR * item.qty)}</span>
                    </div>
                    <div class="receipt-item-spec">${item.spec || 'Standard Recipe'}</div>
                </div>
            `;
        }).join('');

        this.receiptPaper.innerHTML = `
            <div class="receipt-header-text">
                <div class="receipt-brand-title">MATCHATCIH.</div>
                <div>Curated Specimen Palette • Uji 2026</div>
                <div>STRUK BUKTI TRANSAKSI KASIR</div>
            </div>

            <div class="receipt-row">
                <span>No. Tiket:</span>
                <span class="bold">#${order.id}</span>
            </div>
            <div class="receipt-row">
                <span>Pelanggan:</span>
                <span class="bold">${order.customerName || 'Pelanggan'}</span>
            </div>
            <div class="receipt-row">
                <span>Waktu / Tgl:</span>
                <span>${order.dateFormatted || ''} ${order.timeFormatted || ''}</span>
            </div>
            <div class="receipt-row">
                <span>Meja / Order:</span>
                <span>${order.table || 'Kiosk'}</span>
            </div>
            <div class="receipt-row">
                <span>Status:</span>
                <span class="bold">${order.status === 'completed' ? 'SELESAI' : 'DISEDUR'}</span>
            </div>

            <hr class="receipt-divider">

            ${itemsHtml}

            <hr class="receipt-divider">

            <div class="receipt-row bold" style="font-size: 1rem;">
                <span>TOTAL AKHIR:</span>
                <span>${this.formatIDR(totalIDR)}</span>
            </div>
            <div class="receipt-row" style="font-size: 0.74rem; color: #555;">
                <span>Metode Bayar:</span>
                <span>QRIS / Kiosk Checkout</span>
            </div>

            <div class="receipt-footer-text">
                <div>Terima kasih atas pesanan Anda!</div>
                <div>Instagram: @matchatcih • Nikmati Kesegarannya</div>
            </div>
        `;

        if (this.receiptModal) this.receiptModal.classList.add('open');
    }

    openDailySummaryReceipt() {
        if (!this.receiptPaper) return;
        const now = new Date();
        const totalRevenue = this.orders.reduce((sum, o) => sum + this.getOrderTotalIDR(o), 0);
        const totalDrinks = this.orders.reduce((sum, o) => {
            return sum + (o.items || []).reduce((iSum, i) => iSum + (i.qty || 1), 0);
        }, 0);
        const completed = this.orders.filter(o => o.status === 'completed').length;
        const brewing = this.orders.filter(o => o.status === 'brewing').length;

        this.receiptPaper.innerHTML = `
            <div class="receipt-header-text">
                <div class="receipt-brand-title">MATCHATCIH.</div>
                <div>REKAPAN PENJUALAN HARIAN (Z-REPORT)</div>
                <div>${now.toLocaleDateString('id-ID')} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>

            <div class="receipt-row">
                <span>Total Tiket:</span>
                <span class="bold">${this.orders.length} Transaksi</span>
            </div>
            <div class="receipt-row">
                <span>Pesanan Selesai:</span>
                <span>${completed} Tiket</span>
            </div>
            <div class="receipt-row">
                <span>Sedang Diseduh:</span>
                <span>${brewing} Tiket</span>
            </div>
            <div class="receipt-row">
                <span>Total Minuman:</span>
                <span class="bold">${totalDrinks} Gelas</span>
            </div>

            <hr class="receipt-divider">

            <div class="receipt-row bold" style="font-size: 1.05rem; color: #166534;">
                <span>TOTAL OMSET:</span>
                <span>${this.formatIDR(totalRevenue)}</span>
            </div>

            <hr class="receipt-divider">

            <div class="receipt-footer-text">
                <div>Dokumen Sah Pembukuan Kasir Internal</div>
                <div>MatchaTcih KDS System v2.0</div>
            </div>
        `;

        if (this.receiptModal) this.receiptModal.classList.add('open');
    }

    closeReceiptModal() {
        if (this.receiptModal) this.receiptModal.classList.remove('open');
    }

    /**
     * 8. Export Excel (.xlsx) with Rupiah values
     */
    exportToExcel() {
        if (!this.orders.length) {
            alert('Tidak ada data pesanan untuk diexport!');
            return;
        }

        if (typeof XLSX === 'undefined') {
            alert('Library Excel belum siap dimuat. Silakan refresh halaman.');
            return;
        }

        const summaryRows = this.orders.map(order => {
            const itemsSummary = (order.items || []).map(i => `${i.qty}x ${i.name} (${i.spec || ''})`).join('; ');
            const totalItemsQty = (order.items || []).reduce((sum, i) => sum + (i.qty || 1), 0);
            const totalIDR = this.getOrderTotalIDR(order);

            return {
                'Order ID': '#' + order.id,
                'Nama Pemesan': order.customerName || 'Pelanggan',
                'Tanggal': order.dateFormatted || new Date(order.timestamp).toLocaleDateString('id-ID'),
                'Waktu': order.timeFormatted || new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                'Status': order.status === 'completed' ? 'Selesai (Completed)' : 'Sedang Diseduh (Brewing)',
                'Sumber / Meja': order.table || 'Kiosk',
                'Rincian Menu & Racikan': itemsSummary,
                'Total Qty': totalItemsQty,
                'Total (Rp)': totalIDR
            };
        });

        const itemizedRows = [];
        this.orders.forEach(order => {
            (order.items || []).forEach(item => {
                const itemPriceIDR = this.getItemPriceIDR(item);
                itemizedRows.push({
                    'Order ID': '#' + order.id,
                    'Nama Pemesan': order.customerName || 'Pelanggan',
                    'Tanggal': order.dateFormatted || new Date(order.timestamp).toLocaleDateString('id-ID'),
                    'Waktu': order.timeFormatted || new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    'Status': order.status === 'completed' ? 'Selesai' : 'Sedang Diseduh',
                    'Nama Menu': item.name,
                    'Spesifikasi Racikan': item.spec || 'Standard',
                    'Jumlah (Qty)': item.qty,
                    'Harga Satuan (Rp)': itemPriceIDR,
                    'Subtotal (Rp)': itemPriceIDR * item.qty
                });
            });
        });

        const wb = XLSX.utils.book_new();

        const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
        wsSummary['!cols'] = [
            { wch: 14 },
            { wch: 14 },
            { wch: 10 },
            { wch: 24 },
            { wch: 18 },
            { wch: 52 },
            { wch: 10 },
            { wch: 16 }
        ];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Pesanan');

        const wsItems = XLSX.utils.json_to_sheet(itemizedRows);
        wsItems['!cols'] = [
            { wch: 14 },
            { wch: 14 },
            { wch: 10 },
            { wch: 16 },
            { wch: 30 },
            { wch: 38 },
            { wch: 14 },
            { wch: 18 },
            { wch: 18 }
        ];
        XLSX.utils.book_append_sheet(wb, wsItems, 'Detail Item');

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        XLSX.writeFile(wb, `MatchaTcih_Rekapan_Penjualan_${dateStr}.xlsx`);
    }

    /**
     * 9. Export PDF (.pdf) with Rupiah values
     */
    exportToPDF() {
        if (!this.orders.length) {
            alert('Tidak ada data pesanan untuk diexport!');
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('Library PDF belum siap dimuat. Silakan refresh halaman.');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('p', 'mm', 'a4');

        doc.setFillColor(6, 32, 16);
        doc.rect(0, 0, 210, 42, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('MATCHATCIH.', 14, 18);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(251, 207, 232);
        doc.text('LAPORAN RESMI REKAPAN PENJUALAN & DAPUR', 14, 26);

        const nowStr = new Date().toLocaleString('id-ID');
        doc.setTextColor(200, 200, 200);
        doc.setFontSize(8.5);
        doc.text(`Dicetak pada: ${nowStr}`, 14, 34);

        const totalRevIDR = this.orders.reduce((sum, o) => sum + this.getOrderTotalIDR(o), 0);
        const completedCount = this.orders.filter(o => o.status === 'completed').length;
        const brewingCount = this.orders.filter(o => o.status === 'brewing').length;

        doc.setTextColor(30, 30, 30);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10.5);
        doc.text('Ringkasan Kinerja Penjualan:', 14, 52);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`• Total Tiket: ${this.orders.length} Transaksi`, 14, 59);
        doc.text(`• Sedang Diseduh: ${brewingCount} Tiket`, 65, 59);
        doc.text(`• Selesai: ${completedCount} Tiket`, 115, 59);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 120, 50);
        doc.text(`• Total Omset: ${this.formatIDR(totalRevIDR)}`, 150, 59);

        const tableBody = this.orders.map(order => {
            const itemsText = (order.items || []).map(i => `${i.qty}x ${i.name}\n(${i.spec || 'Standard'})`).join('\n\n');
            const statusText = order.status === 'completed' ? 'Selesai' : 'Sedang Diseduh';
            const dateText = `${order.dateFormatted || ''}\n${order.timeFormatted || ''}`;
            const totalIDR = this.getOrderTotalIDR(order);

            return [
                '#' + order.id,
                order.customerName || 'Pelanggan',
                dateText,
                order.table || 'Kiosk',
                statusText,
                itemsText,
                this.formatIDR(totalIDR)
            ];
        });

        doc.autoTable({
            startY: 65,
            head: [['Order ID', 'Pelanggan', 'Waktu', 'Lokasi', 'Status', 'Rincian Menu & Racikan', 'Total']],
            body: tableBody,
            theme: 'striped',
            headStyles: {
                fillColor: [21, 128, 61],
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
                0: { cellWidth: 20, fontStyle: 'bold' },
                1: { cellWidth: 24, fontStyle: 'bold' },
                2: { cellWidth: 22 },
                3: { cellWidth: 20 },
                4: { cellWidth: 22 },
                5: { cellWidth: 'auto' },
                6: { cellWidth: 26, halign: 'right', fontStyle: 'bold', textColor: [16, 120, 50] }
            },
            alternateRowStyles: {
                fillColor: [245, 250, 246]
            },
            foot: [[
                'TOTAL PENDAPATAN',
                '',
                '',
                '',
                '',
                `${this.orders.length} Tiket Pesanan`,
                this.formatIDR(totalRevIDR)
            ]],
            footStyles: {
                fillColor: [6, 32, 16],
                textColor: [251, 207, 232],
                fontStyle: 'bold',
                fontSize: 9.5
            },
            didDrawPage: () => {
                const str = 'Halaman ' + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(140);
                doc.text(str, 196, 290, { align: 'right' });
                doc.text('MatchaTcih KDS — Laporan Resmi Pembukuan Penjualan Bisnis', 14, 290);
            }
        });

        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        doc.save(`MatchaTcih_Laporan_Penjualan_${dateStr}.pdf`);
    }

    /**
     * 10. Database Explorer & Sync Methods
     */
    async syncFromDatabase(showNotification = false) {
        try {
            const dbOrders = await matchaDB.getAllOrders();
            if (Array.isArray(dbOrders) && dbOrders.length > 0) {
                this.orders = dbOrders;
                this.saveOrders();
                this.render();
            }
            if (this.currentView === 'database') {
                await this.renderDatabaseView();
            }
            if (showNotification) {
                alert(`✅ Sinkronisasi Berhasil!\nDatabase terhubung dan memuat ${this.orders.length} catatan transaksi.`);
            }
        } catch (e) {
            console.warn('[Admin] Sync error:', e);
            if (showNotification) {
                alert('Sinkronisasi database selesai (menggunakan cache aktif).');
            }
        }
    }

    async renderDatabaseView() {
        if (!this.dbTableBody) return;

        // 1. Get database diagnostic info
        const info = await matchaDB.getDatabaseInfo();
        if (this.dbConnectionStatus) {
            this.dbConnectionStatus.textContent = info.isServerAvailable ? 'SQLite 3 Connected' : 'IndexedDB Active';
        }
        if (this.dbDriverTitle) {
            this.dbDriverTitle.textContent = info.storageType;
        }

        // 2. Query filter
        let records = (info.orders && info.orders.length > 0) ? info.orders : this.orders;
        if (this.dbSearchQuery) {
            const q = this.dbSearchQuery;
            records = records.filter(o => {
                const matchName = (o.customerName || '').toLowerCase().includes(q);
                const matchId = (o.id || '').toLowerCase().includes(q);
                const matchItem = (o.items || []).some(i => i.name.toLowerCase().includes(q) || (i.spec || '').toLowerCase().includes(q));
                return matchName || matchId || matchItem;
            });
        }

        if (this.dbRecordCount) {
            this.dbRecordCount.textContent = `Menampilkan ${records.length} dari total ${(info.orders || this.orders).length} baris data di database`;
        }

        if (!records.length) {
            this.dbTableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: 3rem 1rem; color: #94A3B8;">
                        Tidak ada catatan transaksi database yang cocok.
                    </td>
                </tr>
            `;
            return;
        }

        this.dbTableBody.innerHTML = records.map(order => {
            const itemsText = (order.items || []).map(i => {
                const specText = i.spec ? ` <span style="color:#94A3B8; font-size:0.75rem;">(${i.spec})</span>` : '';
                return `• <strong>${i.qty}x ${i.name}</strong>${specText}`;
            }).join('<br>');

            const totalQty = order.totalQty || (order.items || []).reduce((s, i) => s + (i.qty || 1), 0);
            const totalIDR = this.getOrderTotalIDR(order);
            const isCompleted = order.status === 'completed';

            return `
                <tr>
                    <td><span class="db-cell-id">#${order.id}</span></td>
                    <td>
                        <div class="db-cell-customer">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            <strong>${order.customerName || 'Pelanggan'}</strong>
                        </div>
                    </td>
                    <td>
                        <div class="db-cell-items">${itemsText}</div>
                    </td>
                    <td style="text-align: center; font-weight: 700; color: #F8FAFC;">
                        ${totalQty} cup
                    </td>
                    <td>
                        <div class="db-cell-price">${this.formatIDR(totalIDR)}</div>
                    </td>
                    <td style="font-size: 0.78rem; color: #94A3B8; white-space: nowrap;">
                        ${order.dateFormatted || ''} • ${order.timeFormatted || ''}
                    </td>
                    <td style="text-align: center;">
                        <span class="status-badge ${order.status}">
                            ${isCompleted ? 'Selesai' : 'Diseduh'}
                        </span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    exportDatabaseSqlDump() {
        let sql = `-- MatchaTcih SQLite Database Export\n-- Generated: ${new Date().toISOString()}\n\n`;
        sql += `CREATE TABLE IF NOT EXISTS orders (\n  id TEXT PRIMARY KEY,\n  customer_name TEXT NOT NULL,\n  menu_items TEXT NOT NULL,\n  total_qty INTEGER NOT NULL,\n  total_price INTEGER NOT NULL,\n  status TEXT DEFAULT 'brewing',\n  table_number TEXT,\n  created_at TEXT NOT NULL,\n  date_formatted TEXT,\n  time_formatted TEXT\n);\n\n`;

        this.orders.forEach(o => {
            const itemsEsc = JSON.stringify(o.items || []).replace(/'/g, "''");
            const nameEsc = (o.customerName || 'Pelanggan').replace(/'/g, "''");
            const totalQty = o.totalQty || (o.items || []).reduce((s, i) => s + (i.qty || 1), 0);
            sql += `INSERT INTO orders VALUES ('${o.id}', '${nameEsc}', '${itemsEsc}', ${totalQty}, ${this.getOrderTotalIDR(o)}, '${o.status || 'brewing'}', '${o.table || 'Kiosk'}', '${o.timestamp}', '${o.dateFormatted}', '${o.timeFormatted}');\n`;
        });

        const blob = new Blob([sql], { type: 'application/sql' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `matcha_database_dump_${Date.now()}.sql`;
        a.click();
        URL.revokeObjectURL(url);
    }

    exportDatabaseJsonDump() {
        const jsonStr = JSON.stringify(this.orders, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `matcha_orders_database_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Auto-initialize when loaded in browser
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        window.adminOrderMonitor = new AdminOrderMonitor();
    });
}
