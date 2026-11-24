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
    this.sketchBrownSugar = this.root.querySelector('#sketch-topping-brownsugar');
    this.sketchIceLayer = this.root.querySelector('#sketch-ice-layer');
    this.iceGroupLess = this.root.querySelector('#ice-group-less');
    this.iceGroupNormal = this.root.querySelector('#ice-group-normal');
    this.iceGroupExtra = this.root.querySelector('#ice-group-extra');
    this.sketchExtraFrost = this.root.querySelector('#sketch-extra-frost');
    this.sketchSteam = this.root.querySelector('#sketch-hot-steam');

    // Live Dynamic Tag Callouts
    this.tagFoam = this.root.querySelector('#tag-foam-label');
    this.tagChoco = this.root.querySelector('#tag-choco-label');
    this.tagBrownSugar = this.root.querySelector('#tag-brownsugar-label');
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
        toppings: ['chocolate']
      },
      'ice-matcha-vanilla-foam': {
        name: 'ICE MATCHA VANILLA CLOUD FOAM',
        pantone: 'SPECIMEN 00997 C',
        basePrice: 28000,
        base: 'matcha',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: ['vanilla_foam']
      },
      'ice-matcha-brown-sugar': {
        name: 'ICE MATCHA BROWN SUGAR',
        pantone: 'SPECIMEN 731 C',
        basePrice: 28000,
        base: 'matcha',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: ['brown_sugar']
      },
      'matcha-brownsugar': {
        name: 'ICE MATCHA BROWN SUGAR',
        pantone: 'SPECIMEN 731 C',
        basePrice: 28000,
        base: 'matcha',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: ['brown_sugar']
      },
      'matcha-brown-sugar': {
        name: 'ICE MATCHA BROWN SUGAR',
        pantone: 'SPECIMEN 731 C',
        basePrice: 28000,
        base: 'matcha',
        milk: 'fresh',
        sugar: '70',
        ice: 'normal',
        toppings: ['brown_sugar']
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
      // Blank Canvas Custom (Default milk: Tanpa Susu)
      'custom-drink': {
        name: 'CUSTOM DRINK CRAFT',
        pantone: 'CRAFT LAB • DARI AWAL',
        basePrice: 0,
        base: null,
        milk: 'none',
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

    this.bindFormChangeListeners();
    this.bindActions();
    this.detectInitialPreset();
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
    this.baseTemplateName = tpl.name;
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

    // Uniform milk pill descriptions across ALL menus:
    // Fresh Milk = +Rp 3.000, Oat Milk = +Rp 5.000, Tanpa Susu = Rp 0
    const descFresh = this.form.querySelector('#desc-milk-fresh');
    const descOat = this.form.querySelector('#desc-milk-oat');
    const descNone = this.form.querySelector('#desc-milk-none');

    if (descFresh) descFresh.textContent = '+Rp 3.000';
    if (descOat) descOat.textContent = '+Rp 5.000';
    if (descNone) descNone.textContent = 'Rp 0';

    // If template has specific presets (e.g. Ice Matcha Latte), set them.
    // For custom-drink (scratch), default milk base is "Tanpa Susu" (none).
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
    } else {
      const noneMilkRadio = this.form.querySelector('input[name="custom_milk"][value="none"]');
      if (noneMilkRadio) noneMilkRadio.checked = true;
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

    // Unified Pricing Formula across ALL menus:
    // - Base (Matcha / Cokelat): Rp 22.000
    // - Fresh Milk: +Rp 3.000 | Oat Milk: +Rp 5.000 | Tanpa Susu: Rp 0
    // - Signature built-in layer (Ice Matcha Chocolate / Vanilla Cloud Foam): +Rp 3.000
    // - Additional Toppings: +Rp 3.000 / topping
    const pricing = this.calculatePriceBreakdown(baseVal, milkVal, selectedToppings);
    this.currentBasePrice = pricing.baseCost;
    const finalTotal = pricing.total;

    // Update Dynamic Drink Title (Hot vs Ice, Chocolate vs Matcha base)
    if (this.titleEl) {
      this.titleEl.textContent = this.getDynamicDrinkTitle(baseVal, iceVal, selectedToppings);
    }

    // Update UI Price Displays
    if (this.totalPriceEl) this.totalPriceEl.textContent = this.formatIDR(finalTotal);
    if (this.btnPriceDisplay) this.btnPriceDisplay.textContent = this.formatIDR(finalTotal);

    // Breakdown Text
    let breakdownText = '';
    if (finalTotal === 0 || (!baseVal && pricing.milkCost === 0 && selectedToppings.length === 0)) {
      breakdownText = `Craft Lab • Belum ada pilihan (Rp 0)`;
    } else if (!baseVal) {
      breakdownText = `Bahan Tambahan: ${this.formatIDR(finalTotal)} (Pilih Base untuk melengkapi)`;
    } else {
      let baseLabel = baseVal === 'chocolate' ? 'Base Cokelat' : 'Base Matcha';
      breakdownText = `${baseLabel} ${this.formatIDR(pricing.baseCost)}`;
      if (milkVal === 'fresh') breakdownText += ` + Fresh Milk (+Rp 3.000)`;
      else if (milkVal === 'oat' || milkVal === 'almond') breakdownText += ` + Oat Milk (+Rp 5.000)`;
      else breakdownText += ` + Tanpa Susu (Rp 0)`;

      if (selectedToppings.length > 0) {
        breakdownText += ` + ${selectedToppings.length} Topping (+${this.formatIDR(pricing.toppingsCost)})`;
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
      if (this.sketchExtraFrost) this.sketchExtraFrost.style.opacity = '0';
      if (this.iceGroupLess) this.iceGroupLess.style.opacity = '0';
      if (this.iceGroupNormal) this.iceGroupNormal.style.opacity = '0';
      if (this.iceGroupExtra) this.iceGroupExtra.style.opacity = '0';
      if (this.sketchFoam) this.sketchFoam.style.opacity = '0';
      if (this.sketchChoco) this.sketchChoco.style.opacity = '0';
      if (this.sketchBrownSugar) this.sketchBrownSugar.style.opacity = '0';

      if (this.tagMilk) this.tagMilk.classList.remove('visible');
      if (this.tagMatcha) this.tagMatcha.classList.remove('visible');
      if (this.tagFoam) this.tagFoam.classList.remove('visible');
      if (this.tagChoco) this.tagChoco.classList.remove('visible');
      if (this.tagBrownSugar) this.tagBrownSugar.classList.remove('visible');
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
          this.tagMilkText.textContent = milkVal === 'oat'
            ? '🌾 Oatly Oat Milk Layer (+Rp 5.000)'
            : '🥛 Fresh Milk Layer (+Rp 3.000)';
        }
      }
    }

    // --- 3. ICE & TEMPERATURE LEVEL ---
    if (!iceVal) {
      if (this.sketchSteam) this.sketchSteam.style.opacity = '0';
      if (this.sketchExtraFrost) this.sketchExtraFrost.style.opacity = '0';
      if (this.iceGroupLess) this.iceGroupLess.style.opacity = '0';
      if (this.iceGroupNormal) this.iceGroupNormal.style.opacity = '0';
      if (this.iceGroupExtra) this.iceGroupExtra.style.opacity = '0';
    } else if (iceVal === 'hot') {
      if (this.sketchSteam) this.sketchSteam.style.opacity = '1';
      if (this.sketchExtraFrost) this.sketchExtraFrost.style.opacity = '0';
      if (this.iceGroupLess) this.iceGroupLess.style.opacity = '0';
      if (this.iceGroupNormal) this.iceGroupNormal.style.opacity = '0';
      if (this.iceGroupExtra) this.iceGroupExtra.style.opacity = '0';
    } else {
      if (this.sketchSteam) this.sketchSteam.style.opacity = '0';

      if (iceVal === 'less') {
        // Less Ice: cluster of 5 floating cubes naturally clustered near surface
        if (this.iceGroupLess) this.iceGroupLess.style.opacity = '1';
        if (this.iceGroupNormal) this.iceGroupNormal.style.opacity = '0';
        if (this.iceGroupExtra) this.iceGroupExtra.style.opacity = '0';
        if (this.sketchExtraFrost) this.sketchExtraFrost.style.opacity = '0';
      } else if (iceVal === 'extra') {
        // Extra Ice: 16 dense packed cubes mounded to brim + glass frost condensation!
        if (this.iceGroupLess) this.iceGroupLess.style.opacity = '1';
        if (this.iceGroupNormal) this.iceGroupNormal.style.opacity = '1';
        if (this.iceGroupExtra) this.iceGroupExtra.style.opacity = '1';
        if (this.sketchExtraFrost) this.sketchExtraFrost.style.opacity = '1';
      } else {
        // Normal Ice (default): 10 interlocking cubes forming a full refreshing 65% column
        if (this.iceGroupLess) this.iceGroupLess.style.opacity = '1';
        if (this.iceGroupNormal) this.iceGroupNormal.style.opacity = '1';
        if (this.iceGroupExtra) this.iceGroupExtra.style.opacity = '0';
        if (this.sketchExtraFrost) this.sketchExtraFrost.style.opacity = '0';
      }
    }

    // --- 4. TOPPINGS (Vanilla Cloud Foam & Chocolate Bottom Layer) ---
    const hasFoam = selectedToppings.includes('vanilla_foam');
    if (this.sketchFoam) {
      this.sketchFoam.style.opacity = hasFoam ? '1' : '0';
    }
    if (this.tagFoam) {
      this.tagFoam.classList.toggle('visible', hasFoam);
      const tagText = this.tagFoam.querySelector('.tag-text');
      if (tagText) {
        tagText.textContent = '☁️ Vanilla Cloud Foam';
      }
    }

    const hasChoco = selectedToppings.includes('chocolate');
    if (this.sketchChoco) {
      this.sketchChoco.style.opacity = hasChoco ? '1' : '0';
    }
    if (this.tagChoco) {
      this.tagChoco.classList.toggle('visible', hasChoco);
      const tagText = this.tagChoco.querySelector('.tag-text');
      if (tagText) {
        tagText.textContent = '🍫 Lapisan Cokelat Bawah';
      }
    }

    // --- 5. TOPPING: BROWN SUGAR TIGER DRIPS ---
    const hasBrownSugar = selectedToppings.includes('brown_sugar');
    if (this.sketchBrownSugar) {
      this.sketchBrownSugar.style.opacity = hasBrownSugar ? '1' : '0';
    }
    if (this.tagBrownSugar) {
      this.tagBrownSugar.classList.toggle('visible', hasBrownSugar);
      const tagText = this.tagBrownSugar.querySelector('.tag-text');
      if (tagText) {
        tagText.textContent = '🍯 Brown Sugar Syrup';
      }
    }
  }

  /**
   * Helper: Compute dynamic drink title based on selected base (Matcha/Chocolate), temperature (Hot/Ice), & toppings
   */
  getDynamicDrinkTitle(baseVal, iceVal, selectedToppings = []) {
    if (this.isScratch || !baseVal) {
      return this.baseTemplateName || 'CUSTOM DRINK CRAFT';
    }

    const hasChocoTopping = selectedToppings.includes('chocolate');
    let name = this.baseTemplateName || 'CUSTOM DRINK CRAFT';

    if (this.currentDrinkId === 'custom-drink') {
      const tempPrefix = iceVal ? (iceVal === 'hot' ? 'HOT' : 'ICE') : 'CUSTOM';
      const baseLabel = baseVal === 'chocolate'
        ? (hasChocoTopping ? 'DOUBLE CHOCOLATE' : 'CHOCOLATE')
        : 'MATCHA';
      return `${tempPrefix} ${baseLabel} CRAFT`;
    }

    // 1. Temperature prefix: Hot vs Ice
    if (iceVal === 'hot') {
      if (/^(ICED?|HOT)\s+/i.test(name)) {
        name = name.replace(/^(ICED?|HOT)\s+/i, 'HOT ');
      } else {
        name = `HOT ${name}`;
      }
    } else if (iceVal) {
      if (/^HOT\s+/i.test(name)) {
        name = name.replace(/^HOT\s+/i, 'ICE ');
      }
    }

    // 2. Base flavor: Chocolate vs Matcha
    if (baseVal === 'chocolate') {
      if (/MATCHARICANO/i.test(name)) {
        name = name.replace(/MATCHARICANO/i, 'CHOCOLATE');
      } else if (/MATCHA\s+CHOCOLATE/i.test(name)) {
        name = name.replace(/MATCHA\s+CHOCOLATE/i, 'DOUBLE CHOCOLATE');
      } else {
        name = name.replace(/MATCHA/i, 'CHOCOLATE');
      }

      if (hasChocoTopping && !/DOUBLE\s+CHOCOLATE/i.test(name)) {
        name = name.replace(/CHOCOLATE/i, 'DOUBLE CHOCOLATE');
      } else if (!hasChocoTopping && /DOUBLE\s+CHOCOLATE/i.test(name)) {
        name = name.replace(/DOUBLE\s+CHOCOLATE/i, 'CHOCOLATE');
      }
    } else if (baseVal === 'matcha') {
      if (this.currentDrinkId === 'ice-chocolate') {
        name = name.replace(/CHOCOLATE/i, 'MATCHA');
      }
    }

    return name;
  }

  /**
   * Helper currency formatter
   */
  calculatePriceBreakdown(baseVal, milkVal, selectedToppings = []) {
    const baseCost = baseVal ? 22000 : 0;
    let milkCost = 0;
    if (milkVal === 'fresh') milkCost = 3000;
    else if (milkVal === 'oat' || milkVal === 'almond') milkCost = 5000;

    const toppingsCost = selectedToppings.length * 3000;
    const total = baseCost + milkCost + toppingsCost;

    return { baseCost, milkCost, toppingsCost, total };
  }

  formatIDR(num) {
    return `Rp ${(num || 0).toLocaleString('id-ID')}`;
  }

  /**
   * 5. Button Actions: Back, Reset, Add to Cart
   */
  bindActions() {
    // Back Button -> Always returns to the dedicated Menu List (pages/menu/menu.html?show=menu)
    if (this.backBtn) {
      this.backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        try {
          sessionStorage.setItem('matcha_kiosk_active', 'true');
        } catch {}
        // If embedded in SPA
        if (window.pageNavigator && typeof window.pageNavigator.goToPage === 'function') {
          window.pageNavigator.goToPage('menu', true);
        } else {
          // Always return to the dedicated Daftar Menu page (pages/menu/menu.html?show=menu)
          const isPages = window.location.pathname.includes('/pages/');
          const menuUrl = isPages ? '../menu/menu.html?show=menu' : 'pages/menu/menu.html?show=menu';
          window.location.href = menuUrl;
        }
      });
    }

    // Reset to Empty Tumbler ("Mulai dari Gelas Kosong")
    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.isScratch = true;
        this.currentDrinkId = 'custom-drink';
        this.baseTemplateName = 'CUSTOM DRINK CRAFT';
        this.currentBasePrice = 0;

        if (this.titleEl) this.titleEl.textContent = 'CUSTOM DRINK CRAFT';
        if (this.pantoneCodeEl) this.pantoneCodeEl.textContent = 'CRAFT LAB • DARI AWAL';
        if (this.badgeEl) this.badgeEl.textContent = 'Custom Craft • Dari Gelas Kosong';

        // Uncheck all options so user starts fresh from scratch, with Tanpa Susu as default milk
        this.form.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
        this.form.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
        const noneMilkRadio = this.form.querySelector('input[name="custom_milk"][value="none"]');
        if (noneMilkRadio) noneMilkRadio.checked = true;

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

    // Bind Mobile/Tablet Quantity Confirmation Pop-up Modal
    this.qtyModalBackdrop = document.querySelector('#custom-qty-modal-backdrop');
    this.qtyModalTitle = document.querySelector('#qty-modal-title');
    this.qtyModalSpec = document.querySelector('#qty-modal-spec');
    this.qtyModalValue = document.querySelector('#qty-modal-value');
    this.qtyModalSubtotal = document.querySelector('#qty-modal-subtotal');
    this.qtyModalMinus = document.querySelector('#qty-modal-minus');
    this.qtyModalPlus = document.querySelector('#qty-modal-plus');
    this.qtyModalClose = document.querySelector('#qty-modal-close-btn');
    this.qtyModalContinueBtn = document.querySelector('#qty-modal-continue-btn');
    this.qtyModalCheckoutBtn = document.querySelector('#qty-modal-checkout-btn');
    this.pendingOrderItem = null;
    this.pendingQty = 1;

    if (this.qtyModalMinus) {
      this.qtyModalMinus.addEventListener('click', () => {
        if (this.pendingQty > 1) {
          this.pendingQty--;
          this.updateQtyModalUI();
        }
      });
    }

    if (this.qtyModalPlus) {
      this.qtyModalPlus.addEventListener('click', () => {
        if (this.pendingQty < 99) {
          this.pendingQty++;
          this.updateQtyModalUI();
        }
      });
    }

    if (this.qtyModalClose) {
      this.qtyModalClose.addEventListener('click', () => this.closeQtyModal());
    }

    if (this.qtyModalBackdrop) {
      this.qtyModalBackdrop.addEventListener('click', (e) => {
        if (e.target === this.qtyModalBackdrop) this.closeQtyModal();
      });
    }

    if (this.qtyModalContinueBtn) {
      this.qtyModalContinueBtn.addEventListener('click', () => {
        if (this.pendingOrderItem) {
          this.commitOrderToCart(this.pendingOrderItem, this.pendingQty);
        }
        this.closeQtyModal();
        try {
          sessionStorage.setItem('matcha_kiosk_active', 'true');
        } catch {}
        if (window.pageNavigator && typeof window.pageNavigator.goToPage === 'function') {
          window.pageNavigator.goToPage('menu', true);
        } else {
          const isPages = window.location.pathname.includes('/pages/');
          const menuUrl = isPages ? '../menu/menu.html?show=menu' : 'pages/menu/menu.html?show=menu';
          window.location.href = menuUrl;
        }
      });
    }

    if (this.qtyModalCheckoutBtn) {
      this.qtyModalCheckoutBtn.addEventListener('click', () => {
        if (this.pendingOrderItem) {
          this.commitOrderToCart(this.pendingOrderItem, this.pendingQty);
        }
        this.closeQtyModal();
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

  openQtyModal(orderItem) {
    if (!this.qtyModalBackdrop) {
      this.commitOrderToCart(orderItem, 1);
      return;
    }
    this.pendingOrderItem = orderItem;
    this.pendingQty = 1;
    if (this.qtyModalTitle) this.qtyModalTitle.textContent = orderItem.name;
    if (this.qtyModalSpec) this.qtyModalSpec.textContent = orderItem.spec;
    this.updateQtyModalUI();
    this.qtyModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  closeQtyModal() {
    if (!this.qtyModalBackdrop) return;
    this.qtyModalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  updateQtyModalUI() {
    if (this.qtyModalValue) this.qtyModalValue.textContent = String(this.pendingQty);
    if (this.qtyModalSubtotal && this.pendingOrderItem) {
      this.qtyModalSubtotal.textContent = this.formatIDR(this.pendingOrderItem.priceIDR * this.pendingQty);
    }
  }

  commitOrderToCart(orderItem, qty = 1) {
    const itemToAdd = { ...orderItem, qty: Math.max(1, parseInt(qty, 10) || 1) };

    if (window.cartManager && typeof window.cartManager.addItem === 'function') {
      window.cartManager.addItem(itemToAdd);
    } else {
      try {
        const saved = JSON.parse(localStorage.getItem('matcha_cart') || '[]');
        saved.push(itemToAdd);
        localStorage.setItem('matcha_cart', JSON.stringify(saved));
        window.dispatchEvent(new Event('storage'));
        document.dispatchEvent(new CustomEvent('matcha:cart-updated'));
      } catch (e) {
        console.warn('Failed to save cart:', e);
      }
    }

    this.syncCartBadge();
    this.showToast(`✓ ${itemToAdd.qty}x masuk keranjang!`);

    if (navigator.vibrate) {
      try { navigator.vibrate(40); } catch (_) {}
    }

    if (this.submitBtn) {
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

    // Readable Names
    const baseNames = { matcha: 'Base Matcha', chocolate: 'Base Cokelat' };
    const milkNames = {
      fresh: 'Fresh Milk (+3k)',
      oat: 'Oat Milk (+5k)',
      none: 'Tanpa Susu'
    };
    const iceNames = { hot: 'Hot (No Ice)', less: 'Less Ice', normal: 'Normal Ice', extra: 'Extra Ice' };
    const toppingNames = {
      vanilla_foam: 'Vanilla Cloud Foam',
      chocolate: 'Lapisan Cokelat Bawah',
      brown_sugar: 'Brown Sugar Syrup'
    };

    const toppingsSummary = selectedToppings.map(t => toppingNames[t] || t).join(', ');
    const pricing = this.calculatePriceBreakdown(baseVal, milkVal, selectedToppings);
    const finalPriceIDR = pricing.total;

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

    // On Mobile & Tablet layouts (<= 860px), show Quantity Confirmation Pop-up Modal
    if (window.matchMedia('(max-width: 860px)').matches && this.qtyModalBackdrop) {
      this.openQtyModal(orderItem);
      return;
    }

    // Desktop layout: directly add to cart
    this.commitOrderToCart(orderItem, 1);
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
