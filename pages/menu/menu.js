/**
 * MatchaTcih • Pantone Specimen Menu Controller
 * Pages Architecture: pages/menu/menu.js
 * Manages specimen cards, category filtering, cart additions, view modes, and navigation.
 */

import { CartManager } from '../../js/cart.js';
import { ThumbnailManager } from '../thumbnail/thumbnail.js';

export class MenuManager {
  constructor(options = {}) {
    this.root = document.querySelector('#pantone-menu-root') || document;
    this.backBtn = this.root.querySelector('#pantone-back-btn');
    this.filterBtns = this.root.querySelectorAll('.pantone-filter-btn');
    this.cards = this.root.querySelectorAll('.pantone-card');
    this.cardsGrid = this.root.querySelector('#pantone-cards-grid');
    this.toggleGridBtn = this.root.querySelector('#pantone-toggle-grid-btn');
    this.resetFilterBtn = this.root.querySelector('#pantone-reset-filter-btn');
    this.cartBtn = this.root.querySelector('#pantone-cart-btn') || document.querySelector('#cart-floating-btn');
    this.cartBadge = this.root.querySelector('#pantone-cart-badge') || document.querySelector('#cart-floating-count');
    this.toast = this.root.querySelector('#pantone-toast');
    this.menuLogo = this.root.querySelector('#pantone-menu-logo');

    this.toastTimeout = null;
    this.activeCategory = 'all';

    this.init();
  }

  init() {
    // Ensure CartManager is active for standalone or embedded pages
    if (!window.cartManager) {
      window.cartManager = new CartManager();
    }

    // Initialize Page-Modular Thumbnail / Attract Screensaver if present
    if (document.querySelector('#thumbnail-screen') && !window.thumbnailManager) {
      window.thumbnailManager = new ThumbnailManager({ idleTimeoutMs: 60000 });
    }

    this.bindBackNavigation();
    this.bindCategoryFilters();
    this.bindCardInteractions();
    this.bindFloatingControls();
    this.syncCartBadge();

    // Listen for cart changes across the application
    document.addEventListener('matcha:cart-updated', () => {
      this.syncCartBadge();
    });

    // Also sync on storage change (across tabs/windows)
    window.addEventListener('storage', (e) => {
      if (e.key === 'matcha_cart') {
        this.syncCartBadge();
      }
    });
  }

  /**
   * 1. Top Left Floating Back Button -> Returns to Welcome Thumbnail Screen
   */
  bindBackNavigation() {
    const returnToThumbnail = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      // Return to Kiosk Thumbnail Attract Screensaver
      const thumbScreen = document.querySelector('#thumbnail-screen');
      if (thumbScreen) {
        if (window.thumbnailManager && typeof window.thumbnailManager.showScreensaver === 'function') {
          window.thumbnailManager.showScreensaver();
          return;
        }
        thumbScreen.style.display = '';
        thumbScreen.classList.remove('hidden');
        document.body.classList.add('thumbnail-active');
        return;
      }
      // Navigate to standalone thumbnail or previous page
      if (document.referrer && (document.referrer.includes('thumbnail') || document.referrer.includes('index.html'))) {
        window.history.back();
      } else {
        const isPages = window.location.pathname.includes('/pages/');
        window.location.href = isPages ? '../thumbnail/thumbnail.html' : 'pages/thumbnail/thumbnail.html';
      }
    };

    if (this.backBtn) {
      this.backBtn.addEventListener('click', returnToThumbnail);
    }

    if (this.menuLogo) {
      this.menuLogo.addEventListener('click', returnToThumbnail);
    }

