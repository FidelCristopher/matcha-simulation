/**
 * Streamlined Interactions & Flavor Transitions (Optimized for High FPS & Low CPU/TBT)
 */
import { APP_CONFIG } from './config.js';

export class InteractionManager {
    constructor(modelController) {
        this.modelController = modelController;
        this.isSwitching = false;

        // DOM elements
        this.cards = document.querySelectorAll('.card');
        this.heroCenter = document.querySelector('.hero-center');

        // Mouse tracking state
        this.mouse = { x: 0, y: 0, px: 0, py: 0 };
        this.currentMouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.setupListeners();
        this.startRenderLoop();
    }

    setupListeners() {
        // Track pointer smoothly
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) - 0.5;
            this.mouse.y = (e.clientY / window.innerHeight) - 0.5;
            this.mouse.px = e.clientX;
            this.mouse.py = e.clientY;
        }, { passive: true });

        // Flavor Cards Selection
        this.cards.forEach(card => {
            card.addEventListener('click', () => {
                if (this.isSwitching || card.classList.contains('active')) return;
                this.cards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');

                const flavor = card.dataset.flavor;
                this.triggerFlavorSwitch(flavor);
            });
        });

        // Carousel Arrow Navigation
        document.getElementById('prev-card')?.addEventListener('click', () => this.cycleFlavor());
        document.getElementById('next-card')?.addEventListener('click', () => this.cycleFlavor());
    }

    cycleFlavor() {
        if (this.isSwitching) return;
        const inactive = Array.from(this.cards).find(c => !c.classList.contains('active'));
        if (inactive) inactive.click();
    }

    triggerFlavorSwitch(flavorId) {
        if (this.isSwitching) return;
        this.isSwitching = true;

        const flavorConfig = APP_CONFIG.flavors[flavorId] || APP_CONFIG.flavors.classic;
        const body = document.body;

        // 1. Background radial gradient morphing
        gsap.to(body, {
            '--bg-inner': flavorConfig.colors.inner,
            '--bg-mid': flavorConfig.colors.mid,
            '--bg-outer': flavorConfig.colors.outer,
            duration: 1.2,
            ease: 'power2.inOut'
        });

        // 2. 3D Model 360-degree spin + subtle blur transition
        const spinObj = { val: 0, blur: 0 };
        const canvasDom = this.modelController.renderer ? this.modelController.renderer.domElement : null;

        gsap.to(spinObj, {
            val: 360,
            blur: 8,
            duration: 0.6,
            ease: 'power2.in',
            onUpdate: () => {
                this.modelController.switchSpin = spinObj.val;
                if (canvasDom) {
                    canvasDom.style.filter = `blur(${spinObj.blur}px)`;
                }
            },
            onComplete: () => {
                // Peak Swap: Update theme class and material tone
                if (flavorConfig.themeClass) {
                    body.classList.add(flavorConfig.themeClass);
                } else {
                    body.classList.remove('yuzu-theme');
                }

                this.modelController.applyFlavorTone(flavorId);

                // Exit spin
                gsap.fromTo(spinObj,
                    { val: -360, blur: 8 },
                    {
                        val: 0,
                        blur: 0,
                        duration: 0.7,
                        ease: 'power2.out',
                        onUpdate: () => {
                            this.modelController.switchSpin = spinObj.val;
                            if (canvasDom) {
                                canvasDom.style.filter = `blur(${spinObj.blur}px)`;
                            }
                        },
                        onComplete: () => {
                            this.modelController.switchSpin = 0;
                            if (canvasDom) canvasDom.style.filter = '';
                            this.isSwitching = false;
                        }
                    }
                );
            }
        });
    }

    startRenderLoop() {
        const tick = () => {
            // Smooth cursor interpolation without forced layout reads
            this.currentMouse.x += (this.mouse.x - this.currentMouse.x) * (APP_CONFIG.camera?.lerpFactor || 0.05);
            this.currentMouse.y += (this.mouse.y - this.currentMouse.y) * (APP_CONFIG.camera?.lerpFactor || 0.05);

            // Update 3D Model rotation & render Three.js scene
            if (this.modelController && this.modelController.updateTilt) {
                this.modelController.updateTilt(this.currentMouse);
            }

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }
}
