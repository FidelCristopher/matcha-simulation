/**
 * 3D Interactive Matcha Crafting Workbench (Three.js)
 * Implements Drag-and-Drop and Tap interactions with Katakuchi Chawan and Bamboo Chashaku.
 */
import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/GLTFLoader.js';

export class Simulation3DWorkbench {
    constructor(containerSelector = '#sim-canvas-container') {
        this.container = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;

        if (!this.container) return;

        // Models & Nodes
        this.chawanScene = null;
        this.chawanMesh = null;
        this.pile1 = null;
        this.pile2 = null;

        this.chashakuScene = null;
        this.chashakuHandle = null;
        this.chashakuHeap = null;

        // Interaction State
        this.scoopCount = 0; // 0 = empty, 1 = pile1, 2 = pile2
        this.isDragging = false;
        this.isBusy = false;

        // Rest Transforms for Chashaku
        this.restPos = new THREE.Vector3(0.08, 0.008, 0.04);
        this.restRot = new THREE.Euler(0.2, 0.45, 0.15);

        // Raycasting & Drag plane
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.dragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        this.planeIntersect = new THREE.Vector3();

        this.initThree();
        this.loadModels();
        this.bindEvents();
    }

    initThree() {
        const width = this.container.clientWidth || 400;
        const height = this.container.clientHeight || 340;

        // Scene & Studio Background
        this.scene = new THREE.Scene();

        // Camera - positioned to view into the Chawan from a 3/4 angle
        this.camera = new THREE.PerspectiveCamera(32, width / height, 0.05, 50);
        this.camera.position.set(0, 0.22, 0.36);
        this.camera.lookAt(new THREE.Vector3(0, 0.025, 0));

        // WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.4;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.container.appendChild(this.renderer.domElement);

        // Studio Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
        this.scene.add(ambientLight);

        const keyLight = new THREE.DirectionalLight(0xffffff, 2.6);
        keyLight.position.set(0.3, 0.5, 0.35);
        keyLight.castShadow = true;
        this.scene.add(keyLight);

        const fillLight = new THREE.DirectionalLight(0x86efac, 1.2); // Soft matcha rim
        fillLight.position.set(-0.35, 0.2, -0.1);
        this.scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xfef08a, 1.1); // Warm gold rim
        backLight.position.set(0, 0.4, -0.35);
        this.scene.add(backLight);

        // Subtle soft ground reflection
        const groundGeo = new THREE.CircleGeometry(0.35, 32);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x070c08,
            roughness: 0.8,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.015;
        this.scene.add(ground);

        // Resize Listener
        window.addEventListener('resize', () => this.onResize());

