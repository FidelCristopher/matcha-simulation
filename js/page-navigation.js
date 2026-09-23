/**
 * Horizontal Page Navigation (iPad Touch Swipe & Laptop Mouse/Trackpad Gestures)
 * Handles smooth transitions between #landing-page and #menu-page.
 */
export class PageNavigator {
    constructor() {
        this.slider = document.querySelector('#pages-slider');
        this.viewport = document.querySelector('#app-viewport');
        this.menuPage = document.querySelector('#menu-page');
        this.landingPage = document.querySelector('#landing-page');
        this.navLinks = document.querySelectorAll('.nav-item');
        this.swipeHint = document.querySelector('#swipe-to-menu-hint');
        this.backBtn = document.querySelector('#back-to-showcase');

        // Current Active Page: 'landing' or 'menu'
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

        // Default initial position: Landing page is active
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

        if (pageId === 'menu') {
            this.activePage = 'menu';
            document.body.classList.add('menu-active');
            // Menu is at x: 0 (left page)
            this.setSliderPosition(0, animate);
        } else {
            this.activePage = 'landing';
            document.body.classList.remove('menu-active');
            // Landing is at x: -100vw (right page)
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

            // Ensure horizontal intent
            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && Math.abs(deltaX) > this.dragThreshold) {
                // Swipe Left-to-Right: Go to Menu
                if (this.activePage === 'landing' && deltaX > this.dragThreshold) {
                    this.goToPage('menu');
                    this.isTouchSwiping = false;
                }
                // Swipe Right-to-Left: Go to Landing
                else if (this.activePage === 'menu' && deltaX < -this.dragThreshold) {
                    this.goToPage('landing');
                    this.isTouchSwiping = false;
                }
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isTouchSwiping = false;
        });
    }

    /**
     * 2. Laptop / Desktop Mouse Cursor Drag Gesture (Swipe with cursor)
     */
    bindMouseGestures() {
        window.addEventListener('mousedown', (e) => {
            // Ignore if clicking interactive controls like buttons, inputs, slider
            if (e.target.closest('button, input, a, .card, .explode-slider')) {
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

            // Check if user is dragging horizontally with intent
            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.2 && Math.abs(deltaX) > 15) {
                this.isMouseDragging = true;
                document.body.style.cursor = 'ew-resize';
            }

            if (this.isMouseDragging && Math.abs(deltaX) > this.dragThreshold) {
                // Cursor dragged from Left to Right: Go to Menu
                if (this.activePage === 'landing' && deltaX > this.dragThreshold) {
                    this.goToPage('menu');
                    this.isMouseDown = false;
                    this.isMouseDragging = false;
                    document.body.style.cursor = '';
                }
                // Cursor dragged from Right to Left: Go to Landing
                else if (this.activePage === 'menu' && deltaX < -this.dragThreshold) {
                    this.goToPage('landing');
                    this.isMouseDown = false;
                    this.isMouseDragging = false;
                    document.body.style.cursor = '';
                }
            }
        });

        window.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.isMouseDragging = false;
            document.body.style.cursor = '';
        });
    }

    /**
     * 3. Laptop Trackpad Two-Finger Horizontal Swipe
     */
    bindTrackpadGestures() {
        window.addEventListener('wheel', (e) => {
            const now = Date.now();
            if (now - this.lastWheelTime < 700 || this.isTransitioning) return;

            // Detect horizontal trackpad intent
            if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.4 && Math.abs(e.deltaX) > 30) {
                // Trackpad swipe to right (negative deltaX): Go to Menu
                if (this.activePage === 'landing' && e.deltaX < -30) {
                    this.lastWheelTime = now;
                    this.goToPage('menu');
                }
                // Trackpad swipe to left (positive deltaX): Go to Landing
                else if (this.activePage === 'menu' && e.deltaX > 30) {
                    this.lastWheelTime = now;
                    this.goToPage('landing');
                }
            }
        }, { passive: true });
    }

    bindButtons() {
        // Floating pill on the left: "Swipe / Drag → Menu"
        if (this.swipeHint) {
            this.swipeHint.addEventListener('click', () => {
                this.goToPage('menu');
            });
        }

        // Back button on Menu page
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => {
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
                } else if (target === '#home' || link.textContent.trim().toLowerCase().includes('home')) {
                    e.preventDefault();
                    this.goToPage('landing');
                }
            });
        });
    }

    bindKeyboard() {
        window.addEventListener('keydown', (e) => {
            // ArrowLeft / ArrowRight navigation
            if (e.key === 'ArrowRight' && this.activePage === 'landing') {
                this.goToPage('menu');
            } else if (e.key === 'ArrowLeft' && this.activePage === 'menu') {
                this.goToPage('landing');
            }
        });
    }

    updateNavUI() {
        this.navLinks.forEach(link => {
            const isMenuLink = link.dataset.target === '#menu' || link.textContent.trim().toLowerCase().includes('menu');
            const isHomeLink = link.dataset.target === '#home' || link.textContent.trim().toLowerCase().includes('home');

            if (this.activePage === 'menu') {
                if (isMenuLink) link.classList.add('active');
                else link.classList.remove('active');
            } else {
                if (isHomeLink) link.classList.add('active');
                else link.classList.remove('active');
            }
        });
    }
}
