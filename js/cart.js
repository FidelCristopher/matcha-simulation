/**
 * Shopping Cart Manager & Modal Pop-Up
 * Handles item additions, quantity updates, total calculation, and modal toggling.
 */
import { matchaDB } from './db.js';

export class CartManager {
    constructor() {
        this.cartBtn = document.querySelector('#cart-toggle-btn');
        this.cartModal = document.querySelector('#cart-modal-backdrop');
        this.closeBtn = document.querySelector('#cart-close-btn');
        this.itemsContainer = document.querySelector('#cart-items-container');
        this.totalPriceElem = document.querySelector('#cart-total-price');
        this.countBadge = document.querySelector('#cart-count');
        this.checkoutBtn = document.querySelector('#cart-checkout-btn');

        // Load items from localStorage
        this.items = this.loadCart();

        this.init();
    }

    init() {
        this.bindEvents();
        this.render();

        // Listen for language switch to re-render empty state and text
        document.addEventListener('matcha:lang-changed', () => {
            this.render();
        });

        // Listen for cross-page / cross-tab storage changes (e.g. from Customizer page)
        window.addEventListener('storage', (e) => {
            if (!e.key || e.key === 'matcha_cart') {
                this.items = this.loadCart();
                this.render();
            }
        });
        document.addEventListener('matcha:kiosk-start', () => {
            this.items = this.loadCart();
            this.render();
        });
    }

