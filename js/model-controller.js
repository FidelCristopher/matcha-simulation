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

        // Simulation Layers
        this.toppingMesh = null;
        this.isiMesh = null;
        this.baseMesh = null;
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
        this.bindPinchAndDrag();
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

    loadLayers() {
        const loader = new GLTFLoader();
        loader.load(
            'assets/models/matcha_layers.glb',
            (gltf) => {
                const root = gltf.scene;

                // Retrieve the 3 separate layer objects
                this.toppingMesh = root.getObjectByName('matcha_topping');
                this.isiMesh = root.getObjectByName('matcha_isi');
                this.baseMesh = root.getObjectByName('matcha_base');

                root.traverse((child) => {
                    if (child.isMesh) {
                        child.material.side = THREE.DoubleSide;
                        child.material.roughness = 0.35;
                        child.material.metalness = 0.15;
                    }
                });

                this.rootGroup.add(root);
                this.allParts = [this.toppingMesh, this.isiMesh, this.baseMesh].filter(Boolean);
                this.isReady = true;

                // Initial render frame
                this.renderer.render(this.scene, this.camera);
                document.dispatchEvent(new CustomEvent('matcha:model-loaded'));
            },
            undefined,
            (err) => {
                console.error('Failed to load matcha_layers.glb:', err);
            }
        );
    }

    bindPinchAndDrag() {
        const dom = this.renderer.domElement;

        // Multi-touch gestures (Pinch to Explode on Touchscreen/Mobile)
        dom.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                // Two-finger pinch start
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                this.initialPinchDistance = Math.hypot(dx, dy);
                this.pinchStartExplode = this.explodeProgress;
            } else if (e.touches.length === 1) {
                // Single touch vertical drag
                this.isDragging = true;
                this.dragStartY = e.touches[0].clientY;
                this.pinchStartExplode = this.explodeProgress;
            }
        }, { passive: true });

        dom.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2 && this.initialPinchDistance > 0) {
                const dx = e.touches[0].clientX - e.touches[1].clientX;
                const dy = e.touches[0].clientY - e.touches[1].clientY;
                const currentDist = Math.hypot(dx, dy);
                const delta = (currentDist - this.initialPinchDistance) / 160;
                this.setExplodeProgress(Math.max(0, Math.min(1, this.pinchStartExplode + delta)));
            } else if (e.touches.length === 1 && this.isDragging) {
                const deltaY = (this.dragStartY - e.touches[0].clientY) / 200;
                this.setExplodeProgress(Math.max(0, Math.min(1, this.pinchStartExplode + deltaY)));
            }
        }, { passive: true });

        dom.addEventListener('touchend', () => {
            this.isDragging = false;
            this.initialPinchDistance = 0;
        });

        // Desktop Mouse Drag to Explode
        dom.addEventListener('mousedown', (e) => {
            this.isDragging = true;
            this.dragStartY = e.clientY;
            this.pinchStartExplode = this.explodeProgress;
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                const deltaY = (this.dragStartY - e.clientY) / 220;
                this.setExplodeProgress(Math.max(0, Math.min(1, this.pinchStartExplode + deltaY)));
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });

        // Mouse Wheel over model to explode/collapse
        dom.addEventListener('wheel', (e) => {
            e.preventDefault();
            const step = e.deltaY > 0 ? 0.12 : -0.12;
            this.setExplodeProgress(Math.max(0, Math.min(1, this.explodeProgress + step)));
        }, { passive: false });
    }

    setExplodeProgress(val, animate = false) {
        val = Math.max(0, Math.min(1, val));
        if (animate) {
            gsap.to(this, {
                explodeProgress: val,
                duration: 0.8,
                ease: 'power2.out',
                onUpdate: () => this.updateLayerPositions()
            });
        } else {
            this.explodeProgress = val;
            this.updateLayerPositions();
        }

        // Notify UI to update annotation badges and range slider
        document.dispatchEvent(new CustomEvent('matcha:explode-change', {
            detail: { progress: this.explodeProgress }
        }));
    }

    toggleExplode() {
        const nextTarget = this.explodeProgress > 0.5 ? 0 : 1;
        this.setExplodeProgress(nextTarget, true);
    }

    updateLayerPositions() {
        if (!this.toppingMesh || !this.isiMesh || !this.baseMesh) return;

        // Separation distances
        const maxOffset = 0.55; // Units of physical separation
        const currentOffset = this.explodeProgress * maxOffset;

        // Topping lifts up (+Y)
        this.toppingMesh.position.y = currentOffset;

        // Isi stays suspended in center (0)
        this.isiMesh.position.y = 0;

        // Base lowers down (-Y)
        this.baseMesh.position.y = -currentOffset;
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
