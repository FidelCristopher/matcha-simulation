/**
 * Three.js 3D Matcha Showcase Controller
 * Full 360° Drag & Rotate with Smooth Momentum Inertia and Ambient Turntable Rotation.
 * Supports Desktop Mouse & Mobile/Tablet Touch Gestures.
 */
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';
import { APP_CONFIG } from './config.js';

export class ModelController {
    constructor(containerSelector = '#matcha-canvas-container') {
        this.container = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;

        if (!this.container) return;

        // Parts & Meshes
        this.allParts = [];
        this.isReady = false;

        // 360° Free Rotation State
        this.rotY = 0;
        this.rotX = 0;
        this.targetRotY = 0;
        this.targetRotX = 0;
        this.velY = 0;
        this.velX = 0;
        this.switchSpin = 0;

        // Dragging & Gesture State
        this.isDragging = false;
        this.lastPointerX = 0;
        this.lastPointerY = 0;
        this.autoRotateSpeed = 0.0035; // Gentle ambient turntable spin
        this.dragSensitivity = 0.008;

        this.initThree();
        this.loadModel();
        this.bind360RotateGestures();
    }

    initThree() {
        const width = this.container.clientWidth || window.innerWidth * 0.7;
        const height = this.container.clientHeight || window.innerHeight * 0.7;

        // Scene & Group
        this.scene = new THREE.Scene();
        this.rootGroup = new THREE.Group();
        this.scene.add(this.rootGroup);

        // Perspective Camera
        this.camera = new THREE.PerspectiveCamera(30, width / height, 0.1, 100);
        this.camera.position.set(0, 0.05, 3.8);

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.35;
        this.container.appendChild(this.renderer.domElement);

        // Studio Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
        keyLight.position.set(3, 5, 4);
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x76b885, 1.3); // Soft matcha rim fill
        fillLight.position.set(-4, -1, 2);
        this.scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xfef08a, 1.0); // Warm gold rim light
        backLight.position.set(0, 4, -4);
        this.scene.add(backLight);

        // Resize Listener
        window.addEventListener('resize', () => this.onWindowResize());
    }

    loadModel(modelPath = APP_CONFIG.modelPath || 'assets/models/matcha_layers.glb') {
        const loader = new GLTFLoader();
        loader.load(
            modelPath,
            (gltf) => {
                const root = gltf.scene;

                // Center bounding box of model to ensure perfect orbit pivot
                const box = new THREE.Box3().setFromObject(root);
                const center = new THREE.Vector3();
                box.getCenter(center);
                root.position.sub(center); // Align center to (0,0,0)

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
                this.allParts = [root];
                this.isReady = true;

                // Render initial frame
                this.renderer.render(this.scene, this.camera);
                document.dispatchEvent(new CustomEvent('matcha:model-loaded'));
            },
            undefined,
            (err) => {
                console.error(`Failed to load 3D model (${modelPath}):`, err);
            }
        );
    }

    bind360RotateGestures() {
        const dom = this.renderer.domElement;
        dom.style.cursor = 'grab';

        const onPointerDown = (clientX, clientY) => {
            this.isDragging = true;
            this.lastPointerX = clientX;
            this.lastPointerY = clientY;
            this.velY = 0;
            this.velX = 0;
            dom.style.cursor = 'grabbing';
        };

        const onPointerMove = (clientX, clientY) => {
            if (!this.isDragging) return;

            const deltaX = clientX - this.lastPointerX;
            const deltaY = clientY - this.lastPointerY;
            this.lastPointerX = clientX;
            this.lastPointerY = clientY;

            // Update rotation angles
            this.targetRotY += deltaX * this.dragSensitivity;
            this.targetRotX += deltaY * (this.dragSensitivity * 0.7);

            // Clamp vertical tilt to prevent flipping
            this.targetRotX = Math.max(-0.65, Math.min(0.65, this.targetRotX));

            // Instantaneous velocity for momentum flings
            this.velY = deltaX * this.dragSensitivity;
            this.velX = deltaY * (this.dragSensitivity * 0.7);
        };

        const onPointerUp = () => {
            if (this.isDragging) {
                this.isDragging = false;
                dom.style.cursor = 'grab';
            }
        };

        // Desktop Mouse Listeners
        dom.addEventListener('mousedown', (e) => {
            if (e.button !== 0) return;
            onPointerDown(e.clientX, e.clientY);
        });

        window.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                onPointerMove(e.clientX, e.clientY);
            }
        });

        window.addEventListener('mouseup', onPointerUp);

        // Mobile & Tablet Touch Listeners
        dom.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        window.addEventListener('touchend', onPointerUp);
        window.addEventListener('touchcancel', onPointerUp);
    }

    updateTilt(currentMouse) {
        if (!this.rootGroup || !this.isReady) return;

        // Apply momentum inertia when released
        if (!this.isDragging) {
            this.targetRotY += this.velY;
            this.targetRotX += this.velX;

            // Decay velocity with natural friction
            this.velY *= 0.92;
            this.velX *= 0.92;

            // Subtle continuous turntable auto-spin when idle
            if (Math.abs(this.velY) < 0.001) {
                this.targetRotY += this.autoRotateSpeed;
            }

            this.targetRotX = Math.max(-0.65, Math.min(0.65, this.targetRotX));
        }

        // Smooth spring interpolation
        this.rotY += (this.targetRotY - this.rotY) * 0.12;
        this.rotX += (this.targetRotX - this.rotX) * 0.12;

        // Combine user rotation + flavor swap spin
        this.rootGroup.rotation.y = this.rotY + THREE.MathUtils.degToRad(this.switchSpin);
        this.rootGroup.rotation.x = this.rotX;

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
        if (width === 0 || height === 0) return;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
