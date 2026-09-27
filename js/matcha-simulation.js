/**
 * Interactive Matcha Crafting Simulation Engine
 * Handles live recipe tweaking, sensory meter updates, cup preview rendering,
 * Add to Cart integration, and Recipe Reset.
 */
export class MatchaSimulator {
    constructor(cartManager = null) {
        this.page = document.querySelector('#simulation-page');
        this.cartManager = cartManager;
        if (!this.page) return;

        // Visual Cup Elements
        this.foamLayer = document.querySelector('.cup-layer-foam');
        this.liquidLayer = document.querySelector('.cup-layer-liquid');
        this.baseLayer = document.querySelector('.cup-layer-base');

        // Meter Fill Bars
        this.umamiFill = document.querySelector('#meter-umami');
        this.sweetnessFill = document.querySelector('#meter-sweetness');
        this.antioxidantFill = document.querySelector('#meter-antioxidant');
        this.caffeineVal = document.querySelector('#val-caffeine');
        this.summaryText = document.querySelector('#sim-summary-text');

        // Buttons
        this.addCartBtn = document.querySelector('#sim-add-cart-btn');
        this.resetBtn = document.querySelector('#sim-reset-btn');

        // State (Default values)
        this.defaultState = {
            baseTea: 'uji',
            grams: 2.5,
            milk: 'oat'
        };
        this.state = { ...this.defaultState };

        this.init();
    }

    init() {
        this.bindPills();
        this.bindSlider();
        this.bindActionButtons();
        this.updateSimulationUI();

        // Listen for language changes
        document.addEventListener('matcha:lang-changed', () => {
            this.updateSimulationUI();
        });
    }

