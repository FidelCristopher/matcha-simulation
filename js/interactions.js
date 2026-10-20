/**
 * Hardware-Accelerated 3D Botanical Orbit & Physics Interactions (Zero Layout Thrashing)
 * Smooth 60-120 FPS orbit motion for Chasen, Strawberries/Berries, and Daun Matcha.
 */
import { APP_CONFIG } from './config.js';

export class InteractionManager {
    constructor(modelController) {
        this.modelController = modelController;

        // Floating Botanical Elements
        this.allBerries = document.querySelectorAll('.berry');
        this.allChasen = document.querySelectorAll('.chasen');
        this.allDaunMatcha = document.querySelectorAll('.daun-matcha');
        this.botanicals = [];

        // Mouse tracking state
        this.mouse = { x: 0, y: 0, px: window.innerWidth * 0.5, py: window.innerHeight * 0.5 };
        this.currentMouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.setupBotanicalNodes();
        this.setupListeners();
        this.startRenderLoop();
    }

    setupBotanicalNodes() {
        // Collect all floating botanical elements with predefined normalized anchors & orbit configurations
        const berryAnchors = [
            { anchorX: 0.24, anchorY: 0.14, radiusX: 24, radiusY: 18, speed: 0.65, rotSpeed: 0.8 },
            { anchorX: 0.76, anchorY: 0.26, radiusX: 30, radiusY: 22, speed: 0.55, rotSpeed: -0.7 },
            { anchorX: 0.16, anchorY: 0.68, radiusX: 28, radiusY: 20, speed: 0.75, rotSpeed: 0.9 },
            { anchorX: 0.38, anchorY: 0.20, radiusX: 22, radiusY: 16, speed: 0.50, rotSpeed: -0.6 },
            { anchorX: 0.62, anchorY: 0.36, radiusX: 26, radiusY: 18, speed: 0.60, rotSpeed: 0.75 }
        ];

        this.allBerries.forEach((el, idx) => {
            const cfg = berryAnchors[idx % berryAnchors.length];
            this.botanicals.push({
                dom: el,
                anchorX: cfg.anchorX,
                anchorY: cfg.anchorY,
                radiusX: cfg.radiusX,
                radiusY: cfg.radiusY,
                speed: cfg.speed,
                phase: idx * 1.6,
                rx: 0,
                ry: 0
            });
        });

        const chasenAnchors = [
            { anchorX: 0.66, anchorY: 0.16, radiusX: 34, radiusY: 24, speed: 0.65 },
            { anchorX: 0.33, anchorY: 0.22, radiusX: 28, radiusY: 20, speed: 0.50 }
        ];

        this.allChasen.forEach((el, idx) => {
            const cfg = chasenAnchors[idx % chasenAnchors.length];
            this.botanicals.push({
                dom: el,
                anchorX: cfg.anchorX,
                anchorY: cfg.anchorY,
                radiusX: cfg.radiusX,
                radiusY: cfg.radiusY,
                speed: cfg.speed,
                phase: idx * 2.4,
                rx: 0,
                ry: 0
            });
        });

        const daunAnchors = [
            { anchorX: 0.10, anchorY: 0.26, radiusX: 32, radiusY: 22, speed: 0.58 },
            { anchorX: 0.36, anchorY: 0.68, radiusX: 26, radiusY: 18, speed: 0.52 }
        ];

        this.allDaunMatcha.forEach((el, idx) => {
            const cfg = daunAnchors[idx % daunAnchors.length];
            this.botanicals.push({
                dom: el,
                anchorX: cfg.anchorX,
                anchorY: cfg.anchorY,
                radiusX: cfg.radiusX,
                radiusY: cfg.radiusY,
                speed: cfg.speed,
                phase: idx * 2.1,
                rx: 0,
                ry: 0
            });
        });
    }

    setupListeners() {
        // Track pointer position smoothly without causing forced reflow
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = (e.clientX / window.innerWidth) - 0.5;
            this.mouse.y = (e.clientY / window.innerHeight) - 0.5;
            this.mouse.px = e.clientX;
            this.mouse.py = e.clientY;
        }, { passive: true });
    }

    startRenderLoop() {
        const tick = () => {
            const time = Date.now() * 0.001;

            // Interpolate cursor tilt
            this.currentMouse.x += (this.mouse.x - this.currentMouse.x) * (APP_CONFIG.camera?.lerpFactor || 0.05);
            this.currentMouse.y += (this.mouse.y - this.currentMouse.y) * (APP_CONFIG.camera?.lerpFactor || 0.05);

            // Update 3D Model rotation & render Three.js scene
            if (this.modelController && this.modelController.updateTilt) {
                this.modelController.updateTilt(this.currentMouse);
            }

            // Animate Orbiting Botanicals (Smooth GPU Compositing without Reflow)
            const screenW = window.innerWidth;
            const screenH = window.innerHeight;

            // Skip botanical animation loop on mobile screens (< 768px) where they are hidden for max FPS
            if (screenW >= 768) {
                for (let i = 0; i < this.botanicals.length; i++) {
                    const b = this.botanicals[i];
                    const phase = (time * b.speed) + b.phase;

                    // Orbital coordinates
                    const orbitX = Math.cos(phase) * b.radiusX;
                    const orbitY = Math.sin(phase) * b.radiusY;
                    const floatY = Math.sin(time * 1.4 + b.phase) * 10;
                    const floatRot = Math.cos(time * 0.8 + b.phase) * 14;

                    // Pure mathematical distance calculation without getBoundingClientRect()
                    const elementCenterX = b.anchorX * screenW + orbitX;
                    const elementCenterY = b.anchorY * screenH + orbitY;
                    const diffX = this.mouse.px - elementCenterX;
                    const diffY = this.mouse.py - elementCenterY;
                    const distSq = diffX * diffX + diffY * diffY;

                    // Repulsion radius = 320px (squared = 102400)
                    let targetRx = 0;
                    let targetRy = 0;

                    if (distSq < 102400 && distSq > 0) {
                        const dist = Math.sqrt(distSq);
                        const force = (320 - dist) / 320;
                        targetRx = (diffX / dist) * force * -60;
                        targetRy = (diffY / dist) * force * -60;
                    }

                    // Smooth spring damping
                    b.rx += (targetRx - b.rx) * 0.08;
                    b.ry += (targetRy - b.ry) * 0.08;

                    // Hardware-accelerated GPU transform (composite layer only)
                    b.dom.style.transform = `translate3d(${b.rx + orbitX}px, ${b.ry + orbitY + floatY}px, 0) rotate(${floatRot}deg)`;
                }
            }

            requestAnimationFrame(tick);
        };

        requestAnimationFrame(tick);
    }
}