        // Render Loop
        this.render = this.render.bind(this);
        requestAnimationFrame(this.render);
    }

    onResize() {
        if (!this.container || !this.renderer || !this.camera) return;
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        if (width === 0 || height === 0) return;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    loadModels() {
        const loader = new GLTFLoader();

        // 1. Load Chawan (Katakuchi Bowl)
        loader.load(
            'assets/models/chawan-matcha.glb',
            (gltf) => {
                this.chawanScene = gltf.scene;
                this.chawanMesh = this.chawanScene.getObjectByName('Katakuchi_Chawan');
                this.pile1 = this.chawanScene.getObjectByName('Matcha_Chawan_Pile_1');
                this.pile2 = this.chawanScene.getObjectByName('Matcha_Chawan_Pile_2');

                // Ensure initial state: piles are hidden (scale: 0.0001)
                if (this.pile1) this.pile1.scale.set(0.0001, 0.0001, 0.0001);
                if (this.pile2) this.pile2.scale.set(0.0001, 0.0001, 0.0001);

                // Position Chawan on the workbench
                this.chawanScene.position.set(-0.04, -0.005, 0);
                this.chawanScene.rotation.set(0.18, -0.35, 0);

                this.scene.add(this.chawanScene);
            },
            undefined,
            (err) => console.error('Failed to load chawan-matcha.glb:', err)
        );

        // 2. Load Chashaku (Bamboo Scoop)
        loader.load(
            'assets/models/chashaku.glb',
            (gltf) => {
                this.chashakuScene = gltf.scene;
                this.chashakuHandle = this.chashakuScene.getObjectByName('Bamboo_Chashaku');
                this.chashakuHeap = this.chashakuScene.getObjectByName('Matcha_Scoop_Heap');

                // Initial heap visible (ready to scoop)
                if (this.chashakuHeap) this.chashakuHeap.scale.set(1, 1, 1);

                // Initial resting position beside the bowl
                this.chashakuScene.position.copy(this.restPos);
                this.chashakuScene.rotation.copy(this.restRot);

                this.scene.add(this.chashakuScene);
            },
            undefined,
            (err) => console.error('Failed to load chashaku.glb:', err)
        );
    }

    bindEvents() {
        const dom = this.renderer.domElement;
        let startClientX = 0;
        let startClientY = 0;
        let isPointerDown = false;
        let dragStartTime = 0;

        const updateMouseCoords = (clientX, clientY) => {
            const rect = dom.getBoundingClientRect();
            this.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        };

        const onStart = (clientX, clientY) => {
            if (this.isBusy || !this.chashakuScene) return;
            startClientX = clientX;
            startClientY = clientY;
            isPointerDown = true;
            dragStartTime = Date.now();

            updateMouseCoords(clientX, clientY);
            this.raycaster.setFromCamera(this.mouse, this.camera);

            const intersects = this.raycaster.intersectObjects(this.chashakuScene.children, true);
            if (intersects.length > 0) {
                this.isDragging = true;
                dom.style.cursor = 'grabbing';
                // Lift chashaku slightly when grabbed
                gsap.to(this.chashakuScene.position, { y: 0.05, duration: 0.2 });
            }
        };

        const onMove = (clientX, clientY) => {
            updateMouseCoords(clientX, clientY);

            // Hover cursor indicator
            if (!this.isDragging && this.chashakuScene) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                const hits = this.raycaster.intersectObjects(this.chashakuScene.children, true);
                dom.style.cursor = hits.length > 0 ? 'grab' : 'default';
            }

            if (!this.isDragging || !this.chashakuScene || this.isBusy) return;

            // Project mouse position onto drag plane
            this.raycaster.setFromCamera(this.mouse, this.camera);
            if (this.raycaster.ray.intersectPlane(this.dragPlane, this.planeIntersect)) {
                this.chashakuScene.position.x = this.planeIntersect.x;
                this.chashakuScene.position.z = this.planeIntersect.z;
                this.chashakuScene.position.y = 0.05; // Elevated in air

                // Calculate distance to Chawan
                const distToChawan = Math.hypot(
                    this.chashakuScene.position.x - (this.chawanScene ? this.chawanScene.position.x : -0.04),
                    this.chashakuScene.position.z - (this.chawanScene ? this.chawanScene.position.z : 0)
                );

                const hintElem = document.querySelector('#sim-drag-hint');
                if (distToChawan < 0.08) {
                    if (hintElem) hintElem.textContent = 'Lepas untuk menuang bubuk matcha';
                    // Angle towards the bowl
                    this.chashakuScene.rotation.z = 0.45;
                } else {
                    if (hintElem) hintElem.textContent = 'Drag Chashaku ke atas Chawan';
                    this.chashakuScene.rotation.z = 0.15;
                }
            }
        };

        const onEnd = (clientX, clientY) => {
            if (!isPointerDown) return;
            isPointerDown = false;
            dom.style.cursor = 'default';

            const elapsed = Date.now() - dragStartTime;
            const movedDist = Math.hypot(clientX - startClientX, clientY - startClientY);

            // 1. Direct Tap / Click on Chashaku (Quick click without drag)
            if (movedDist < 10 && elapsed < 350) {
                this.raycaster.setFromCamera(this.mouse, this.camera);
                if (this.chashakuScene) {
                    const hits = this.raycaster.intersectObjects(this.chashakuScene.children, true);
                    if (hits.length > 0) {
                        this.isDragging = false;
                        this.scoopIntoChawan();
                        return;
                    }
                }
            }

            // 2. Drag & Drop Release
            if (this.isDragging && this.chashakuScene) {
                this.isDragging = false;
                const chawanX = this.chawanScene ? this.chawanScene.position.x : -0.04;
                const chawanZ = this.chawanScene ? this.chawanScene.position.z : 0;
                const distToChawan = Math.hypot(
                    this.chashakuScene.position.x - chawanX,
                    this.chashakuScene.position.z - chawanZ
                );

                if (distToChawan < 0.09) {
                    // Dropped over Chawan: trigger scoop!
                    this.scoopIntoChawan();
                } else {
                    // Dropped elsewhere: return to rest
                    this.returnChashakuToRest();
                }
            }
        };

        // Pointer Events
        dom.addEventListener('pointerdown', (e) => onStart(e.clientX, e.clientY));
        window.addEventListener('pointermove', (e) => onMove(e.clientX, e.clientY));
        window.addEventListener('pointerup', (e) => onEnd(e.clientX, e.clientY));
        window.addEventListener('pointercancel', (e) => onEnd(e.clientX, e.clientY));

        // Quick scoop button
        const quickBtn = document.querySelector('#sim-scoop-action-btn');
        if (quickBtn) {
            quickBtn.addEventListener('click', () => {
                this.scoopIntoChawan();
            });
        }
    }

    /**
     * Executes the ceremonial scoop animation:
     * Chashaku moves over the Chawan, knocks over the rim, heap vanishes,
     * pile appears inside Chawan, then returns to rest.
     */
    scoopIntoChawan() {
        if (this.isBusy || !this.chashakuScene || !this.chawanScene) return;

        if (this.scoopCount >= 2) {
            // Already 2 scoops (max 3.6g)
            this.returnChashakuToRest();
            const hintElem = document.querySelector('#sim-drag-hint');
            if (hintElem) hintElem.textContent = 'Maksimal 2 sendok (3.6g Koicha tercapai)';
            return;
        }

        this.isBusy = true;
        const targetX = this.chawanScene.position.x + 0.025;
        const targetY = this.chawanScene.position.y + 0.065;
        const targetZ = this.chawanScene.position.z + 0.02;

        const tl = gsap.timeline({
            onComplete: () => {
                this.isBusy = false;
            }
        });

        // 1. Move Chashaku directly over Chawan bowl
        tl.to(this.chashakuScene.position, {
            x: targetX,
            y: targetY,
            z: targetZ,
            duration: 0.45,
            ease: 'power2.out'
        });

        tl.to(this.chashakuScene.rotation, {
            x: 0.15,
            y: -0.2,
            z: 0.65,
            duration: 0.35,
            ease: 'power2.out'
        }, '<');

        // 2. Knock / Tap over the rim (tilt into bowl)
        tl.to(this.chashakuScene.position, {
            y: targetY - 0.015,
            duration: 0.15,
            ease: 'power1.in'
        });

        tl.to(this.chashakuScene.rotation, {
            z: 0.85,
            duration: 0.15,
            ease: 'power1.in'
        }, '<');

        // 3. Chashaku heap vanishes & Pile grows in Chawan
        tl.add(() => {
            // Vanish heap on spoon
            if (this.chashakuHeap) {
                gsap.to(this.chashakuHeap.scale, {
                    x: 0.0001,
                    y: 0.0001,
                    z: 0.0001,
                    duration: 0.25,
                    ease: 'power1.in'
                });
            }

            // Grow pile in Chawan
            if (this.scoopCount === 0 && this.pile1) {
                gsap.to(this.pile1.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.35,
                    ease: 'back.out(1.4)'
                });
                this.scoopCount = 1;
                this.notifyScoopChange(1, 1.8);
            } else if (this.scoopCount === 1 && this.pile2) {
                gsap.to(this.pile2.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.35,
                    ease: 'back.out(1.4)'
                });
                this.scoopCount = 2;
                this.notifyScoopChange(2, 3.6);
            }
        });

        // 4. Subtle rebound after tapping rim
        tl.to(this.chashakuScene.position, {
            y: targetY + 0.02,
            duration: 0.2,
            ease: 'power2.out'
        }, '+=0.1');

        tl.to(this.chashakuScene.rotation, {
            z: 0.35,
            duration: 0.2,
            ease: 'power2.out'
        }, '<');

        // 5. Return Chashaku to rest
        tl.to(this.chashakuScene.position, {
            x: this.restPos.x,
            y: this.restPos.y,
            z: this.restPos.z,
            duration: 0.55,
            ease: 'power2.inOut'
        });

        tl.to(this.chashakuScene.rotation, {
            x: this.restRot.x,
            y: this.restRot.y,
            z: this.restRot.z,
            duration: 0.55,
            ease: 'power2.inOut'
        }, '<');

        // 6. Refill spoon heap if scoopCount < 2 (ready for next scoop)
        tl.add(() => {
            if (this.scoopCount < 2 && this.chashakuHeap) {
                gsap.to(this.chashakuHeap.scale, {
                    x: 1,
                    y: 1,
                    z: 1,
                    duration: 0.35,
                    ease: 'power2.out'
                });
            }
        });
    }

    returnChashakuToRest() {
        if (!this.chashakuScene) return;
        gsap.to(this.chashakuScene.position, {
            x: this.restPos.x,
            y: this.restPos.y,
            z: this.restPos.z,
            duration: 0.5,
            ease: 'power2.out'
        });
        gsap.to(this.chashakuScene.rotation, {
            x: this.restRot.x,
            y: this.restRot.y,
            z: this.restRot.z,
            duration: 0.5,
            ease: 'power2.out'
        });
        const hintElem = document.querySelector('#sim-drag-hint');
        if (hintElem) hintElem.textContent = 'Drag Chashaku ke atas Chawan';
    }

    notifyScoopChange(count, grams) {
        const hintElem = document.querySelector('#sim-drag-hint');
        if (hintElem) {
            hintElem.textContent = count === 1
                ? 'Sendokan 1 masuk (1.8g Usucha). Drag lagi untuk sendokan ke-2!'
                : 'Sendokan 2 masuk (3.6g Koicha). Formula matcha optimal!';
        }

        document.dispatchEvent(new CustomEvent('matcha:scoop-added', {
            detail: { count, grams }
        }));
    }

    reset() {
        this.scoopCount = 0;
        this.isBusy = false;

        // Reset piles in Chawan
        if (this.pile1) {
            gsap.to(this.pile1.scale, { x: 0.0001, y: 0.0001, z: 0.0001, duration: 0.3 });
        }
        if (this.pile2) {
            gsap.to(this.pile2.scale, { x: 0.0001, y: 0.0001, z: 0.0001, duration: 0.3 });
        }

        // Reset Chashaku heap & position
        if (this.chashakuHeap) {
            gsap.to(this.chashakuHeap.scale, { x: 1, y: 1, z: 1, duration: 0.3 });
        }
        this.returnChashakuToRest();

        const hintElem = document.querySelector('#sim-drag-hint');
        if (hintElem) hintElem.textContent = 'Drag Chashaku ke atas Chawan';
    }

    render() {
        if (this.renderer && this.scene && this.camera) {
            // Subtle breathing motion on Chawan when idle
            if (this.chawanScene && !this.isDragging) {
                const time = Date.now() * 0.0012;
                this.chawanScene.rotation.y = -0.35 + Math.sin(time) * 0.03;
            }
            this.renderer.render(this.scene, this.camera);
        }
        requestAnimationFrame(this.render);
    }
}