    bindPills() {
        // Base Tea Pills
        document.querySelectorAll('[data-sim-base]').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('[data-sim-base]').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.state.baseTea = pill.dataset.simBase;
                this.updateSimulationUI();
            });
        });

        // Milk / Foam Pills
        document.querySelectorAll('[data-sim-milk]').forEach(pill => {
            pill.addEventListener('click', () => {
                document.querySelectorAll('[data-sim-milk]').forEach(p => p.classList.remove('active'));
                pill.classList.add('active');
                this.state.milk = pill.dataset.simMilk;
                this.updateSimulationUI();
            });
        });
    }

    bindSlider() {
        const slider = document.querySelector('#sim-grams-slider');
        const label = document.querySelector('#sim-grams-val');

        if (slider) {
            slider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.state.grams = val;
                if (label) label.textContent = `${val.toFixed(1)}g`;
                this.updateSimulationUI();
            });
        }
    }

    bindActionButtons() {
        // 1. "Add to Cart" Button
        if (this.addCartBtn) {
            this.addCartBtn.addEventListener('click', () => {
                const baseNames = { uji: 'Uji Ceremonial', hojicha: 'Roasted Hojicha', soda: 'Mineral Soda' };
                const milkNames = { oat: 'Oat Cloud', vanilla: 'Vanilla Foam', coconut: 'Coconut Velvet', none: 'Zero Milk' };

                const itemPrice = 4.50 + (this.state.grams > 2.5 ? (this.state.grams - 2.5) * 0.4 : 0);

                const customItem = {
                    name: `Custom ${baseNames[this.state.baseTea]}`,
                    spec: `${this.state.grams.toFixed(1)}g Matcha • ${milkNames[this.state.milk]}`,
                    price: parseFloat(itemPrice.toFixed(2)),
                    qty: 1
                };

                // Add to Cart
                if (this.cartManager) {
                    this.cartManager.addItem(customItem);
                } else if (window.cartManager) {
                    window.cartManager.addItem(customItem);
                }

                // Button visual feedback
                const addedText = window.i18nManager?.t('sim_btn_added') || 'Added to Cart! ✔';
                const originalHTML = this.addCartBtn.innerHTML;
                this.addCartBtn.innerHTML = `<span>${addedText}</span>`;
                this.addCartBtn.style.background = '#22c55e';

                const cup = document.querySelector('.sim-cup-glass');
                if (cup) {
                    cup.style.transform = 'scale(1.08) rotate(3deg)';
                    cup.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    setTimeout(() => {
                        cup.style.transform = 'scale(1) rotate(0deg)';
                    }, 400);
                }

                setTimeout(() => {
                    this.addCartBtn.innerHTML = originalHTML;
                    this.addCartBtn.style.background = '';
                }, 1400);
            });
        }

        // 2. "Reset Recipe" Button
        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', () => {
                this.resetSimulation();
            });
        }
    }

    resetSimulation() {
        this.state = { ...this.defaultState };

        // Reset base tea pills
        document.querySelectorAll('[data-sim-base]').forEach(pill => {
            if (pill.dataset.simBase === this.defaultState.baseTea) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });

        // Reset milk pills
        document.querySelectorAll('[data-sim-milk]').forEach(pill => {
            if (pill.dataset.simMilk === this.defaultState.milk) {
                pill.classList.add('active');
            } else {
                pill.classList.remove('active');
            }
        });

        // Reset slider
        const slider = document.querySelector('#sim-grams-slider');
        const label = document.querySelector('#sim-grams-val');
        if (slider) slider.value = this.defaultState.grams;
        if (label) label.textContent = `${this.defaultState.grams.toFixed(1)}g`;

        // Update UI & sensory meters
        this.updateSimulationUI();

        // Brief feedback animation on reset button
        if (this.resetBtn) {
            const svg = this.resetBtn.querySelector('svg');
            if (svg) {
                svg.style.transform = 'rotate(-360deg)';
                svg.style.transition = 'transform 0.5s ease';
                setTimeout(() => {
                    svg.style.transform = '';
                    svg.style.transition = '';
                }, 500);
            }
        }
    }

    updateSimulationUI() {
        let umami = 50 + (this.state.grams * 12);
        let sweetness = 30;
        let antioxidant = 40 + (this.state.grams * 14);
        let caffeine = Math.round(this.state.grams * 28);
        let liquidColor = '#15803d';
        let foamHeight = '25%';
        let foamColor = '#fbcfe8';

        // Base adjustments
        if (this.state.baseTea === 'hojicha') {
            liquidColor = '#78350f';
            umami -= 15;
            caffeine -= 20;
        } else if (this.state.baseTea === 'soda') {
            liquidColor = '#166534';
            sweetness += 15;
        }

        // Milk adjustments
        if (this.state.milk === 'none') {
            foamHeight = '0%';
            sweetness -= 10;
        } else if (this.state.milk === 'vanilla') {
            foamHeight = '35%';
            sweetness += 35;
            foamColor = '#fef08a';
        } else if (this.state.milk === 'oat') {
            foamHeight = '28%';
            sweetness += 18;
            foamColor = '#fbcfe8';
        } else if (this.state.milk === 'coconut') {
            foamHeight = '22%';
            sweetness += 22;
            foamColor = '#ffffff';
        }

        // Clamping (0 - 100)
        umami = Math.max(10, Math.min(100, umami));
        sweetness = Math.max(10, Math.min(100, sweetness));
        antioxidant = Math.max(10, Math.min(100, antioxidant));

        // Update Gauges
        if (this.umamiFill) this.umamiFill.style.width = `${umami}%`;
        if (this.sweetnessFill) this.sweetnessFill.style.width = `${sweetness}%`;
        if (this.antioxidantFill) this.antioxidantFill.style.width = `${antioxidant}%`;
        if (this.caffeineVal) this.caffeineVal.textContent = `~${caffeine} mg`;

        // Update Visual Cup
        if (this.foamLayer) {
            this.foamLayer.style.height = foamHeight;
            this.foamLayer.style.background = foamColor;
        }
        if (this.liquidLayer) {
            this.liquidLayer.style.background = liquidColor;
        }

        // Update Dynamic Summary Text
        if (this.summaryText) {
            const lang = window.i18nManager?.currentLang || 'en';
            let desc = '';
            if (lang === 'id') {
                if (this.state.baseTea === 'hojicha') {
                    desc = 'Nutty Roasted Hojicha dengan aroma panggang lembut dan sensasi umami menenangkan.';
                } else if (this.state.baseTea === 'soda') {
                    desc = 'Sparkling Zen Refreshment bergelembung mikro dengan rasa bersih dan menyegarkan.';
                } else {
                    desc = `Ceremonial Uji murni (${this.state.grams.toFixed(1)}g) dengan umami tebal dan sentuhan ${this.state.milk} foam.`;
                }
            } else {
                if (this.state.baseTea === 'hojicha') {
                    desc = 'Nutty Roasted Hojicha with comforting warm aroma and soothing umami undertones.';
                } else if (this.state.baseTea === 'soda') {
                    desc = 'Sparkling Zen Refreshment with crisp micro-carbonation and a clean, revitalizing finish.';
                } else {
                    desc = `Pure Ceremonial Uji (${this.state.grams.toFixed(1)}g) with deep umami and silky ${this.state.milk} foam.`;
                }
            }
            this.summaryText.textContent = desc;
        }
    }
}
