/**
 * Shopping Cart Manager & Modal Pop-Up
 * Handles item additions, quantity updates, total calculation, and modal toggling.
 */
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
        // Toggle Cart Modal
        if (this.cartBtn) {
            this.cartBtn.addEventListener('click', () => this.open());
        }

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
            this.checkoutBtn.addEventListener('click', () => {
                if (!this.items.length) {
                    const emptyMsg = window.i18nManager?.t('cart_alert_empty') || 'Your cart is currently empty. Please add a matcha blend first!';
                    alert(emptyMsg);
                    return;
                }
                const total = this.calculateTotal().toFixed(2);
                const successTemplate = window.i18nManager?.t('cart_alert_success') || 'Thank you! Your order of ${total} is now being prepared by our tea masters.';

                // Save confirmed order to Admin Monitor database (localStorage)
                const newOrder = {
                    id: 'MTC-' + Math.floor(1000 + Math.random() * 9000),
                    timestamp: new Date().toISOString(),
                    timeFormatted: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    dateFormatted: new Date().toLocaleDateString(),
                    status: 'brewing',
                    table: 'Kiosk Order',
                    items: JSON.parse(JSON.stringify(this.items)),
                    total: parseFloat(total)
                };

                try {
                    const existing = JSON.parse(localStorage.getItem('matcha_orders') || '[]');
                    existing.unshift(newOrder);
                    localStorage.setItem('matcha_orders', JSON.stringify(existing));
                    window.dispatchEvent(new Event('storage'));
                } catch (e) {
                    console.warn('Failed to record order:', e);
                }

                alert(successTemplate.replace('${total}', `$${total}`));
                this.items = [];
                this.saveCart();
                this.render();
                this.close();
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
        if (existing) {
            existing.qty += (item.qty || 1);
        } else {
            this.items.push({
                id: 'item-' + Date.now(),
                name: item.name || 'Matcha Blend',
                spec: item.spec || 'Standard Spec',
                price: parseFloat(item.price) || 4.50,
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
        return this.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
    }

    getTotalCount() {
        return this.items.reduce((count, item) => count + item.qty, 0);
    }

    triggerBadgeBump() {
        if (!this.countBadge) return;
        this.countBadge.classList.add('bump');
        setTimeout(() => {
            this.countBadge.classList.remove('bump');
        }, 300);
    }

    render() {
        // 1. Update Badge Count
        const totalCount = this.getTotalCount();
        if (this.countBadge) {
            this.countBadge.textContent = totalCount;
        }

        // 2. Update Total Price
        const totalPrice = this.calculateTotal();
        if (this.totalPriceElem) {
            this.totalPriceElem.textContent = `$${totalPrice.toFixed(2)}`;
        }

        // 3. Render Items List
        if (!this.itemsContainer) return;

        if (!this.items.length) {
            const emptyTitle = window.i18nManager?.t('cart_empty_title') || 'Your cart is currently empty.';
            const emptySub = window.i18nManager?.t('cart_empty_sub') || 'Craft a blend in the Simulation Lab or explore our Crafted Menu!';
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
                    <span class="cart-item-price">$${(item.price * item.qty).toFixed(2)}</span>
                    <button class="cart-item-remove" data-idx="${idx}" title="Remove">Remove</button>
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
    }
}
