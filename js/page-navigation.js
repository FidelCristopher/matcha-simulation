/**
 * Page Navigation Controller (Pantone Specimen Menu & Simulation)
 * Note: Home / Landing Showcase has been disabled per user request.
 *
 * Page 0: #menu-page (x: 0vw) [Default & Primary Screen]
 * Page 1: #simulation-page (x: -100vw)
 */
export class PageNavigator {
    constructor() {
        this.slider = document.querySelector('#pages-slider');
        this.viewport = document.querySelector('#app-viewport');
        this.menuPage = document.querySelector('#menu-page');
        this.simulationPage = document.querySelector('#simulation-page');
        this.navLinks = document.querySelectorAll('.nav-item');

        // Back Buttons
        this.backBtnMenu = document.querySelector('#back-to-showcase');
        this.backBtnSim = document.querySelector('#back-to-showcase-from-sim');

        // State: 'menu' | 'simulation' (Default: 'menu')
        this.activePage = 'menu';
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

        // Auto-detect page from URL (pathname, hash, or ?page=)
        const initialPage = this.getPageFromUrl();
        this.goToPage(initialPage, false, false);

        this.bindTouchGestures();
        this.bindMouseGestures();
        this.bindTrackpadGestures();
        this.bindButtons();
        this.bindKeyboard();
        this.bindUrlChanges();
    }

    getPageFromUrl() {
        const path = window.location.pathname.replace(/^\/|\/$/g, '').toLowerCase();
        const hash = window.location.hash.replace('#', '').toLowerCase();
        const search = new URLSearchParams(window.location.search).get('page')?.toLowerCase();

        if (path === 'simulation' || hash === 'simulation' || search === 'simulation') return 'simulation';
        return 'menu';
    }

    bindUrlChanges() {
        window.addEventListener('popstate', () => {
            const page = this.getPageFromUrl();
            this.goToPage(page, true, false);
        });
        window.addEventListener('hashchange', () => {
            const page = this.getPageFromUrl();
            this.goToPage(page, true, false);
        });
    }

    goToPage(pageId, animate = true, updateUrl = true) {
        if (this.isTransitioning && animate) return;

        // Home/landing is disabled: redirect to menu
        if (pageId === 'landing' || !pageId) {
            pageId = 'menu';
        }

        if (animate) {
            this.isTransitioning = true;
            setTimeout(() => {
                this.isTransitioning = false;
            }, 700);
        }

        const body = document.body;

        if (pageId === 'simulation') {
            this.activePage = 'simulation';
            body.classList.add('simulation-active');
            body.classList.remove('menu-active');
            // Simulation: -100vw next to Menu
            this.setSliderPosition(-100, animate);
            document.dispatchEvent(new CustomEvent('matcha:page-simulation'));
        } else {
            // Default: Menu Page
            this.activePage = 'menu';
            body.classList.add('menu-active');
            body.classList.remove('simulation-active');
            // Page 0 (Left): 0vw
            this.setSliderPosition(0, animate);
        }

        if (updateUrl && window.history && window.history.replaceState) {
            const targetHash = pageId === 'menu' ? '' : `#${pageId}`;
            const cleanPath = window.location.pathname.replace(/\/(menu|simulation|landing)$/, '') || '/';
            window.history.replaceState(null, '', targetHash ? `${cleanPath}${targetHash}` : cleanPath);
        }

        this.updateNavUI();

        // Dispatch page lifecycle event for performance-aware rendering
        document.dispatchEvent(new CustomEvent('matcha:page-change', { detail: { page: this.activePage } }));
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
                if (this.activePage === 'simulation') {
                    // Swipe Left-to-Right: Back to Menu
                    if (deltaX > this.dragThreshold) {
                        this.goToPage('menu');
                        this.isTouchSwiping = false;
                    }
                }
                // On menu page: horizontal gestures locked (Pantone grid is primary)
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
            // Ignore clicks on form inputs, buttons, sliders, links, cards
            if (e.target.closest('button, input, a, .pantone-card, .card, .sim-pill, .explode-slider, .sim-slider')) {
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
                if (this.activePage === 'simulation') {
                    // Dragged Left to Right: Back to Menu
                    if (deltaX > this.dragThreshold) {
                        this.goToPage('menu');
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
                if (this.activePage === 'simulation') {
                    if (e.deltaX < -30) {
                        this.lastWheelTime = now;
                        this.goToPage('menu');
                    }
                }
            }
        }, { passive: true });
    }

    bindButtons() {
        // Back button on Menu page (if any)
        if (this.backBtnMenu) {
            this.backBtnMenu.addEventListener('click', () => {
                this.goToPage('menu');
            });
        }

        // Back button on Simulation page
        if (this.backBtnSim) {
            this.backBtnSim.addEventListener('click', () => {
                this.goToPage('menu');
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
                    this.goToPage('menu');
                }
            });
        });
    }

    bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            if (this.activePage === 'simulation') {
                if (e.key === 'ArrowLeft') this.goToPage('menu');
            }
        });
    }

    updateNavUI() {
        this.navLinks.forEach(link => {
            const isMenuLink = link.dataset.target === '#menu' || link.textContent.trim().toLowerCase().includes('menu');
            const isSimLink = link.dataset.target === '#simulation' || link.textContent.trim().toLowerCase().includes('simulasi');

            link.classList.remove('active');

            if (this.activePage === 'menu' && isMenuLink) {
                link.classList.add('active');
            } else if (this.activePage === 'simulation' && isSimLink) {
                link.classList.add('active');
            }
        });
    }
}
