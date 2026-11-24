/**
 * MatchaTcih • Interactive Custom Drink Controller
 * Pages Architecture: pages/customize/customize.js
 * Manages preset templates, dynamic options, live tumbler photo switching,
 * realistic topping overlays, +Rp 3.000 / topping pricing math, and cart synchronization.
 */

import { CartManager } from '../../js/cart.js';

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

    // Hand-Drawn Sketch Craft Tumbler Elements
    this.sketchSvg = this.root.querySelector('#sketch-tumbler-svg');
    this.emptyState = this.root.querySelector('#cup-empty-indicator');
    this.sketchMilkLayer = this.root.querySelector('#sketch-layer-milk');
    this.sketchMilkRect = this.root.querySelector('#sketch-milk-rect');
    this.sketchBaseLayer = this.root.querySelector('#sketch-layer-base');
    this.sketchBaseRect = this.root.querySelector('#sketch-base-rect');
    this.sketchBaseMeniscus = this.root.querySelector('#sketch-base-meniscus');
    this.sketchSwirlWave = this.root.querySelector('#sketch-swirl-wave');
    this.sketchOatDoodles = this.root.querySelector('#sketch-oat-doodles');
    this.sketchWaterRipples = this.root.querySelector('#sketch-water-ripples');
    this.sketchFoam = this.root.querySelector('#sketch-topping-foam');
    this.sketchChoco = this.root.querySelector('#sketch-topping-choco');
    this.sketchIceLayer = this.root.querySelector('#sketch-ice-layer');
    this.sketchSteam = this.root.querySelector('#sketch-hot-steam');
    this.sketchIceCubes = this.root.querySelectorAll('.sketch-ice-cube');
    this.extraIceCube = this.root.querySelector('#ice-cube-5');

    // Live Dynamic Tag Callouts
    this.tagFoam = this.root.querySelector('#tag-foam-label');
    this.tagChoco = this.root.querySelector('#tag-choco-label');
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
        toppings: []
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
        toppings: []
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
        base: 'matcha',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'ice-matcharicano': {
        name: 'ICE MATCHARICANO',
        pantone: 'SPECIMEN 0794 C',
        basePrice: 22000,
        base: 'matcha',
        milk: 'none',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'ice-matcha-chocolate': {
        name: 'ICE MATCHA CHOCOLATE',
        pantone: 'SPECIMEN 4975 C',
        basePrice: 28000,
        base: 'matcha',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'ice-matcha-vanilla-foam': {
        name: 'ICE MATCHA VANILLA CLOUD FOAM',
        pantone: 'SPECIMEN 00997 C',
        basePrice: 28000,
        base: 'matcha',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'ice-chocolate': {
        name: 'ICE CHOCOLATE',
        pantone: 'SPECIMEN 4695 C',
        basePrice: 25000,
        base: 'chocolate',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'ice-matcha-strawberry': {
        name: 'ICE MATCHA STRAWBERRY',
        pantone: 'SPECIMEN 187 C',
        basePrice: 29000,
        base: 'matcha',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      'ice-matcha-coconut': {
        name: 'ICE MATCHA COCONUT',
        pantone: 'SPECIMEN 00997 C',
        basePrice: 27000,
        base: 'matcha',
        milk: 'oat',
        sugar: '70',
        ice: 'normal',
        toppings: []
      },
      // Blank Canvas Custom (All options start unselected)
      'custom-drink': {
        name: 'CUSTOM DRINK CRAFT',
        pantone: 'CRAFT LAB • DARI AWAL',
        basePrice: 0,
        base: null,
        milk: null,
        sugar: null,
        ice: null,
        toppings: [],
        isScratch: true
      }
    };

    this.currentDrinkId = 'custom-drink';
    this.currentBasePrice = 0;
    this.isScratch = true;

    this.init();
  }

  init() {
    // Ensure CartManager instance is initialized for standalone or embedded pages
    if (!window.cartManager) {
      window.cartManager = new CartManager();
    }

    // Listen for cart changes across the application
    document.addEventListener('matcha:cart-updated', () => {
      this.syncCartBadge();
    });
    window.addEventListener('storage', (e) => {
      if (!e.key || e.key === 'matcha_cart') {
        this.syncCartBadge();
      }
    });

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
      // Default fallback template: custom-drink (Craft from Scratch, Rp 0)
      this.loadTemplate('custom-drink');
    }
  }

  /**
   * 2. Populate form fields from template preset
   */
  loadTemplate(drinkKey) {
    const tpl = this.templates[drinkKey] || this.templates['custom-drink'];
    this.currentDrinkId = drinkKey;
    this.isScratch = !!tpl.isScratch;
    this.currentBasePrice = this.isScratch ? 0 : (tpl.basePrice || 22000);

    // Update Headings & Meta
    if (this.titleEl) this.titleEl.textContent = tpl.name;
    if (this.pantoneCodeEl) this.pantoneCodeEl.textContent = tpl.pantone;
    if (this.badgeEl) {
      this.badgeEl.textContent = this.isScratch ? 'Custom Craft • Dari Gelas Kosong' : 'Template Menu • Bisa Diedit';
    }

    // Uncheck ALL radios and checkboxes first
    this.form.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    this.form.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);

    // Keep clean milk pill descriptions:
    // In Full Custom Craft, Fresh Milk is +Rp 2.000 (tidak termasuk otomatis) and Oat Milk is +Rp 4.000
    const descFresh = this.form.querySelector('#desc-milk-fresh');
    const descOat = this.form.querySelector('#desc-milk-oat');
    const descNone = this.form.querySelector('#desc-milk-none');

    const isCustomOrScratch = (this.isScratch || this.currentDrinkId === 'custom-drink');
    if (isCustomOrScratch) {
      if (descFresh) descFresh.textContent = '+Rp 2.000';
      if (descOat) descOat.textContent = '+Rp 4.000';
      if (descNone) descNone.textContent = 'Rp 0';
    } else {
      if (descFresh) descFresh.textContent = 'Termasuk';
      if (descOat) descOat.textContent = '+Rp 2.000';
      if (descNone) descNone.textContent = 'Rp 0';
    }

    // If template has specific presets (e.g. Ice Matcha Latte), set them; if scratch, leave all empty!
    if (!this.isScratch) {
      if (tpl.base) {
        const baseRadio = this.form.querySelector(`input[name="custom_base"][value="${tpl.base}"]`);
        if (baseRadio) baseRadio.checked = true;
      }
      if (tpl.milk) {
        const milkRadio = this.form.querySelector(`input[name="custom_milk"][value="${tpl.milk}"]`);
        if (milkRadio) milkRadio.checked = true;
      }
      if (tpl.sugar) {
        const sugarRadio = this.form.querySelector(`input[name="custom_sugar"][value="${tpl.sugar}"]`);
        if (sugarRadio) sugarRadio.checked = true;
      }
      if (tpl.ice) {
        const iceRadio = this.form.querySelector(`input[name="custom_ice"][value="${tpl.ice}"]`);
        if (iceRadio) iceRadio.checked = true;
      }
      if (Array.isArray(tpl.toppings)) {
        tpl.toppings.forEach(val => {
          const chk = this.form.querySelector(`input[name="custom_toppings"][value="${val}"]`);
          if (chk) chk.checked = true;
        });
      }
    }

    this.updateRecipeAndVisuals();
  }

  /**
   * 3. Listen for form input changes (live real-time update)
   */
  bindFormChangeListeners() {
    if (!this.form) return;

    // Bulletproof click handler for mobile and touch devices
    this.form.querySelectorAll('.custom-pill').forEach(pill => {
      pill.addEventListener('click', (e) => {
        const input = pill.querySelector('input');
        if (!input) return;
        if (input.type === 'radio') {
          if (!input.checked) {
            input.checked = true;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        } else if (input.type === 'checkbox') {
          if (e.target !== input) {
            input.checked = !input.checked;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      });
    });

    this.form.addEventListener('change', (e) => {
      const hasBase = !!this.form.querySelector('input[name="custom_base"]:checked');
      if (hasBase) {
        this.isScratch = false;
      }

      // In full custom craft, all ingredients are explicitly chosen by customer
      // without auto-forcing milk addition
      this.updateRecipeAndVisuals();
    });
  }

  /**
   * 4. Dynamic Math & Live Visuals
   */
  updateRecipeAndVisuals() {
    // Read Current Selections
    const baseVal = this.form.querySelector('input[name="custom_base"]:checked')?.value || null;
    const milkVal = this.form.querySelector('input[name="custom_milk"]:checked')?.value || null;
    const sugarVal = this.form.querySelector('input[name="custom_sugar"]:checked')?.value || null;
    const iceVal = this.form.querySelector('input[name="custom_ice"]:checked')?.value || null;
    const selectedToppings = Array.from(this.form.querySelectorAll('input[name="custom_toppings"]:checked')).map(c => c.value);

    // Calculate Price:
    // Base is pegged to lowest menu item: Matcharicano (Rp 22.000)
    const toppingCostPerItem = 3000; // Fixed +Rp 3.000 per topping
    const extraToppings = selectedToppings.length * toppingCostPerItem;

    const isCustomOrScratch = (this.currentDrinkId === 'custom-drink' || this.isScratch);

    let finalTotal = 0;

    if (isCustomOrScratch) {
      if (!baseVal && !milkVal && selectedToppings.length === 0) {
        this.currentBasePrice = 0;
        finalTotal = 0;
      } else {
        let baseCost = baseVal ? 22000 : 0;
        this.currentBasePrice = baseCost;
        let milkCost = 0;
        if (milkVal === 'fresh') milkCost = 2000;
        else if (milkVal === 'oat' || milkVal === 'almond') milkCost = 4000;
        else milkCost = 0; // none or null
        finalTotal = baseCost + milkCost + extraToppings;
      }
    } else if (this.currentDrinkId === 'ice-matcharicano') {
      this.currentBasePrice = 22000;
      let milkCost = 0;
      if (milkVal === 'fresh') milkCost = 2000;
      else if (milkVal === 'oat' || milkVal === 'almond') milkCost = 4000;
      else milkCost = 0;
      finalTotal = this.currentBasePrice + milkCost + extraToppings;
    } else if (this.currentDrinkId === 'ice-matcha-latte' || this.currentDrinkId === 'hot-traditional' || this.currentDrinkId === 'ice-chocolate') {
      this.currentBasePrice = 25000;
      let milkCost = 0;
      if (milkVal === 'none') milkCost = -3000;
      else if (milkVal === 'oat' || milkVal === 'almond') milkCost = 2000;
      finalTotal = this.currentBasePrice + milkCost + extraToppings;
    } else if (this.currentDrinkId === 'ice-matcha-chocolate' || this.currentDrinkId === 'ice-matcha-vanilla-foam') {
      this.currentBasePrice = 28000;
      let milkCost = 0;
      if (milkVal === 'none') milkCost = -3000;
      else if (milkVal === 'oat' || milkVal === 'almond') milkCost = 2000;
      finalTotal = this.currentBasePrice + milkCost + extraToppings;
    } else {
      let milkCost = (milkVal === 'oat' || milkVal === 'almond') ? 2000 : 0;
      finalTotal = (this.currentBasePrice || 22000) + milkCost + extraToppings;
    }

    // Update UI Price Displays
    if (this.totalPriceEl) this.totalPriceEl.textContent = this.formatIDR(finalTotal);
    if (this.btnPriceDisplay) this.btnPriceDisplay.textContent = this.formatIDR(finalTotal);

    // Breakdown Text
    let breakdownText = '';
    if (finalTotal === 0 || (!baseVal && !milkVal && selectedToppings.length === 0)) {
      breakdownText = `Craft Lab • Belum ada pilihan (Rp 0)`;
    } else if (!baseVal) {
      breakdownText = `Bahan Tambahan: ${this.formatIDR(finalTotal)} (Pilih Base untuk melengkapi)`;
    } else {
      let baseLabel = baseVal === 'chocolate' ? 'Base Cokelat' : 'Base Matcha';
      if (this.currentDrinkId === 'ice-matcha-vanilla-foam') {
        baseLabel = 'Ice Matcha Vanilla Cloud Foam (Termasuk Foam)';
      } else if (this.currentDrinkId === 'ice-matcha-chocolate') {
        baseLabel = 'Ice Matcha Chocolate (Termasuk Cokelat)';
      }
      breakdownText = `${baseLabel} ${this.formatIDR(this.currentBasePrice)}`;
      if (isCustomOrScratch || this.currentDrinkId === 'ice-matcharicano') {
        if (milkVal === 'fresh') breakdownText += ` + Fresh Milk (+Rp 2.000)`;
        else if (milkVal === 'oat') breakdownText += ` + Susu Oat (+Rp 4.000)`;
      } else {
        if (milkVal === 'fresh') breakdownText += ` + Fresh Milk (Termasuk)`;
        else if (milkVal === 'oat') breakdownText += ` + Susu Oat (+Rp 2.000)`;
      }
      if (selectedToppings.length > 0) {
        breakdownText += ` + ${selectedToppings.length} Topping Tambahan (${this.formatIDR(extraToppings)})`;
      } else {
        breakdownText += ` (Tanpa Topping Tambahan)`;
      }
    }
    if (this.breakdownSubEl) this.breakdownSubEl.textContent = breakdownText;

    // =========================================================================
    // UPDATE INTERACTIVE HAND-DRAWN SKETCH CRAFT TUMBLER IN REAL-TIME
    // =========================================================================
    const isCupCompletelyBlank = this.isScratch || !baseVal;

    if (this.emptyState) {
      this.emptyState.classList.toggle('visible', isCupCompletelyBlank);
    }

    if (isCupCompletelyBlank) {
      // Cup is completely blank / empty glass sketch
      if (this.sketchMilkLayer) this.sketchMilkLayer.style.display = 'none';
      if (this.sketchBaseLayer) this.sketchBaseLayer.style.display = 'none';
      if (this.sketchMilkRect) {
        this.sketchMilkRect.setAttribute('height', '0');
        this.sketchMilkRect.style.opacity = '0';
      }
      if (this.sketchBaseRect) {
        this.sketchBaseRect.setAttribute('height', '0');
        this.sketchBaseRect.style.opacity = '0';
      }
      if (this.sketchBaseMeniscus) this.sketchBaseMeniscus.style.opacity = '0';
      if (this.sketchSwirlWave) this.sketchSwirlWave.style.opacity = '0';
      if (this.sketchOatDoodles) this.sketchOatDoodles.style.opacity = '0';
      if (this.sketchWaterRipples) this.sketchWaterRipples.style.opacity = '0';
      if (this.sketchSteam) this.sketchSteam.style.opacity = '0';
      if (this.sketchIceCubes) {
        this.sketchIceCubes.forEach(c => c.style.opacity = '0');
      }
      if (this.sketchFoam) this.sketchFoam.style.opacity = '0';
      if (this.sketchChoco) this.sketchChoco.style.opacity = '0';

      if (this.tagMilk) this.tagMilk.classList.remove('visible');
      if (this.tagMatcha) this.tagMatcha.classList.remove('visible');
      if (this.tagFoam) this.tagFoam.classList.remove('visible');
      if (this.tagChoco) this.tagChoco.classList.remove('visible');
      return;
    }

    if (this.sketchMilkLayer) this.sketchMilkLayer.style.display = '';
    if (this.sketchBaseLayer) this.sketchBaseLayer.style.display = '';

    // --- 1. BASE FLAVOR (Matcha vs Belgian Chocolate) ---
    const isChocolate = (baseVal === 'chocolate');
    if (this.sketchBaseRect) {
      this.sketchBaseRect.style.opacity = '1';
      this.sketchBaseRect.setAttribute('fill', isChocolate ? 'url(#sketchChocGrad)' : 'url(#sketchMatchaGrad)');
    }
    if (this.sketchBaseMeniscus) {
      this.sketchBaseMeniscus.style.opacity = '1';
      this.sketchBaseMeniscus.setAttribute('fill', isChocolate ? '#703C1C' : '#7DB045');
    }
    if (this.sketchSwirlWave) {
      this.sketchSwirlWave.setAttribute('fill', isChocolate ? '#341808' : '#486D24');
    }

    // Base Tag Callout
    if (this.tagMatcha) {
      this.tagMatcha.classList.add('visible');
      const tagText = this.tagMatcha.querySelector('.tag-text');
      if (tagText) {
        tagText.textContent = isChocolate ? '🍫 Base Cokelat' : '🍵 Base Matcha';
      }
    }

    // --- 2. MILK & LIQUID PROPORTIONS ---
    if (!milkVal || milkVal === 'none') {
      // Pure Base (Matcha Water or Pure Chocolate), full cup height
      if (this.sketchBaseRect) {
        this.sketchBaseRect.setAttribute('y', '65');
        this.sketchBaseRect.setAttribute('height', '330');
      }
      if (this.sketchMilkRect) {
        this.sketchMilkRect.setAttribute('height', '0');
        this.sketchMilkRect.style.opacity = '0';
      }
      if (this.sketchSwirlWave) this.sketchSwirlWave.style.opacity = '0';
      if (this.sketchOatDoodles) this.sketchOatDoodles.style.opacity = '0';
      if (this.sketchWaterRipples) this.sketchWaterRipples.style.opacity = '0';

      if (this.tagMilk) this.tagMilk.classList.remove('visible');
    } else {
      // Layered: Base on top, Milk at bottom
      if (this.sketchBaseRect) {
        this.sketchBaseRect.setAttribute('y', '65');
        this.sketchBaseRect.setAttribute('height', '155');
      }
      if (this.sketchMilkRect) {
        this.sketchMilkRect.setAttribute('y', '210');
        this.sketchMilkRect.setAttribute('height', '190');
        this.sketchMilkRect.style.opacity = '1';
        this.sketchMilkRect.setAttribute('fill', milkVal === 'oat' ? 'url(#sketchOatMilkGrad)' : 'url(#sketchFreshMilkGrad)');
      }
      if (this.sketchSwirlWave) this.sketchSwirlWave.style.opacity = '0.65';
      if (this.sketchOatDoodles) this.sketchOatDoodles.style.opacity = (milkVal === 'oat') ? '1' : '0';
      if (this.sketchWaterRipples) this.sketchWaterRipples.style.opacity = '0';

      if (this.tagMilk) {
        this.tagMilk.classList.add('visible');
        if (this.tagMilkText) {
          if (isCustomOrScratch || this.currentDrinkId === 'ice-matcharicano') {
            this.tagMilkText.textContent = milkVal === 'oat' ? '🌾 Oatly Oat Milk Layer (+Rp 4.000)' : '🥛 Fresh Milk Layer (+Rp 2.000)';
          } else {
            this.tagMilkText.textContent = milkVal === 'oat' ? '🌾 Oatly Oat Milk Layer (+Rp 2.000)' : '🥛 Fresh Milk Layer';
          }
        }
      }
    }

    // --- 3. ICE & TEMPERATURE LEVEL ---
    if (!iceVal) {
      if (this.sketchSteam) this.sketchSteam.style.opacity = '0';
      if (this.sketchIceCubes) {
        this.sketchIceCubes.forEach(cube => cube.style.opacity = '0');
      }
    } else if (iceVal === 'hot') {
      if (this.sketchSteam) this.sketchSteam.style.opacity = '1';
      if (this.sketchIceCubes) {
        this.sketchIceCubes.forEach(cube => cube.style.opacity = '0');
      }
    } else {
      if (this.sketchSteam) this.sketchSteam.style.opacity = '0';
      const cube1 = this.root.querySelector('#ice-cube-1');
      const cube2 = this.root.querySelector('#ice-cube-2');
      const cube3 = this.root.querySelector('#ice-cube-3');
      const cube4 = this.root.querySelector('#ice-cube-4');
      const cube5 = this.root.querySelector('#ice-cube-5');

      if (iceVal === 'less') {
        if (cube1) cube1.style.opacity = '1';
        if (cube2) cube2.style.opacity = '1';
        if (cube3) cube3.style.opacity = '0';
        if (cube4) cube4.style.opacity = '0';
        if (cube5) cube5.style.opacity = '0';
      } else if (iceVal === 'extra') {
        if (cube1) cube1.style.opacity = '1';
        if (cube2) cube2.style.opacity = '1';
        if (cube3) cube3.style.opacity = '1';
        if (cube4) cube4.style.opacity = '1';
        if (cube5) cube5.style.opacity = '1';
      } else {
        // Normal ice (default: 4 cubes)
        if (cube1) cube1.style.opacity = '1';
        if (cube2) cube2.style.opacity = '1';
        if (cube3) cube3.style.opacity = '1';
        if (cube4) cube4.style.opacity = '1';
        if (cube5) cube5.style.opacity = '0';
      }
    }

    // --- 4. TOPPINGS (Vanilla Cloud Foam & Chocolate Bottom Layer) ---
    const isVanillaPreset = (this.currentDrinkId === 'ice-matcha-vanilla-foam' && !isCupCompletelyBlank);
    const isChocoPreset = (this.currentDrinkId === 'ice-matcha-chocolate' && !isCupCompletelyBlank);

    const hasFoam = selectedToppings.includes('vanilla_foam') || isVanillaPreset;
    if (this.sketchFoam) {
      this.sketchFoam.style.opacity = hasFoam ? '1' : '0';
    }
    if (this.tagFoam) {
      this.tagFoam.classList.toggle('visible', hasFoam);
      const tagText = this.tagFoam.querySelector('.tag-text');
      if (tagText) {
        if (selectedToppings.includes('vanilla_foam')) {
          tagText.textContent = isVanillaPreset ? '☁️ Extra Vanilla Cloud Foam (+Rp 3.000)' : '☁️ Vanilla Cloud Foam (+Rp 3.000)';
        } else {
          tagText.textContent = '☁️ Vanilla Cloud Foam (Sudah Termasuk)';
        }
      }
    }

    const hasChoco = selectedToppings.includes('chocolate') || isChocoPreset;
    if (this.sketchChoco) {
      this.sketchChoco.style.opacity = hasChoco ? '1' : '0';
    }
    if (this.tagChoco) {
      this.tagChoco.classList.toggle('visible', hasChoco);
      const tagText = this.tagChoco.querySelector('.tag-text');
      if (tagText) {
        if (selectedToppings.includes('chocolate')) {
          tagText.textContent = isChocoPreset ? '🍫 Extra Cokelat Bawah (+Rp 3.000)' : '🍫 Lapisan Cokelat Bawah (+Rp 3.000)';
        } else {
          tagText.textContent = '🍫 Lapisan Cokelat Bawah (Sudah Termasuk)';
        }
      }
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

    // Reset to Empty Tumbler ("Mulai dari Gelas Kosong")
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.isScratch = true;
        this.currentDrinkId = 'custom-drink';
        this.currentBasePrice = 0;

        if (this.titleEl) this.titleEl.textContent = 'CUSTOM MATCHA CRAFT';
        if (this.pantoneCodeEl) this.pantoneCodeEl.textContent = 'CRAFT LAB • DARI AWAL';
        if (this.badgeEl) this.badgeEl.textContent = 'Custom Craft • Dari Gelas Kosong';

        // Uncheck all options so user starts fresh from scratch
        this.form.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        this.form.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);

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

    // Floating Cart Button Trigger (Opens Cart Modal matching Menu Page)
    if (this.cartBtn) {
      this.cartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.cartManager && typeof window.cartManager.open === 'function') {
          window.cartManager.open();
        } else {
          const cartModal = document.querySelector('#cart-modal-backdrop');
          if (cartModal) {
            cartModal.classList.add('open');
            cartModal.classList.add('active');
          }
        }
      });
    }
  }

  /**
   * 6. Add Custom Recipe to Cart
   */
  handleAddToCart() {
    const baseVal = this.form.querySelector('input[name="custom_base"]:checked')?.value;
    if (!baseVal) {
      this.showToast('Silakan pilih Base (Matcha atau Cokelat) terlebih dahulu!');
      return;
    }
    const milkVal = this.form.querySelector('input[name="custom_milk"]:checked')?.value || 'none';
    const sugarVal = this.form.querySelector('input[name="custom_sugar"]:checked')?.value || '70';
    const iceVal = this.form.querySelector('input[name="custom_ice"]:checked')?.value || 'normal';
    const selectedToppings = Array.from(this.form.querySelectorAll('input[name="custom_toppings"]:checked')).map(c => c.value);

    const isCustomOrScratch = (this.currentDrinkId === 'custom-drink' || this.isScratch);

    // Readable Names
    const baseNames = { matcha: 'Base Matcha', chocolate: 'Base Cokelat' };
    const milkNames = {
      fresh: (isCustomOrScratch || this.currentDrinkId === 'ice-matcharicano') ? 'Fresh Milk (+2k)' : 'Fresh Milk',
      oat: (isCustomOrScratch || this.currentDrinkId === 'ice-matcharicano') ? 'Oat Milk (+4k)' : 'Oat Milk (+2k)',
      none: 'Tanpa Susu'
    };
    const iceNames = { hot: 'Hot (No Ice)', less: 'Less Ice', normal: 'Normal Ice', extra: 'Extra Ice' };
    const toppingNames = {
      vanilla_foam: 'Vanilla Cloud Foam (+3k)',
      chocolate: 'Lapisan Cokelat Bawah (+3k)'
    };

    const toppingsSummary = selectedToppings.map(t => toppingNames[t] || t).join(', ');

    let finalPriceIDR = 0;
    const toppingCostPerItem = 3000;
    const extraToppings = selectedToppings.length * toppingCostPerItem;

    if (isCustomOrScratch || this.currentDrinkId === 'ice-matcharicano') {
      let milkCost = 0;
      if (milkVal === 'fresh') milkCost = 2000;
      else if (milkVal === 'oat' || milkVal === 'almond') milkCost = 4000;
      finalPriceIDR = (baseVal ? 22000 : 0) + milkCost + extraToppings;
    } else if (this.currentDrinkId === 'ice-matcha-latte' || this.currentDrinkId === 'hot-traditional' || this.currentDrinkId === 'ice-chocolate') {
      let milkCost = 0;
      if (milkVal === 'none') milkCost = -3000;
      else if (milkVal === 'oat' || milkVal === 'almond') milkCost = 2000;
      finalPriceIDR = 25000 + milkCost + extraToppings;
    } else if (this.currentDrinkId === 'ice-matcha-chocolate' || this.currentDrinkId === 'ice-matcha-vanilla-foam') {
      let milkCost = 0;
      if (milkVal === 'none') milkCost = -3000;
      else if (milkVal === 'oat' || milkVal === 'almond') milkCost = 2000;
      finalPriceIDR = 28000 + milkCost + extraToppings;
    } else {
      let milkCost = (milkVal === 'oat' || milkVal === 'almond') ? 2000 : 0;
      finalPriceIDR = (this.currentBasePrice || 22000) + milkCost + extraToppings;
    }

    if (finalPriceIDR <= 0) {
      this.showToast('Silakan pilih bahan minuman terlebih dahulu!');
      return;
    }
    const finalPrice = Math.round(finalPriceIDR);

    const itemTitle = this.titleEl?.textContent || 'Custom Drink';
    const specDetails = `${baseNames[baseVal] || baseVal}, ${milkNames[milkVal] || milkVal}, ${sugarVal}% Gula, ${iceNames[iceVal] || iceVal}${toppingsSummary ? ' • ' + toppingsSummary : ''}`;

    const orderItem = {
      name: itemTitle,
      spec: specDetails,
      price: finalPrice,
      priceIDR: finalPrice,
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
    this.showToast('✓ Masuk keranjang!');

    // Immediate button confirmation feedback
    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (_) {}
    }

    const mobileTextEl = this.submitBtn.querySelector('.btn-text-mobile');
    const desktopTextEl = this.submitBtn.querySelector('.btn-text-desktop');
    const originalMobileText = mobileTextEl ? mobileTextEl.textContent : '+ Keranjang';
    const originalDesktopHtml = desktopTextEl ? desktopTextEl.innerHTML : '';

    if (mobileTextEl) mobileTextEl.textContent = '✓ Ditambahkan!';
    if (desktopTextEl) desktopTextEl.textContent = '✓ Berhasil Masuk Keranjang!';
    this.submitBtn.style.backgroundColor = '#4d7c0f';
    this.submitBtn.style.color = '#ffffff';

    setTimeout(() => {
      if (mobileTextEl) mobileTextEl.textContent = originalMobileText;
      if (desktopTextEl) desktopTextEl.innerHTML = originalDesktopHtml;
      this.submitBtn.style.backgroundColor = '';
      this.submitBtn.style.color = '';
    }, 1800);
  }

  /**
   * 7. Sync Cart Count
   */
  syncCartBadge() {
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
    const badges = document.querySelectorAll('#custom-cart-badge, .custom-cart-count-badge, .pantone-cart-badge, .cart-fab-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'flex' : 'none';
    });
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
  const initCustomize = () => {
    if (!window.customizeManager && document.querySelector('#customize-root')) {
      window.customizeManager = new CustomizeManager();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCustomize);
  } else {
    initCustomize();
  }
}
