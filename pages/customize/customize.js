/**
 * MatchaTcih • Interactive Custom Drink Controller
 * Pages Architecture: pages/customize/customize.js
 * Manages preset templates, dynamic options, live cup layer pouring/stacking,
 * +Rp 3.000 / topping pricing math, and cart synchronization.
 */

export class CustomizeManager {
  constructor(options = {}) {
    this.root = document.querySelector('#customize-root') || document;
    this.form = this.root.querySelector('#custom-drink-form');
    this.titleEl = this.root.querySelector('#custom-drink-title');
    this.badgeEl = this.root.querySelector('#custom-mode-badge');
    this.pantoneCodeEl = this.root.querySelector('#custom-pantone-code');
    this.totalPriceEl = this.root.querySelector('#custom-total-price');
    this.breakdownSubEl = this.root.querySelector('#custom-breakdown-sub');
    this.btnPriceDisplay = this.root.querySelector('#btn-price-display');
    this.backBtn = this.root.querySelector('#custom-back-btn');
    this.resetBtn = this.root.querySelector('#custom-reset-btn');
    this.submitBtn = this.root.querySelector('#custom-add-cart-btn');
    this.cartBtn = this.root.querySelector('#custom-cart-btn');
    this.cartBadge = this.root.querySelector('#custom-cart-badge');
    this.toast = this.root.querySelector('#custom-toast');
    this.toastMsg = this.root.querySelector('#custom-toast-msg');

    // Visual Cup Elements
    this.cupChamber = this.root.querySelector('#cup-chamber');
    this.emptyState = this.root.querySelector('#cup-empty-indicator');
    this.layerBoba = this.root.querySelector('#visual-layer-boba');
    this.layerMatcha = this.root.querySelector('#visual-layer-matcha');
    this.layerMilk = this.root.querySelector('#visual-layer-milk');
    this.layerIce = this.root.querySelector('#visual-layer-ice');
    this.layerChoco = this.root.querySelector('#visual-layer-choco');
    this.layerFoam = this.root.querySelector('#visual-layer-foam');
    this.layerCoconut = this.root.querySelector('#visual-layer-coconut');

    // Live Tag Callouts
    this.tagFoam = this.root.querySelector('#tag-foam-label');
    this.tagMilk = this.root.querySelector('#tag-milk-label');
    this.tagMilkText = this.root.querySelector('#tag-milk-text');
    this.tagMatcha = this.root.querySelector('#tag-matcha-label');

    // Drink Templates Catalog
    this.templates = {
      'hot-traditional': {
        name: 'HOT TRADITIONAL MATCHA',
        pantone: 'SPECIMEN 0794 C',
        basePrice: 25000,
        milk: 'none',
        sugar: '0',
        ice: 'hot',
        toppings: []
      },
      'matcha-latte': {
        name: 'MATCHA LATTE',
        pantone: 'SPECIMEN 2270 C',
        basePrice: 25000,
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'iced-coconut-matcha': {
        name: 'ICED COCONUT MATCHA',
        pantone: 'SPECIMEN 00997 C',
        basePrice: 30000,
        milk: 'oat',
        sugar: '70',
        ice: 'normal',
        toppings: ['coconut']
      },
      'strawberry-matcha': {
        name: 'STRAWBERRY MATCHA',
        pantone: 'SPECIMEN 187 C',
        basePrice: 32000,
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'mango-matcha-smoothie': {
        name: 'MANGO MATCHA SMOOTHIE',
        pantone: 'SPECIMEN 2245 C',
        basePrice: 32000,
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'matcha-lemonade': {
        name: 'MATCHA LEMONADE',
        pantone: 'SPECIMEN 106 C',
        basePrice: 26000,
        milk: 'none',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'matcha-mocha': {
        name: 'MATCHA MOCHA',
        pantone: 'SPECIMEN 4975 C',
        basePrice: 30000,
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: ['chocolate']
      },
      'sparkling-matcha-ginger': {
        name: 'SPARKLING MATCHA GINGER',
        pantone: 'SPECIMEN 189 C',
        basePrice: 28000,
        milk: 'none',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'matcha-spirulina-elixir': {
        name: 'MATCHA SPIRULINA ELIXIR',
        pantone: 'SPECIMEN 399 C',
        basePrice: 34000,
        milk: 'none',
        sugar: '30',
        ice: 'less',
        toppings: []
      },
      // 6 Signature Menu Items
      'ice-matcha-latte': {
        name: 'ICE MATCHA LATTE',
        pantone: 'SPECIMEN 2270 C',
        basePrice: 25000,
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'ice-matcharicano': {
        name: 'ICE MATCHARICANO',
        pantone: 'SPECIMEN 0794 C',
        basePrice: 22000,
        milk: 'none',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'ice-matcha-chocolate': {
        name: 'ICE MATCHA CHOCOLATE',
        pantone: 'SPECIMEN 4975 C',
        basePrice: 28000,
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: ['chocolate']
      },
      'ice-matcha-vanilla-foam': {
        name: 'ICE MATCHA VANILLA CLOUD FOAM',
        pantone: 'SPECIMEN 00997 C',
        basePrice: 28000,
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: ['vanilla_foam']
      },
      'ice-chocolate': {
        name: 'ICE CHOCOLATE',
        pantone: 'SPECIMEN 4695 C',
        basePrice: 25000,
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'custom-drink': {
        name: 'CUSTOM MATCHA CRAFT',
        pantone: 'CRAFT LAB • DARI AWAL',
        basePrice: 20000,
        milk: 'none',
        sugar: '70',
        ice: 'normal',
        toppings: [],
        isScratch: true
      }
    };

    this.currentDrinkId = 'ice-matcha-latte';
    this.currentBasePrice = 25000;
    this.isScratch = false;

    this.init();
  }

  init() {
    this.detectInitialPreset();
    this.bindFormChangeListeners();
    this.bindActions();
    this.syncCartBadge();
    this.updateRecipeAndVisuals();
  }

  /**
   * 1. Detect template preset from URL search (?drink=...) or shared storage
   */
  detectInitialPreset() {
    let drinkKey = '';
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('drink')) {
      drinkKey = urlParams.get('drink').toLowerCase();
    } else if (window.location.hash) {
      const match = window.location.hash.match(/drink=([a-z0-9_-]+)/i);
      if (match) drinkKey = match[1].toLowerCase();
    }

    if (!drinkKey) {
      try {
        drinkKey = localStorage.getItem('matcha_selected_drink') || '';
      } catch {}
    }

    if (drinkKey && this.templates[drinkKey]) {
      this.loadTemplate(drinkKey);
    } else {
      // Default fallback template: Matcha Latte
      this.loadTemplate('matcha-latte');
    }
  }

  /**
   * 2. Populate form fields from template preset
   */
  loadTemplate(drinkKey) {
    const tpl = this.templates[drinkKey] || this.templates['matcha-latte'];
    this.currentDrinkId = drinkKey;
    this.currentBasePrice = tpl.basePrice;
    this.isScratch = !!tpl.isScratch;

    // Update Headings & Meta
    if (this.titleEl) this.titleEl.textContent = tpl.name;
    if (this.pantoneCodeEl) this.pantoneCodeEl.textContent = tpl.pantone;
    if (this.badgeEl) {
      this.badgeEl.textContent = this.isScratch ? 'Custom Craft • Dari Gelas Kosong' : 'Template Menu • Bisa Diedit';
    }

    // Set Milk Radio
    const milkRadio = this.form.querySelector(`input[name="custom_milk"][value="${tpl.milk}"]`);
    if (milkRadio) milkRadio.checked = true;

    // Set Sugar Radio
    const sugarRadio = this.form.querySelector(`input[name="custom_sugar"][value="${tpl.sugar}"]`);
    if (sugarRadio) sugarRadio.checked = true;

    // Set Ice Radio
    const iceRadio = this.form.querySelector(`input[name="custom_ice"][value="${tpl.ice}"]`);
    if (iceRadio) iceRadio.checked = true;

    // Set Topping Checkboxes
    const toppingBoxes = this.form.querySelectorAll('input[name="custom_toppings"]');
    toppingBoxes.forEach((chk) => {
      chk.checked = tpl.toppings && tpl.toppings.includes(chk.value);
    });

    this.updateRecipeAndVisuals();
  }

  /**
   * 3. Listen for form input changes (live real-time update)
   */
  bindFormChangeListeners() {
    if (!this.form) return;

    this.form.addEventListener('change', () => {
      this.isScratch = false;
      this.updateRecipeAndVisuals();
    });
  }

  /**
   * 4. Dynamic Math & Live Layer Stacking Visuals
   */
  updateRecipeAndVisuals() {
    // Read Current Selections
    const milkVal = this.form.querySelector('input[name="custom_milk"]:checked')?.value || 'fresh';
    const sugarVal = this.form.querySelector('input[name="custom_sugar"]:checked')?.value || '70';
    const iceVal = this.form.querySelector('input[name="custom_ice"]:checked')?.value || 'normal';
    const selectedToppings = Array.from(this.form.querySelectorAll('input[name="custom_toppings"]:checked')).map(c => c.value);

    // Calculate Price:
    // Base Price + Extra Milk (Oat: +4k) + Toppings count * 3.000 (3 rebu)
    let extraMilk = 0;
    if (milkVal === 'oat' || milkVal === 'almond') extraMilk = 4000;

    const toppingCostPerItem = 3000; // 3 rebu per user requirement
    const extraToppings = selectedToppings.length * toppingCostPerItem;

    const totalPrice = this.currentBasePrice + extraMilk + extraToppings;

    // Format IDR Currency
    const formattedPrice = `Rp ${totalPrice.toLocaleString('id-ID')}`;
    if (this.totalPriceEl) this.totalPriceEl.textContent = formattedPrice;
    if (this.btnPriceDisplay) this.btnPriceDisplay.textContent = formattedPrice;

    // Breakdown Text
    let breakdownText = `Base ${this.formatIDR(this.currentBasePrice)}`;
    if (extraMilk > 0) breakdownText += ` + Susu Oat (${this.formatIDR(extraMilk)})`;
    if (selectedToppings.length > 0) {
      breakdownText += ` + ${selectedToppings.length} Topping (${this.formatIDR(extraToppings)})`;
    } else {
      breakdownText += ` (Tanpa Topping Tambahan)`;
    }
    if (this.breakdownSubEl) this.breakdownSubEl.textContent = breakdownText;

    // =========================================================================
    // UPDATE VISUAL CUP IN REAL-TIME
    // =========================================================================

    // If starting completely blank with no milk and no matcha
    const isCupCompletelyBlank = (milkVal === 'none' && selectedToppings.length === 0 && this.isScratch);
    if (this.emptyState) {
      if (isCupCompletelyBlank) {
        this.emptyState.classList.add('visible');
      } else {
        this.emptyState.classList.remove('visible');
      }
    }

    // A. Matcha Layer
    if (this.layerMatcha) {
      if (isCupCompletelyBlank) {
        this.layerMatcha.classList.add('empty');
      } else {
        this.layerMatcha.classList.remove('empty');
      }
    }
    if (this.tagMatcha) {
      this.tagMatcha.classList.toggle('visible', !isCupCompletelyBlank);
    }

    // B. Milk Layer & Swirl
    if (this.layerMilk) {
      if (milkVal === 'none' || isCupCompletelyBlank) {
        this.layerMilk.classList.add('none');
        this.layerMilk.classList.remove('oat');
        if (this.tagMilk) this.tagMilk.classList.remove('visible');
      } else if (milkVal === 'oat') {
        this.layerMilk.classList.remove('none');
        this.layerMilk.classList.add('oat');
        if (this.tagMilk) {
          this.tagMilk.classList.add('visible');
          if (this.tagMilkText) this.tagMilkText.textContent = '🌾 Oatly Oat Milk Layer';
        }
      } else {
        this.layerMilk.classList.remove('none', 'oat');
        if (this.tagMilk) {
          this.tagMilk.classList.add('visible');
          if (this.tagMilkText) this.tagMilkText.textContent = '🥛 Fresh Milk Layer';
        }
      }
    }

    // C. Ice Cubes Layer
    if (this.layerIce) {
      if (iceVal === 'hot' || isCupCompletelyBlank) {
        this.layerIce.classList.add('hot');
      } else {
        this.layerIce.classList.remove('hot');
      }
    }

    // D. Stackable Toppings in the Cup:
    // 1. Vanilla Cloud Foam
    const hasFoam = selectedToppings.includes('vanilla_foam');
    if (this.layerFoam) {
      this.layerFoam.classList.toggle('active', hasFoam);
    }
    if (this.tagFoam) {
      this.tagFoam.classList.toggle('visible', hasFoam);
    }

    // 2. Dark Chocolate Drizzle
    const hasChoco = selectedToppings.includes('chocolate');
    if (this.layerChoco) {
      this.layerChoco.classList.toggle('active', hasChoco);
    }

    // 3. Boba / Matcha Jelly
    const hasBoba = selectedToppings.includes('boba');
    if (this.layerBoba) {
      this.layerBoba.classList.toggle('active', hasBoba);
    }

    // 4. Toasted Coconut Flakes
    const hasCoconut = selectedToppings.includes('coconut');
    if (this.layerCoconut) {
      this.layerCoconut.classList.toggle('active', hasCoconut);
    }
  }

  /**
   * Helper currency formatter
   */
  formatIDR(num) {
    return `Rp ${(num || 0).toLocaleString('id-ID')}`;
  }

  /**
   * 5. Button Actions: Back, Reset, Add to Cart
   */
  bindActions() {
    // Back Button -> Returns to Menu page
    if (this.backBtn) {
      this.backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // If embedded in SPA
        if (window.pageNavigator && typeof window.pageNavigator.goToPage === 'function') {
          window.pageNavigator.goToPage('menu', true);
        } else {
          // If navigated from menu, go back in history
          if (document.referrer && window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = '../../index.html';
          }
        }
      });
    }

    // Reset to Empty Cup ("Mulai dari Gelas Kosong")
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.isScratch = true;
        this.currentDrinkId = 'custom-drink';
        this.currentBasePrice = 20000;

        if (this.titleEl) this.titleEl.textContent = 'CUSTOM MATCHA CRAFT';
        if (this.pantoneCodeEl) this.pantoneCodeEl.textContent = 'CRAFT LAB • DARI AWAL';
        if (this.badgeEl) this.badgeEl.textContent = 'Custom Craft • Dari Gelas Kosong';

        // Set Milk to none
        const noneMilk = this.form.querySelector('input[name="custom_milk"][value="none"]');
        if (noneMilk) noneMilk.checked = true;

        // Uncheck all toppings
        this.form.querySelectorAll('input[name="custom_toppings"]').forEach(c => c.checked = false);

        this.updateRecipeAndVisuals();
        this.showToast('Gelas dikosongkan. Silakan racik dari awal!');
      });
    }

    // Add to Cart
    if (this.submitBtn) {
      this.submitBtn.addEventListener('click', () => {
        this.handleAddToCart();
      });
    }

    // Floating Cart Button Trigger
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
   * 6. Add Custom Recipe to Cart
   */
  handleAddToCart() {
    const milkVal = this.form.querySelector('input[name="custom_milk"]:checked')?.value || 'fresh';
    const sugarVal = this.form.querySelector('input[name="custom_sugar"]:checked')?.value || '70';
    const iceVal = this.form.querySelector('input[name="custom_ice"]:checked')?.value || 'normal';
    const selectedToppings = Array.from(this.form.querySelectorAll('input[name="custom_toppings"]:checked')).map(c => c.value);

    // Readable Names
    const milkNames = { fresh: 'Fresh Milk', oat: 'Oat Milk (+4k)', none: 'Tanpa Susu' };
    const iceNames = { hot: 'Hot (No Ice)', less: 'Less Ice', normal: 'Normal Ice', extra: 'Extra Ice' };
    const toppingNames = {
      vanilla_foam: 'Vanilla Foam (+3k)',
      chocolate: 'Choco Swirl (+3k)',
      boba: 'Matcha Boba (+3k)',
      coconut: 'Coconut Flakes (+3k)'
    };

    const toppingsSummary = selectedToppings.map(t => toppingNames[t] || t).join(', ');

    let extraMilk = (milkVal === 'oat' || milkVal === 'almond') ? 4000 : 0;
    const extraToppings = selectedToppings.length * 3000;
    const finalPriceIDR = this.currentBasePrice + extraMilk + extraToppings;
    const finalPriceUSD = parseFloat((finalPriceIDR / 5300).toFixed(2));

    const itemTitle = this.titleEl?.textContent || 'Custom Matcha';
    const specDetails = `${milkNames[milkVal] || milkVal}, ${sugarVal}% Gula, ${iceNames[iceVal] || iceVal}${toppingsSummary ? ' • ' + toppingsSummary : ''}`;

    const orderItem = {
      name: itemTitle,
      spec: specDetails,
      price: finalPriceUSD,
      priceIDR: finalPriceIDR,
      qty: 1
    };

    // Add to Global Cart Manager if present
    if (window.cartManager && typeof window.cartManager.addItem === 'function') {
      window.cartManager.addItem(orderItem);
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem('matcha_cart') || '[]');
        saved.push(orderItem);
        localStorage.setItem('matcha_cart', JSON.stringify(saved));
        window.dispatchEvent(new Event('storage'));
        document.dispatchEvent(new CustomEvent('matcha:cart-updated'));
      } catch (e) {
        console.warn('Failed to save cart:', e);
      }
    }

    this.syncCartBadge();
    this.showToast(`Berhasil menambahkan ${itemTitle} ke pesanan!`);

    // Optional subtle button pulse feedback
    this.submitBtn.style.transform = 'scale(1.05)';
    setTimeout(() => {
      this.submitBtn.style.transform = '';
    }, 280);
  }

  /**
   * 7. Sync Cart Count
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

  /**
   * 8. Toast Feedback
   */
  showToast(msg) {
    if (!this.toast) return;
    if (this.toastMsg) this.toastMsg.textContent = msg;
    this.toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.classList.remove('show');
    }, 2400);
  }
}

// Auto-initialize when loaded
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.customizeManager && document.querySelector('#customize-root')) {
      window.customizeManager = new CustomizeManager();
    }
  });
}
