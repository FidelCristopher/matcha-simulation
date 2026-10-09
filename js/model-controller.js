/**
 * Three.js 3D Matcha Layer Simulation Controller
 * Handles 3-layer exploded view (Topping, Isi, Base), multi-touch pinch gesture,
 * mouse dragging, tilt tracking, and GSAP flavor transitions.
 */
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { APP_CONFIG } from './config.js';

export class ModelController {
    constructor(containerSelector = '#matcha-canvas-container') {
        this.container = document.querySelector(containerSelector);
        if (!this.container) return;

        // Simulation Layers & Parts (Supports both matcha_layers & matcha_v4)
        this.toppingMesh = null;
        this.isiMesh = null;
        this.baseMesh = null;
        this.drinkMesh = null;
        this.glassMesh = null;
        this.allParts = [];

        // State
        this.explodeProgress = 0; // 0 = assembled, 1 = fully exploded
        this.targetExplodeProgress = 0;
        this.switchSpin = 0;
        this.isReady = false;

        // Interaction state
        this.isDragging = false;
        this.dragStartY = 0;
        this.initialPinchDistance = 0;
        this.pinchStartExplode = 0;

        this.initThree();
        this.loadLayers();
        this.bindTapAndInteractions();
    }

    initThree() {
        const width = this.container.clientWidth || window.innerWidth * 0.8;
        const height = this.container.clientHeight || window.innerHeight * 0.8;

        // Scene & Group
        this.scene = new THREE.Scene();
        this.rootGroup = new THREE.Group();
        this.rootGroup.rotation.z = THREE.MathUtils.degToRad(25); // Signature dynamic diagonal tilt
        this.scene.add(this.rootGroup);

        // Perspective Camera
        this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
        this.camera.position.set(0, 0, 3.8); // 3.8 distance frames the unit model well

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.35;
        this.container.appendChild(this.renderer.domElement);

        // Studio Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.4);
        keyLight.position.set(3, 5, 4);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x76b885, 1.2); // Soft matcha rim fill
        fillLight.position.set(-4, -1, 2);
        this.scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xfbcfe8, 1.0); // Sakura accent rim light
        backLight.position.set(0, 4, -4);
        this.scene.add(backLight);

        // Resize Listener
        window.addEventListener('resize', () => this.onWindowResize());
    }

    loadLayers(modelPath = APP_CONFIG.modelPath || 'assets/models/matcha_layers.glb') {
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const root = gltf.scene;

                // Retrieve handles for matcha_layers.glb
                this.toppingMesh = root.getObjectByName('matcha_topping');
                this.isiMesh = root.getObjectByName('matcha_isi');
                this.baseMesh = root.getObjectByName('matcha_base');

                // Retrieve handles for matcha_v4.glb
                this.drinkMesh = root.getObjectByName('Matcha_Drink_Asset');
                this.glassMesh = root.getObjectByName('Thick_Crystal_Glass_Tumbler');

                root.traverse((child) => {
                    if (child.isMesh && child.material) {
                        if (child.material.transmission && child.material.transmission > 0) {
                            child.material.transparent = true;
                            child.material.depthWrite = false;
                            child.material.roughness = Math.max(child.material.roughness || 0.05, 0.05);
                            child.material.envMapIntensity = 2.0;
                        } else {
                            child.material.side = THREE.DoubleSide;
                        }
                    }
                });

                this.rootGroup.add(root);
                this.allParts = [
                    this.toppingMesh,
                    this.isiMesh,
                    this.baseMesh,
                    this.drinkMesh,
                    this.glassMesh
                ].filter(Boolean);

                this.isReady = true;

                // Initial render frame
                this.renderer.render(this.scene, this.camera);
                document.dispatchEvent(new CustomEvent('matcha:model-loaded'));
            },
            undefined,
            (err) => {
                console.error(`Failed to load 3D model (${modelPath}):`, err);
            }
        );
    }

    bindTapAndInteractions() {
        const dom = this.renderer.domElement;
        let touchStartX = 0;
        let touchStartY = 0;
        let touchStartTime = 0;
        let isPointerDown = false;
        let pointerStartX = 0;
        let pointerStartY = 0;
        let pointerStartTime = 0;

        // 1. Mobile & Touchscreen Tap to Explode / Split
        dom.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
                touchStartTime = Date.now();
            }
        }, { passive: true });

        dom.addEventListener('touchend', (e) => {
            if (e.changedTouches.length === 1) {
                const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);
                const deltaY = Math.abs(e.changedTouches[0].clientY - touchStartY);
                const elapsed = Date.now() - touchStartTime;

                // Quick tap without significant swipe/drag
                if (deltaX < 20 && deltaY < 20 && elapsed < 400) {
                    this.toggleExplode();
                }
            }
        });

        // 2. Desktop Mouse Click / Tap to Explode / Split
        dom.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return; // Left click only
            isPointerDown = true;
            pointerStartX = e.clientX;
            pointerStartY = e.clientY;
            pointerStartTime = Date.now();
        });

        window.addEventListener('mouseup', (e) => {
            if (isPointerDown) {
                const deltaX = Math.abs(e.clientX - pointerStartX);
                const deltaY = Math.abs(e.clientY - pointerStartY);
                const elapsed = Date.now() - pointerStartTime;

                // Clean click/tap without dragging
                if (deltaX < 15 && deltaY < 15 && elapsed < 400) {
                    this.toggleExplode();
                }
            }
            isPointerDown = false;
        });
    }

    setExplodeProgress(val, animate = false) {
        val = Math.max(0, Math.min(1, val));
        if (animate) {
            gsap.to(this, {
                explodeProgress: val,
                duration: 0.75,
                ease: 'power3.out',
                onUpdate: () => {
                    this.updateLayerPositions();
                    document.dispatchEvent(new CustomEvent('matcha:explode-change', {
                        detail: { progress: this.explodeProgress }
                    }));
                }
            });
        } else {
            this.explodeProgress = val;
            this.updateLayerPositions();
            document.dispatchEvent(new CustomEvent('matcha:explode-change', {
                detail: { progress: this.explodeProgress }
            }));
        }
    }

    toggleExplode() {
        const nextTarget = this.explodeProgress > 0.5 ? 0 : 1;
        this.setExplodeProgress(nextTarget, true);
    }

    updateLayerPositions() {
        // Mode 1: 3-Layer separated model (matcha_layers.glb)
        if (this.toppingMesh && this.isiMesh && this.baseMesh) {
            const maxOffset = 0.55;
            const currentOffset = this.explodeProgress * maxOffset;
            this.toppingMesh.position.y = currentOffset;
            this.isiMesh.position.y = 0;
            this.baseMesh.position.y = -currentOffset;
            return;
        }

        // Mode 2: Crystal Glass + Matcha Drink model (matcha_v4.glb)
        if (this.glassMesh || this.drinkMesh) {
            const maxOffset = 0.45;
            const currentOffset = this.explodeProgress * maxOffset;
            if (this.glassMesh) {
                this.glassMesh.position.y = currentOffset * 0.7;
            }
            if (this.drinkMesh) {
                this.drinkMesh.position.y = -currentOffset * 0.3;
            }
        }
    }

    updateTilt(currentMouse) {
        if (!this.rootGroup) return;

        // Real-time cursor parallax tilt + flavor switch spin
        const targetRotY = (currentMouse.x * 0.75) + THREE.MathUtils.degToRad(this.switchSpin);
        const targetRotX = (currentMouse.y * 0.45);

        this.rootGroup.rotation.y = targetRotY;
        this.rootGroup.rotation.x = targetRotX;

        this.renderer.render(this.scene, this.camera);
    }

    applyFlavorTone(flavorId) {
        const flavor = APP_CONFIG.flavors[flavorId];
        if (!flavor || !this.allParts.length) return;

        const factor = flavor.modelBaseColorFactor;
        const color = new THREE.Color(factor[0], factor[1], factor[2]);

        this.allParts.forEach(part => {
            part.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.color = color;
                }
            });
        });
    }

    onWindowResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
