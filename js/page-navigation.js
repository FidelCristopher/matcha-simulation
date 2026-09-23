/**
 * Horizontal Page Navigation (iPad Swipe & Responsive Viewport Slider)
 * Handles transitions between #landing-page and #menu-page.
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

        // Touch Tracking for iPad
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isSwiping = false;

        this.init();
    }

    init() {
        if (!this.slider) return;

        // Default initial position: Landing page is active
        this.goToPage('landing', false);

        this.bindTouchGestures();
        this.bindButtons();
        this.bindKeyboard();
    }

    goToPage(pageId, animate = true) {
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
            // Force reflow
            void this.slider.offsetWidth;
            this.slider.style.transition = 'transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1)';
        } else {
            this.slider.style.transition = 'transform 0.65s cubic-bezier(0.2, 0.8, 0.2, 1)';
            this.slider.style.transform = `translateX(${percentX}vw)`;
        }
    }

    bindTouchGestures() {
        // Touch events on the viewport for iPad gesture detection
        window.addEventListener('touchstart', (e) => {
            if (e.touches.length !== 1) return;
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.isSwiping = true;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!this.isSwiping || e.touches.length !== 1) return;
            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;

            const deltaX = currentX - this.touchStartX;
            const deltaY = currentY - this.touchStartY;

            // Ensure horizontal intent
            if (Math.abs(deltaX) > Math.abs(deltaY) * 1.3 && Math.abs(deltaX) > 60) {
                // Swipe Left-to-Right (deltaX > 0): Switch from Landing to Menu
                if (this.activePage === 'landing' && deltaX > 60) {
                    this.goToPage('menu');
                    this.isSwiping = false;
                }
                // Swipe Right-to-Left (deltaX < 0): Switch from Menu to Landing
                else if (this.activePage === 'menu' && deltaX < -60) {
                    this.goToPage('landing');
                    this.isSwiping = false;
                }
            }
        }, { passive: true });

        window.addEventListener('touchend', () => {
            this.isSwiping = false;
        });
    }

    bindButtons() {
        // Floating pill on the left: "Swipe → Menu"
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
            // ArrowLeft / ArrowRight quick desktop testing
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