    // Secret Owner Shortcut: Press Ctrl + Alt + A to open Admin Dashboard
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.altKey && (e.key === 'a' || e.key === 'A')) {
        window.location.href = '../../admin.html';
      }
    });

    // Or 5 quick clicks on the subtitle "CURATED SPECIMEN PALETTE • UJI 2026"
    const subLabel = this.root.querySelector('.pantone-sub-label');
    if (subLabel) {
      let clicks = 0;
      let clickTimer = null;
      subLabel.addEventListener('click', () => {
        clicks++;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => { clicks = 0; }, 2000);
        if (clicks >= 5) {
          window.location.href = '../../admin.html';
        }
      });
    }
  }

  /**
   * 2. Category Filter Navigation (All, Traditional, Lattes, Refreshers, Specialty)
   */
  bindCategoryFilters() {
    if (!this.filterBtns.length) return;

    this.filterBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category || 'all';
        this.activeCategory = category;

        // Update active class
        this.filterBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter cards with smooth fade
        this.cards.forEach((card) => {
          const cardCat = card.dataset.category || '';
          if (category === 'all' || cardCat.includes(category)) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      });
    });
  }

  /**
   * 3. Pantone Card Click / Enter -> Navigate to Custom Craft Page with Preset
   */
  bindCardInteractions() {
    if (!this.cards.length) return;

    this.cards.forEach((card) => {
      const handleSelect = (e) => {
        // Prevent click if clicking a specific sub-link
        if (e.target.closest('a')) return;

        const cardId = card.dataset.id || 'matcha-latte';
        const name = card.dataset.name || card.querySelector('.pantone-card-title')?.textContent.trim() || 'Matcha Drink';

        // Save selected drink preset in storage & persist active kiosk ordering session
        try {
          localStorage.setItem('matcha_selected_drink', cardId);
          sessionStorage.setItem('matcha_kiosk_active', 'true');
        } catch {}

        // Visual feedback on card
        card.style.transform = 'translateY(-10px) scale(1.03)';
        setTimeout(() => {
          card.style.transform = '';
        }, 300);

        this.showToast(`Membuka Customizer: ${name}...`);

        // Navigate to the new Customize Craft Page (pages/customize/customize.html)
        setTimeout(() => {
          const isRoot = !window.location.pathname.includes('/pages/');
          const targetUrl = isRoot
            ? `pages/customize/customize.html?drink=${encodeURIComponent(cardId)}`
            : `../customize/customize.html?drink=${encodeURIComponent(cardId)}`;
          window.location.href = targetUrl;
        }, 220);
      };

      card.addEventListener('click', handleSelect);

      // Keyboard accessibility (Enter / Space)
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect(e);
        }
      });
    });
  }

  /**
   * 4. Floating Action Controls (Grid Density & Cart Trigger)
   */
  bindFloatingControls() {
    // Grid density toggle (3-column vs 4-column dense)
    if (this.toggleGridBtn && this.cardsGrid) {
      this.toggleGridBtn.addEventListener('click', () => {
        this.cardsGrid.classList.toggle('grid-dense');
        const isDense = this.cardsGrid.classList.contains('grid-dense');
        this.showToast(isDense ? 'Compact 4-column view' : 'Standard 3-column view');
      });
    }

    // Reset / Refresh button (Reloads all cards & resets filter view)
    if (this.resetFilterBtn) {
      this.resetFilterBtn.addEventListener('click', () => {
        const svg = this.resetFilterBtn.querySelector('svg');
        if (svg) {
          svg.style.transition = 'transform 0.4s ease';
          svg.style.transform = 'rotate(360deg)';
          setTimeout(() => { svg.style.transform = ''; }, 450);
        }

        // Reset category filter
        this.activeCategory = 'all';
        this.filterBtns.forEach((b) => {
          if (b.dataset.category === 'all') b.classList.add('active');
          else b.classList.remove('active');
        });

        // Show all cards
        this.cards.forEach((card) => card.classList.remove('hidden'));

        // Reset grid density if toggled
        if (this.cardsGrid) {
          this.cardsGrid.classList.remove('grid-dense');
        }

        this.showToast('Specimen Grid Reset (All 9 Drinks)');
      });
    }

    // Floating Cart button -> opens global cart modal
    if (this.cartBtn) {
      this.cartBtn.addEventListener('click', () => {
        if (window.cartManager && typeof window.cartManager.open === 'function') {
          window.cartManager.open();
        } else {
          const cartModal = document.querySelector('#cart-modal-backdrop');
          if (cartModal) cartModal.classList.add('active');
        }
      });
    }
  }

  /**
   * 5. Sync Cart Badge Count
   */
  syncCartBadge() {
    if (!this.cartBadge) return;

    let count = 0;
    if (window.cartManager && Array.isArray(window.cartManager.items)) {
      count = window.cartManager.items.reduce((sum, item) => sum + (item.qty || 1), 0);
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem('matcha_cart') || '[]');
        count = saved.reduce((sum, item) => sum + (item.qty || 1), 0);
      } catch {
        count = 0;
      }
    }

    this.cartBadge.textContent = count;
    this.cartBadge.style.display = count > 0 ? 'flex' : 'none';
  }

  bumpCartBadge() {
    this.syncCartBadge();
    if (this.cartBadge) {
      this.cartBadge.classList.add('bump');
      setTimeout(() => {
        this.cartBadge.classList.remove('bump');
      }, 350);
    }
  }

  /**
   * 6. Minimalist Toast Notification
   */
  showToast(message) {
    if (!this.toast) return;

    const textElem = this.toast.querySelector('.pantone-toast-text');
    if (textElem) textElem.textContent = message;

    this.toast.classList.add('show');

    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2200);
  }
}

// Auto-initialize when loaded standalone in browser
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only auto-init standalone if not already initialized by main.js
    if (!window.menuManager && document.querySelector('#pantone-menu-root')) {
      window.menuManager = new MenuManager();
    }
  });
}
