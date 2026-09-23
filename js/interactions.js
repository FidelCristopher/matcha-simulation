/**
 * Interactive Gestures, Repulsion Physics, Parallax, Layer Annotations & Flavor Transitions
 */
import { APP_CONFIG } from './config.js';

export class InteractionManager {
    constructor(modelController) {
        this.modelController = modelController;
        this.isSwitching = false;

        // DOM elements
        this.berriesFG = document.querySelector('.berries-container');
        this.berriesBG = document.querySelector('.berries-container-bg');
        this.leavesBG = document.querySelector('.leaves-container');
        this.allBerries = document.querySelectorAll('.berry');
        this.allLeaves = document.querySelectorAll('.leaf');
        this.cards = document.querySelectorAll('.card');
        this.heroCenter = document.querySelector('.hero-center');

        // Simulation HUD Elements
        this.explodeBtn = document.querySelector('#explode-toggle-btn');
        this.explodeSlider = document.querySelector('#explode-slider');
        this.annotations = document.querySelectorAll('.layer-annotation');

        // Mouse tracking state
        this.mouse = { x: 0, y: 0, px: 0, py: 0 };
        this.currentMouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.setupBerryStates();
        this.setupListeners();
        this.setupSimulationHUD();
        this.startRenderLoop();
    }

    setupBerryStates() {
        this.allBerries.forEach(berry => {
            berry.dataset.rx = 0;
            berry.dataset.ry = 0;
            berry.dataset.angle = Math.random() * 360;
            berry.dataset.baseX = 0;
            berry.dataset.baseY = 0;
        });
    }

