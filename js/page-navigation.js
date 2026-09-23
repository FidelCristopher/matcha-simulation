/**
 * Horizontal 3-Page Navigation (Menu <-> Landing <-> Simulation)
 * Handles iPad Touch Swipe & Laptop Mouse/Trackpad Gestures.
 *
 * Page 0: #menu-page (x: 0)
 * Page 1: #landing-page (x: -100vw) [Default]
 * Page 2: #simulation-page (x: -200vw)
 */
export class PageNavigator {
    constructor() {
        this.slider = document.querySelector('#pages-slider');
        this.viewport = document.querySelector('#app-viewport');
        this.menuPage = document.querySelector('#menu-page');
        this.landingPage = document.querySelector('#landing-page');
        this.simulationPage = document.querySelector('#simulation-page');
        this.navLinks = document.querySelectorAll('.nav-item');

        // Floating Swipe Pills
        this.swipeHintMenu = document.querySelector('#swipe-to-menu-hint');
        this.swipeHintSim = document.querySelector('#swipe-to-sim-hint');

        // Back Buttons
        this.backBtnMenu = document.querySelector('#back-to-showcase');
        this.backBtnSim = document.querySelector('#back-to-showcase-from-sim');

        // State: 'menu' | 'landing' | 'simulation'
        this.activePage = 'landing';
        this.isTransitioning = false;

        // Touch Tracking for iPad & Mobile
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isTouchSwiping = false;

        // Mouse Drag Tracking for Laptop / Desktop Cursor
        this.mouseStartX = 0;
        this.mouseStartY = 0;
        this.isMouseDown = false;
        this.isMouseDragging = false;
        this.dragThreshold = 55; // Pixels needed to trigger slide

        // Trackpad wheel cooldown
        this.lastWheelTime = 0;

        this.init();
    }

    init() {
        if (!this.slider) return;

        // Default initial position: Landing page is active (center)
        this.goToPage('landing', false);

        this.bindTouchGestures();
        this.bindMouseGestures();
        this.bindTrackpadGestures();
        this.bindButtons();
        this.bindKeyboard();
    }

    goToPage(pageId, animate = true) {
        if (this.isTransitioning && animate) return;

        if (animate) {
            this.isTransitioning = true;
            setTimeout(() => {
                this.isTransitioning = false;
            }, 700);
        }

        const body = document.body;

        if (pageId === 'menu') {
            this.activePage = 'menu';
            body.classList.add('menu-active');
            body.classList.remove('simulation-active');
            // Page 0 (Left): 0vw
            this.setSliderPosition(0, animate);
        } else if (pageId === 'simulation') {
            this.activePage = 'simulation';
            body.classList.add('simulation-active');
            body.classList.remove('menu-active');
            // Page 2 (Right): -200vw
            this.setSliderPosition(-200, animate);
        } else {
            this.activePage = 'landing';
            body.classList.remove('menu-active', 'simulation-active');
            // Page 1 (Center): -100vw
            this.setSliderPosition(-100, animate);
        }

        this.updateNavUI();
    }

    setSliderPosition(percentX, animate = true) {
        if (!this.slider) return;
        if (!animate) {
            this.slider.style.transition = 'none';
            this.slider.style.transform = `translateX(${percentX}vw)`;
            void this.slider.offsetWidth;
            this.slider.style.transition = 'transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1)';
        } else {
            this.slider.style.transition = 'transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1)';
            this.slider.style.transform = `translateX(${percentX}vw)`;
        }
    }

    /**
     * 1. iPad & Touchscreen Swipe Gesture
     */
    bindTouchGestures() {
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isTouchSwiping = true;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!this.isTouchSwiping || e.touches.length !== 1 || this.isTransitioning) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;

            const deltaX = currentX - this.touchStartX;
            const deltaY = currentY - this.touchStartY;

