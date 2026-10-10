/**
 * Admin & Kitchen Order Monitor Engine (MatchaTcih KDS)
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

        // Export elements
        this.excelBtn = document.querySelector('#export-excel-btn');
        this.pdfBtn = document.querySelector('#export-pdf-btn');
        this.exportCountLabel = document.querySelector('#export-orders-count');

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

    setupRealtimeSync() {
        // Cross-tab storage synchronization
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

    deleteOrder(orderId) {
        if (!confirm(`Hapus tiket pesanan #${orderId}?`)) return;

        this.orders = this.orders.filter(o => o.id !== orderId);
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
                    <div class="order-header-right">
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
                        <span class="order-total-amount">$${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                    <button class="order-action-btn ${isBrewing ? 'finish-btn' : 'reopen-btn'}" data-order-id="${order.id}">
                        ${isBrewing ? 'Selesai Seduh' : 'Buka Ulang'}
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

        // Bind individual order delete buttons
        this.ordersGrid.querySelectorAll('.order-delete-single-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.orderId;
                this.deleteOrder(id);
            });
        });
    }

    /**
     * Export all orders to Excel spreadsheet (.xlsx) using SheetJS
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

        // Sheet 1: Orders Summary
        const summaryRows = this.orders.map(order => {
            const itemsSummary = (order.items || []).map(i => `${i.qty}x ${i.name} (${i.spec || ''})`).join('; ');
            const totalItemsQty = (order.items || []).reduce((sum, i) => sum + (i.qty || 1), 0);

            return {
                'Order ID': '#' + order.id,
                'Tanggal': order.dateFormatted || new Date(order.timestamp).toLocaleDateString(),
                'Waktu': order.timeFormatted || new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                'Status': order.status === 'completed' ? 'Selesai (Completed)' : 'Sedang Diseduh (Brewing)',
                'Sumber / Meja': order.table || 'Kiosk',
                'Rincian Menu & Racikan': itemsSummary,
                'Total Qty': totalItemsQty,
                'Total (USD)': parseFloat(order.total)
            };
        });

        // Sheet 2: Itemized Breakdown
        const itemizedRows = [];
        this.orders.forEach(order => {
            (order.items || []).forEach(item => {
                itemizedRows.push({
                    'Order ID': '#' + order.id,
                    'Tanggal': order.dateFormatted || new Date(order.timestamp).toLocaleDateString(),
                    'Waktu': order.timeFormatted || new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    'Status': order.status === 'completed' ? 'Selesai' : 'Sedang Diseduh',
                    'Nama Menu': item.name,
                    'Spesifikasi Racikan': item.spec || 'Standard',
                    'Jumlah (Qty)': item.qty,
                    'Harga Satuan (USD)': parseFloat(item.price),
                    'Subtotal (USD)': parseFloat((item.price * item.qty).toFixed(2))
                });
            });
        });

        const wb = XLSX.utils.book_new();

        // Add Sheet 1
        const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
        wsSummary['!cols'] = [
            { wch: 14 }, // Order ID
            { wch: 14 }, // Tanggal
            { wch: 10 }, // Waktu
            { wch: 24 }, // Status
            { wch: 18 }, // Meja
            { wch: 48 }, // Rincian
            { wch: 10 }, // Qty
            { wch: 14 }  // Total
        ];
        XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan Pesanan');

        // Add Sheet 2
        const wsItems = XLSX.utils.json_to_sheet(itemizedRows);
        wsItems['!cols'] = [
            { wch: 14 },
            { wch: 14 },
            { wch: 10 },
            { wch: 16 },
            { wch: 28 },
            { wch: 35 },
            { wch: 14 },
            { wch: 18 },
            { wch: 16 }
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
            alert('Tidak ada data pesanan untuk diexport!');
            return;
        }

        if (!window.jspdf || !window.jspdf.jsPDF) {
            alert('Library PDF belum siap dimuat. Silakan refresh halaman.');
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
        const totalRev = this.orders.reduce((sum, o) => sum + (parseFloat(o.total) || 0), 0);
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
        doc.text(`• Total Pendapatan: $${totalRev.toFixed(2)}`, 155, 59);

        // Table Data mapping
        const tableBody = this.orders.map(order => {
            const itemsText = (order.items || []).map(i => `${i.qty}x ${i.name}\n(${i.spec || 'Standard'})`).join('\n\n');
            const statusText = order.status === 'completed' ? 'Selesai' : 'Sedang Diseduh';
            const dateText = `${order.dateFormatted || ''}\n${order.timeFormatted || ''}`;

            return [
                '#' + order.id,
                dateText,
                order.table || 'Kiosk',
                statusText,
                itemsText,
                `$${parseFloat(order.total).toFixed(2)}`
            ];
        });

        // AutoTable
        doc.autoTable({
            startY: 65,
            head: [['Order ID', 'Waktu', 'Lokasi', 'Status', 'Rincian Menu & Racikan', 'Total']],
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