    setupSimulationHUD() {
        // Toggle Button
        if (this.explodeBtn) {
            this.explodeBtn.addEventListener('click', () => {
                this.modelController.toggleExplode();
            });
        }

        // Range Slider
        if (this.explodeSlider) {
            this.explodeSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value) / 100;
                this.modelController.setExplodeProgress(val);
            });
        }

        // Listen for explode progress changes from touch/mouse gestures
        document.addEventListener('matcha:explode-change', (e) => {
            const progress = e.detail.progress;

            // Sync slider
            if (this.explodeSlider) {
                this.explodeSlider.value = Math.round(progress * 100);
            }

            // Sync toggle button text
            if (this.explodeBtn) {
                if (progress > 0.5) {
                    this.explodeBtn.classList.add('active');
                    this.explodeBtn.innerHTML = `<span>Assemble</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
                } else {
                    this.explodeBtn.classList.remove('active');
                    this.explodeBtn.innerHTML = `<span>Pinch / Split Layers</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
                }
            }

            // Reveal/Hide Annotations based on progress threshold
            this.annotations.forEach(ann => {
                if (progress > 0.25) {
                    ann.classList.add('visible');
                    ann.style.opacity = Math.min(1, (progress - 0.25) / 0.5);
                } else {
                    ann.classList.remove('visible');
                    ann.style.opacity = '0';
                }
            });
        });
    }

    setupListeners() {
        // Track pointer
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) - 0.5;
            this.mouse.y = (e.clientY / window.innerHeight) - 0.5;
            this.mouse.px = e.clientX;
            this.mouse.py = e.clientY;
        });

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
            duration: 1.5,
            ease: 'power2.inOut'
        });

        // 2. 3D Model 720-degree spin + blur transition
        const spinObj = { val: 0, blur: 0 };
        const canvasDom = this.modelController.renderer.domElement;

        gsap.to(spinObj, {
            val: 360,
            blur: 14,
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
                    body.className = '';
                }

                this.modelController.applyFlavorTone(flavorId);

                // Second half rotation settle
                gsap.to(spinObj, {
                    val: 720,
                    blur: 0,
                    duration: 1.5,
                    ease: 'back.out(0.7)',
                    onUpdate: () => {
                        this.modelController.switchSpin = spinObj.val;
                        if (canvasDom) {
                            canvasDom.style.filter = `blur(${spinObj.blur}px)`;
                        }
                    },
                    onComplete: () => {
                        this.modelController.switchSpin = 0;
                        if (canvasDom) {
                            canvasDom.style.filter = 'none';
                        }
                    }
                });
            }
        });

        // 3. Floating Botanicals Implode -> Model Swap -> Explode
        let completed = 0;
        this.allBerries.forEach(berry => {
            const bW = berry.offsetWidth / 2;
            const bH = berry.offsetHeight / 2;
            const centerX = (window.innerWidth / 2 - berry.offsetLeft - bW);
            const centerY = (window.innerHeight / 2 - berry.offsetTop - bH);

            const startAngle = parseFloat(berry.dataset.angle) || 0;
            const currentBaseX = parseFloat(berry.dataset.baseX) || 0;
            const currentBaseY = parseFloat(berry.dataset.baseY) || 0;

            const nextBaseX = (Math.random() - 0.5) * 200;
            const nextBaseY = (Math.random() - 0.5) * 200;

            gsap.set(berry, {
                rotation: startAngle,
                x: currentBaseX,
                y: currentBaseY
            });

            const tl = gsap.timeline();

            tl.to(berry, {
                x: centerX,
                y: centerY,
                rotation: startAngle + 45,
                scale: 0.1,
                opacity: 0,
                duration: 0.5,
                ease: 'power2.in',
                onComplete: () => {
                    berry.src = flavorConfig.botanicalModel;
                    if (this.heroCenter) this.heroCenter.style.zIndex = 50;
                }
            })
            .to(berry, { duration: 0.3 })
            .to(berry, {
                onStart: () => {
                    if (this.heroCenter) this.heroCenter.style.zIndex = 1;
                },
                x: nextBaseX,
                y: nextBaseY,
                rotation: startAngle + 90,
                scale: 1,
                opacity: 1,
                duration: 0.9,
                ease: 'back.out(1.5)',
                onComplete: () => {
                    berry.dataset.angle = startAngle + 90;
                    berry.dataset.baseX = nextBaseX;
                    berry.dataset.baseY = nextBaseY;
                    berry.dataset.rx = 0;
                    berry.dataset.ry = 0;

                    completed++;
                    if (completed === this.allBerries.length) {
                        this.isSwitching = false;
                    }
                }
            });
        });
    }

    startRenderLoop() {
        const tick = () => {
            const time = Date.now() * 0.001;

            // Interpolate mouse smoothly
            this.currentMouse.x += (this.mouse.x - this.currentMouse.x) * APP_CONFIG.camera.lerpFactor;
            this.currentMouse.y += (this.mouse.y - this.currentMouse.y) * APP_CONFIG.camera.lerpFactor;

            // Update 3D Model tilt & render Three.js scene
            this.modelController.updateTilt(this.currentMouse);

            // Update Parallax Layers
            if (this.berriesFG) {
                this.berriesFG.style.transform = `translate(${this.currentMouse.x * APP_CONFIG.parallax.foreground}px, ${this.currentMouse.y * APP_CONFIG.parallax.foreground}px)`;
            }
            if (this.berriesBG) {
                this.berriesBG.style.transform = `translate(${this.currentMouse.x * APP_CONFIG.parallax.background}px, ${this.currentMouse.y * APP_CONFIG.parallax.background}px)`;
            }
            if (this.leavesBG) {
                this.leavesBG.style.transform = `translate(${this.currentMouse.x * APP_CONFIG.parallax.leaves}px, ${this.currentMouse.y * APP_CONFIG.parallax.leaves}px)`;
            }

            // Pointer Repulsion Physics on Botanicals
            if (!this.isSwitching) {
                const { radius, strength, lerp, speedMultiplierBase, speedMultiplierForce } = APP_CONFIG.repulsion;

                this.allBerries.forEach((berry, i) => {
                    const rect = berry.getBoundingClientRect();
                    const berryX = rect.left + rect.width / 2;
                    const berryY = rect.top + rect.height / 2;

                    const diffX = this.mouse.px - berryX;
                    const diffY = this.mouse.py - berryY;
                    const distance = Math.sqrt(diffX * diffX + diffY * diffY);

                    let targetRx = 0, targetRy = 0, speedMult = speedMultiplierBase;

                    if (distance < radius) {
                        const force = (radius - distance) / radius;
                        targetRx = (diffX / distance) * force * strength;
                        targetRy = (diffY / distance) * force * strength;
                        speedMult = speedMultiplierBase + force * speedMultiplierForce;
                    }

                    let rx = parseFloat(berry.dataset.rx) || 0;
                    let ry = parseFloat(berry.dataset.ry) || 0;
                    let angle = parseFloat(berry.dataset.angle) || 0;
                    let baseX = parseFloat(berry.dataset.baseX) || 0;
                    let baseY = parseFloat(berry.dataset.baseY) || 0;

                    rx += (targetRx - rx) * lerp;
                    ry += (targetRy - ry) * lerp;
                    angle += 0.2 * speedMult;

                    berry.dataset.rx = rx;
                    berry.dataset.ry = ry;
                    berry.dataset.angle = angle;

                    const dur = [5, 7, 6, 8, 5.5, 6.5, 9, 11, 10][i % 9];
                    const phase = (time + i * 0.7) * (Math.PI * 2 / dur);
                    const floatY = Math.sin(phase) * 15;
                    const floatAngle = Math.cos(phase) * 6;

                    berry.style.transform = `translate(calc(${rx + baseX}px), calc(${ry + baseY}px + ${floatY}px)) rotate(calc(${angle}deg + ${floatAngle}deg))`;
                });
            }

            // Background Tea Leaves Gentle Float
            this.allLeaves.forEach((leaf, i) => {
                const dur = 10 + i * 2;
                const phase = (time + i * 1.2) * (Math.PI * 2 / dur);
                const floatY = Math.sin(phase) * 20;
                const floatX = Math.cos(phase * 0.5) * 15;
                const floatAngle = Math.sin(phase * 0.3) * 15;
                leaf.style.transform = `translate(${floatX}px, ${floatY}px) rotate(${floatAngle}deg)`;
            });

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }
}