    loadCart() {
        try {
            const saved = localStorage.getItem('matcha_cart');
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    saveCart() {
        try {
            localStorage.setItem('matcha_cart', JSON.stringify(this.items));
        } catch (e) {
            console.warn('Storage save failed:', e);
        }
    }

    bindEvents() {
        // Toggle Cart Modal from any cart button (Header button, Floating bottom-right FAB, etc.)
        const openTriggers = [
            this.cartBtn,
            document.querySelector('#cart-floating-btn'),
            document.querySelector('#pantone-cart-btn'),
            ...document.querySelectorAll('.cart-btn, .cart-floating-fab, .pantone-cart-trigger')
        ].filter(Boolean);

        openTriggers.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.open();
            });
        });

        // Close Cart Modal
        if (this.closeBtn) {
            this.closeBtn.addEventListener('click', () => this.close());
        }

        // Close on backdrop click
        if (this.cartModal) {
            this.cartModal.addEventListener('click', (e) => {
                if (e.target === this.cartModal) {
                    this.close();
                }
            });
        }

        // Close on Escape key
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        // Add menu cards to cart on click
        document.querySelectorAll('.menu-card').forEach(card => {
            card.style.cursor = 'pointer';
            card.setAttribute('title', 'Click to add to Cart');
            card.addEventListener('click', () => {
                const title = card.querySelector('.menu-card-title')?.textContent.trim() || 'Matcha Drink';
                const tag = card.querySelector('.menu-card-tag')?.textContent.trim() || 'Curated';
                const priceStr = card.querySelector('.menu-card-price')?.textContent || '$4.80';
                const price = parseFloat(priceStr.replace(/[^0-9.]/g, '')) || 4.80;

                this.addItem({
                    name: title,
                    spec: tag,
                    price: price,
                    qty: 1
                });

                // Subtle feedback pulse
                card.style.transform = 'translateY(-8px) scale(1.02)';
                card.style.borderColor = 'var(--color-accent)';
                setTimeout(() => {
                    card.style.transform = '';
                    card.style.borderColor = '';
                }, 300);
            });
        });

        // Checkout Button
        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', async () => {
                if (!this.items.length) {
                    const emptyMsg = window.i18nManager?.t('cart_alert_empty') || 'Keranjang pesanan masih kosong. Silakan pilih menu matcha terlebih dahulu!';
                    this.showNotice(emptyMsg, 'warning');
                    return;
                }

                // 1. Validate Customer Name (Nama Pemesan)
                const nameInput = document.querySelector('#cart-customer-name');
                const nameField = document.querySelector('#cart-customer-field');
                const rawName = (nameInput ? nameInput.value : '').trim();

                if (!rawName) {
                    if (nameField) {
                        nameField.classList.add('error');
                        setTimeout(() => nameField.classList.remove('error'), 1000);
                    }
                    if (nameInput) {
                        nameInput.focus();
                    }
                    this.showNotice('Silakan masukkan Nama Pemesan terlebih dahulu sebelum melanjutkan!', 'warning');
                    return;
                }

                const totalIDR = this.calculateTotalIDR();
                const totalQty = this.getTotalCount();
                const orderId = 'MTC-' + Math.floor(1000 + Math.random() * 9000);

                // 2. Prepare Structured Database Order Record
                const newOrder = {
                    id: orderId, // ID Pemesanan
                    customerName: rawName, // Nama Pemesan
                    status: 'brewing',
                    table: 'Kiosk Order #' + Math.floor(1 + Math.random() * 20),
                    items: JSON.parse(JSON.stringify(this.items)), // Nama Menu Yang Dipesan & Rincian
                    totalQty: totalQty, // Jumlah
                    total: totalIDR,
                    totalIDR: totalIDR, // Total Harga
                    totalFormattedIDR: `Rp ${totalIDR.toLocaleString('id-ID')}`,
                    timestamp: new Date().toISOString(),
                    timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    dateFormatted: new Date().toLocaleDateString('id-ID')
                };

                // 3. Save to Database (IndexedDB + Backend SQLite Server API + LocalStorage)
                try {
                    await matchaDB.saveOrder(newOrder);
                } catch (e) {
                    console.warn('[Cart] Database save error:', e);
                }

                // 4. Reset Cart & Show Payment Info Pop-Up Modal
                if (nameInput) nameInput.value = '';
                this.items = [];
                this.saveCart();
                this.render();
                this.close();

                this.showPaymentModal(newOrder);
            });
        }
    }

    showNotice(message, type = 'info') {
        let toast = document.querySelector('#matcha-web-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'matcha-web-toast';
            toast.className = 'matcha-web-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.innerHTML = '<span class="matcha-web-toast-dot"></span><span class="matcha-web-toast-text"></span>';
            document.body.appendChild(toast);
        }

        toast.className = 'matcha-web-toast' + (type === 'error' ? ' toast-error' : type === 'warning' ? ' toast-warning' : '');
        const textEl = toast.querySelector('.matcha-web-toast-text');
        if (textEl) textEl.textContent = message;

        clearTimeout(this._noticeTimer);
        requestAnimationFrame(() => toast.classList.add('show'));
        this._noticeTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3200);
    }

    escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    showPaymentModal(order) {
        const existing = document.querySelector('#payment-modal-backdrop');
        if (existing) existing.remove();

        const backdrop = document.createElement('div');
        backdrop.id = 'payment-modal-backdrop';
        backdrop.className = 'payment-modal-backdrop';
        backdrop.setAttribute('role', 'dialog');
        backdrop.setAttribute('aria-modal', 'true');
        backdrop.setAttribute('aria-labelledby', 'payment-modal-title');

        backdrop.innerHTML = `
            <div class="payment-modal-dialog">
                <div class="payment-modal-header">
                    <h3 class="payment-modal-title" id="payment-modal-title">Informasi Pembayaran</h3>
                    <button type="button" class="payment-modal-close" id="payment-close-btn" aria-label="Tutup">&times;</button>
                </div>

                <div class="payment-modal-body">
                    <p class="payment-order-note">
                        Pesanan <strong>#${this.escapeHtml(order.id)}</strong> atas nama <strong>${this.escapeHtml(order.customerName)}</strong> telah dicatat.
                    </p>

                    <div class="payment-total-box">
                        <span class="payment-total-label">Total Pembayaran</span>
                        <span class="payment-total-value">${this.escapeHtml(order.totalFormattedIDR)}</span>
                    </div>

                    <div class="payment-bank-box">
                        <span class="payment-bank-label">Transfer ke Rekening</span>
                        <p class="payment-bank-detail" id="bca-acc-text">7820722005 - BCA - Aaron Faustine Suryanto</p>
                        <button type="button" class="btn-copy-account" id="btn-copy-bca">
                            <span class="copy-text">Salin No. Rekening (7820722005)</span>
                        </button>
                    </div>

                    <p class="payment-hint">Silakan selesaikan pembayaran dan tunjukkan bukti transfer di kasir.</p>
                </div>

                <div class="payment-modal-footer">
                    <button type="button" class="payment-finish-btn" id="payment-finish-btn">Selesai</button>
                </div>
            </div>
        `;

        document.body.appendChild(backdrop);
        document.body.style.overflow = 'hidden';

        requestAnimationFrame(() => {
            backdrop.classList.add('active');
        });

        const closePaymentModal = () => {
            backdrop.classList.remove('active');
            document.body.style.overflow = '';
            window.removeEventListener('keydown', onEsc);
            setTimeout(() => {
                if (backdrop.parentNode) backdrop.remove();
            }, 250);
        };

        const onEsc = (e) => {
            if (e.key === 'Escape') closePaymentModal();
        };
        window.addEventListener('keydown', onEsc);

        const closeBtn = backdrop.querySelector('#payment-close-btn');
        const finishBtn = backdrop.querySelector('#payment-finish-btn');
        const copyBtn = backdrop.querySelector('#btn-copy-bca');

        if (closeBtn) closeBtn.addEventListener('click', closePaymentModal);
        if (finishBtn) finishBtn.addEventListener('click', closePaymentModal);
        backdrop.addEventListener('click', (e) => {
            if (e.target === backdrop) closePaymentModal();
        });

        if (copyBtn) {
            copyBtn.addEventListener('click', async () => {
                const rekening = '7820722005';
                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(rekening);
                    } else {
                        const tmp = document.createElement('textarea');
                        tmp.value = rekening;
                        tmp.style.position = 'fixed';
                        tmp.style.opacity = '0';
                        document.body.appendChild(tmp);
                        tmp.select();
                        document.execCommand('copy');
                        tmp.remove();
                    }
                    copyBtn.classList.add('copied');
                    const textEl = copyBtn.querySelector('.copy-text');
                    if (textEl) textEl.textContent = 'No. Rekening Tersalin!';
                    setTimeout(() => {
                        copyBtn.classList.remove('copied');
                        if (textEl) textEl.textContent = 'Salin No. Rekening (7820722005)';
                    }, 2000);
                } catch (err) {
                    console.warn('[Payment] Clipboard copy failed:', err);
                }
            });
        }
    }

    isOpen() {
        return this.cartModal && this.cartModal.classList.contains('open');
    }

    open() {
        if (!this.cartModal) return;
        this.render();
        this.cartModal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (!this.cartModal) return;
        this.cartModal.classList.remove('open');
        document.body.style.overflow = '';
    }

    addItem(item) {
        // Check if identical item already exists (by name & spec)
        const existing = this.items.find(i => i.name === item.name && i.spec === item.spec);
        let rawPrice = item.priceIDR || item.price || 25000;
        if (typeof rawPrice === 'string') {
            rawPrice = parseInt(rawPrice.replace(/[^0-9]/g, ''), 10) || 25000;
        }
        const priceIDR = (rawPrice > 0 && rawPrice < 500) ? Math.round(rawPrice * 5300) : Math.round(rawPrice);

        if (existing) {
            existing.qty += (item.qty || 1);
            existing.priceIDR = priceIDR;
            existing.price = priceIDR;
        } else {
            this.items.push({
                id: 'item-' + Date.now(),
                name: item.name || 'Matcha Blend',
                spec: item.spec || 'Standard Spec',
                price: priceIDR,
                priceIDR: priceIDR,
                qty: item.qty || 1
            });
        }

        this.saveCart();
        this.render();
        this.triggerBadgeBump();
    }

    updateQty(index, delta) {
        if (!this.items[index]) return;
        this.items[index].qty += delta;

        if (this.items[index].qty <= 0) {
            this.items.splice(index, 1);
        }

        this.saveCart();
        this.render();
        this.triggerBadgeBump();
    }

    removeItem(index) {
        if (!this.items[index]) return;
        this.items.splice(index, 1);
        this.saveCart();
        this.render();
        this.triggerBadgeBump();
    }

    calculateTotal() {
        return this.calculateTotalIDR();
    }

    getTotalCount() {
        return this.items.reduce((count, item) => count + item.qty, 0);
    }

    calculateTotalIDR() {
        return this.items.reduce((sum, item) => {
            const raw = item.priceIDR || item.price || 25000;
            const p = (raw > 0 && raw < 500) ? Math.round(raw * 5300) : Math.round(raw);
            return sum + (p * item.qty);
        }, 0);
    }

    triggerBadgeBump() {
        const badges = document.querySelectorAll('#cart-count, #cart-floating-count, .cart-count-badge, .pantone-cart-badge');
        badges.forEach(badge => {
            badge.classList.add('bump');
            setTimeout(() => {
                badge.classList.remove('bump');
            }, 300);
        });
    }

    render() {
        if (this._isRendering) return;
        this._isRendering = true;

        try {
            // 1. Update Badge Count on all badges across the interface
            const totalCount = this.getTotalCount();
            const badges = document.querySelectorAll('#cart-count, #cart-floating-count, .cart-count-badge, .pantone-cart-badge, .cart-fab-badge, #custom-cart-badge');
            badges.forEach(badge => {
                badge.textContent = totalCount;
                badge.style.display = totalCount > 0 ? 'flex' : 'none';
            });

            // Notify other components (e.g. Pantone Specimen Menu)
            document.dispatchEvent(new CustomEvent('matcha:cart-updated', { detail: { count: totalCount } }));

            // 2. Update Total Price (Indonesian Rupiah display)
            const totalIDR = this.calculateTotalIDR();
            const totalUSD = this.calculateTotal();
            if (this.totalPriceElem) {
                this.totalPriceElem.textContent = `Rp ${totalIDR.toLocaleString('id-ID')}`;
            }

            // 3. Render Items List
            if (!this.itemsContainer) return;

            if (!this.items.length) {
                const emptyTitle = window.i18nManager?.t('cart_empty_title') || 'Keranjang pesanan masih kosong.';
                const emptySub = window.i18nManager?.t('cart_empty_sub') || 'Pilih salah satu menu untuk kustomisasi dan tambahkan ke pesanan!';
                this.itemsContainer.innerHTML = `
                    <div class="cart-empty-state">
                        <p>${emptyTitle}</p>
                        <span>${emptySub}</span>
                    </div>
                `;
                return;
            }

            this.itemsContainer.innerHTML = '';
            this.items.forEach((item, idx) => {
                const itemElem = document.createElement('div');
                itemElem.className = 'cart-item';
                const raw = item.priceIDR || item.price || 25000;
                const p = (raw > 0 && raw < 500) ? Math.round(raw * 5300) : Math.round(raw);
                const itemPriceStr = `Rp ${(p * item.qty).toLocaleString('id-ID')}`;
                itemElem.innerHTML = `
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-spec">${item.spec}</span>
                    </div>
                    <div class="cart-item-actions">
                        <div class="cart-qty-ctrl">
                            <button class="cart-qty-btn btn-minus" data-idx="${idx}">−</button>
                            <span class="cart-qty-num">${item.qty}</span>
                            <button class="cart-qty-btn btn-plus" data-idx="${idx}">+</button>
                        </div>
                        <span class="cart-item-price">${itemPriceStr}</span>
                        <button class="cart-item-remove" data-idx="${idx}" title="Remove">Hapus</button>
                    </div>
                `;
                this.itemsContainer.appendChild(itemElem);
            });

            // Bind item actions (plus, minus, remove)
            this.itemsContainer.querySelectorAll('.btn-plus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.idx, 10);
                    this.updateQty(idx, 1);
                });
            });

            this.itemsContainer.querySelectorAll('.btn-minus').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.idx, 10);
                    this.updateQty(idx, -1);
                });
            });

            this.itemsContainer.querySelectorAll('.cart-item-remove').forEach(btn => {
                btn.addEventListener('click', () => {
                    const idx = parseInt(btn.dataset.idx, 10);
                    this.removeItem(idx);
                });
            });
        } finally {
            this._isRendering = false;
        }
    }
}
