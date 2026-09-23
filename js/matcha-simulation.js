/**
 * Interactive Matcha Crafting Simulation Engine
 * Handles live recipe tweaking, sensory meter updates, and cup preview rendering.
 */
export class MatchaSimulator {
    constructor() {
        this.page = document.querySelector('#simulation-page');
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
        this.brewBtn = document.querySelector('#sim-brew-btn');

        // State
        this.state = {
            baseTea: 'uji', // 'uji', 'hojicha', 'soda'
            grams: 2.5,
            milk: 'oat', // 'oat', 'vanilla', 'coconut', 'none'
            toppings: ['powder']
        };

        this.init();
    }

    init() {
        this.bindPills();
        this.bindSlider();
        this.bindBrewButton();
        this.updateSimulationUI();
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

    bindBrewButton() {
        if (!this.brewBtn) return;
        this.brewBtn.addEventListener('click', () => {
            this.brewBtn.innerHTML = `<span>Menyeduh Racikan...</span> ✨`;
            this.brewBtn.style.transform = 'scale(0.97)';

            const cup = document.querySelector('.sim-cup-glass');
            if (cup) {
                cup.style.transform = 'scale(1.08) rotate(3deg)';
                cup.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            }

            setTimeout(() => {
                this.brewBtn.innerHTML = `<span>Formula Tersimpan!</span> ✔`;
                if (cup) cup.style.transform = 'scale(1) rotate(0deg)';
                setTimeout(() => {
                    this.brewBtn.innerHTML = `<span>Seduh & Simulasikan Racikan</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
                }, 1800);
            }, 700);
        });
    }

    updateSimulationUI() {
        // Calculate Sensory Values based on state
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
            let desc = '';
            if (this.state.baseTea === 'hojicha') {
                desc = 'Nutty Roasted Hojicha dengan aroma panggang lembut dan sensasi umami menenangkan.';
            } else if (this.state.baseTea === 'soda') {
                desc = 'Sparkling Zen Refreshment bergelembung mikro dengan rasa bersih dan menyegarkan.';
            } else {
                desc = `Ceremonial Uji murni (${this.state.grams.toFixed(1)}g) dengan umami tebal dan sentuhan ${this.state.milk} foam.`;
            }
            this.summaryText.textContent = desc;
        }
    }
}