            // Ensure clear horizontal intent
            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && Math.abs(deltaX) > this.dragThreshold) {
                if (this.activePage === 'landing') {
                    // Swipe Left-to-Right (deltaX > 0): Open Menu
                    if (deltaX > this.dragThreshold) {
                        this.goToPage('menu');
                        this.isTouchSwiping = false;
                    }
                    // Swipe Right-to-Left (deltaX < 0): Open Simulation
                    else if (deltaX < -this.dragThreshold) {
                        this.goToPage('simulation');
                        this.isTouchSwiping = false;
                    }
                } else if (this.activePage === 'menu') {
                    // Swipe Right-to-Left: Back to Landing
                    if (deltaX < -this.dragThreshold) {
                        this.goToPage('landing');
                        this.isTouchSwiping = false;
                    }
                } else if (this.activePage === 'simulation') {
                    // Swipe Left-to-Right: Back to Landing
                    if (deltaX > this.dragThreshold) {
                        this.goToPage('landing');
                        this.isTouchSwiping = false;
                    }
                }
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isTouchSwiping = false;
        });
    }

    /**
     * 2. Laptop / Desktop Mouse Cursor Drag Gesture
     */
    bindMouseGestures() {
        window.addEventListener('mousedown', (e) => {
            // Ignore clicks on form inputs, buttons, sliders, links
            if (e.target.closest('button, input, a, .card, .sim-pill, .explode-slider, .sim-slider')) {
                return;
            }

            this.mouseStartX = e.clientX;
            this.mouseStartY = e.clientY;
            this.isMouseDown = true;
            this.isMouseDragging = false;
        });

        window.addEventListener('mousemove', (e) => {
            if (!this.isMouseDown || this.isTransitioning) return;

            const deltaX = e.clientX - this.mouseStartX;
            const deltaY = e.clientY - this.mouseStartY;

            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && Math.abs(deltaX) > 15) {
                this.isMouseDragging = true;
                document.body.style.cursor = 'ew-resize';
            }

            if (this.isMouseDragging && Math.abs(deltaX) > this.dragThreshold) {
                if (this.activePage === 'landing') {
                    // Dragged Left to Right: Go to Menu
                    if (deltaX > this.dragThreshold) {
                        this.goToPage('menu');
                        this.resetMouse();
                    }
                    // Dragged Right to Left: Go to Simulation
                    else if (deltaX < -this.dragThreshold) {
                        this.goToPage('simulation');
                        this.resetMouse();
                    }
                } else if (this.activePage === 'menu') {
                    // Dragged Right to Left: Back to Landing
                    if (deltaX < -this.dragThreshold) {
                        this.goToPage('landing');
                        this.resetMouse();
                    }
                } else if (this.activePage === 'simulation') {
                    // Dragged Left to Right: Back to Landing
                    if (deltaX > this.dragThreshold) {
                        this.goToPage('landing');
                        this.resetMouse();
                    }
                }
            }
        });

        window.addEventListener('mouseup', () => {
            this.resetMouse();
        });
    }

    resetMouse() {
        this.isMouseDown = false;
        this.isMouseDragging = false;
        document.body.style.cursor = '';
    }

    /**
     * 3. Laptop Trackpad Two-Finger Horizontal Swipe
     */
    bindTrackpadGestures() {
        window.addEventListener('wheel', (e) => {
            const now = Date.now();
            if (now - this.lastWheelTime < 700 || this.isTransitioning) return;

            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4 && Math.abs(e.deltaX) > 30) {
                if (this.activePage === 'landing') {
                    // Trackpad swipe right (deltaX < -30): Go to Menu
                    if (e.deltaX < -30) {
                        this.lastWheelTime = now;
                        this.goToPage('menu');
                    }
                    // Trackpad swipe left (deltaX > 30): Go to Simulation
                    else if (e.deltaX > 30) {
                        this.lastWheelTime = now;
                        this.goToPage('simulation');
                    }
                } else if (this.activePage === 'menu') {
                    if (e.deltaX > 30) {
                        this.lastWheelTime = now;
                        this.goToPage('landing');
                    }
                } else if (this.activePage === 'simulation') {
                    if (e.deltaX < -30) {
                        this.lastWheelTime = now;
                        this.goToPage('landing');
                    }
                }
            }
        }, { passive: true });
    }

    bindButtons() {
        // Floating pill on the left: "Swipe -> Menu"
        if (this.swipeHintMenu) {
            this.swipeHintMenu.addEventListener('click', () => {
                this.goToPage('menu');
            });
        }

        // Floating pill on the right: "Simulasi Matcha <- Swipe"
        if (this.swipeHintSim) {
            this.swipeHintSim.addEventListener('click', () => {
                this.goToPage('simulation');
            });
        }

        // Back button on Menu page
        if (this.backBtnMenu) {
            this.backBtnMenu.addEventListener('click', () => {
                this.goToPage('landing');
            });
        }

        // Back button on Simulation page
        if (this.backBtnSim) {
            this.backBtnSim.addEventListener('click', () => {
                this.goToPage('landing');
            });
        }

        // Header Navigation links
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const target = link.dataset.target || link.getAttribute('href');
                if (target === '#menu' || link.textContent.trim().toLowerCase().includes('menu')) {
                    e.preventDefault();
                    this.goToPage('menu');
                } else if (target === '#simulation' || link.textContent.trim().toLowerCase().includes('simulasi')) {
                    e.preventDefault();
                    this.goToPage('simulation');
                } else if (target === '#home' || link.textContent.trim().toLowerCase().includes('home')) {
                    e.preventDefault();
                    this.goToPage('landing');
                }
            });
        });
    }

    bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (this.activePage === 'landing') {
                if (e.key === 'ArrowLeft') this.goToPage('menu');
                else if (e.key === 'ArrowRight') this.goToPage('simulation');
            } else if (this.activePage === 'menu') {
                if (e.key === 'ArrowRight') this.goToPage('landing');
            } else if (this.activePage === 'simulation') {
                if (e.key === 'ArrowLeft') this.goToPage('landing');
            }
        });
    }

    updateNavUI() {
        this.navLinks.forEach(link => {
            const isMenuLink = link.dataset.target === '#menu' || link.textContent.trim().toLowerCase().includes('menu');
            const isSimLink = link.dataset.target === '#simulation' || link.textContent.trim().toLowerCase().includes('simulasi');
            const isHomeLink = link.dataset.target === '#home' || link.textContent.trim().toLowerCase().includes('home');

            link.classList.remove('active');

            if (this.activePage === 'menu' && isMenuLink) {
                link.classList.add('active');
            } else if (this.activePage === 'simulation' && isSimLink) {
                link.classList.add('active');
            } else if (this.activePage === 'landing' && isHomeLink) {
                link.classList.add('active');
            }
        });
    }
}
