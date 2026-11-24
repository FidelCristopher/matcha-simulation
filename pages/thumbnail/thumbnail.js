/**
 * Thumbnail / Welcome Attract Screen Manager (Kiosk Mode - MA-TEA Animation Engine)
 * - Color Palette: Phthalo Green (#103713), Maximum Green (#628B35), Bone (#E2DBD0), Milk (#FFFDF5)
 * - Exact MA-TEA Bottle Entrance Animation (Slide-in from bottom, angled overshoot, resting duo)
 * - Silky smooth continuous idle floating bobbing (decoupled on inner wrappers)
 * - Interactive 2.5D multi-plane depth parallax (lerped mouse & touch tracking)
 * - Kiosk Screensaver Auto-Reset & Re-triggering of entrance animation
 */

export class ThumbnailManager {
    constructor(options = {}) {
        // Idle timeout in milliseconds (Default: 90 seconds = 90000ms)
        this.idleTimeoutMs = options.idleTimeoutMs || 90000;
        this.idleTimer = null;
        this.isKioskActive = false;

        // DOM elements
        this.screen = document.querySelector('#thumbnail-screen');
        this.cupsStage = document.querySelector('#thumb-cups-stage');
        this.cupLeft = document.querySelector('.thumb-cup-card.cup-left');
        this.cupRight = document.querySelector('.thumb-cup-card.cup-right');
        this.doodles = document.querySelector('.thumb-doodles-svg');
        this.backdropTitle = document.querySelector('.thumb-backdrop-title');
        this.returnBtn = document.querySelector('#kiosk-return-btn');

        // Smooth Parallax Physics State (Lerp interpolation)
        this.targetX = 0;
        this.targetY = 0;
        this.currentX = 0;
        this.currentY = 0;
        this.rafId = null;
        this.isEntranceComplete = false;

        this.init();
    }

    init() {
        if (!this.screen) return;

        // Ensure thumbnail screen is visible on page load/refresh
        this.screen.style.display = '';
        this.screen.classList.remove('hidden');
        this.isKioskActive = false;

        // 1. Trigger Initial MA-TEA Entrance Animation Sequence
        this.playEntranceAnimation();

        // 2. Bind screen enter & tap anywhere listeners
        this.bindEvents();

        // 3. Bind interactive 2.5D multi-plane depth parallax
        this.initParallax();

        // 4. Bind global inactivity / idle listeners for kiosk auto-reset
        this.setupIdleTimer();
    }

    /**
     * Plays the MA-TEA entrance slide-in animation from the bottom smoothly (zero double-blink)
     */
    playEntranceAnimation() {
        if (!this.screen) return;

        this.isEntranceComplete = false;
        // Clear any inline transform overrides from parallax so CSS keyframes run cleanly on GPU
        if (this.cupsStage) this.cupsStage.style.transform = '';
        if (this.doodles) this.doodles.style.transform = '';
        if (this.backdropTitle) this.backdropTitle.style.transform = '';
        if (this.cupLeft) this.cupLeft.style.transform = '';
        if (this.cupRight) this.cupRight.style.transform = '';
        const tagLeft = this.screen.querySelector('.thumb-cup-tag.tag-left');
        const tagRight = this.screen.querySelector('.thumb-cup-tag.tag-right');
        if (tagLeft) tagLeft.style.transform = '';
        if (tagRight) tagRight.style.transform = '';
        const stickers = this.screen.querySelectorAll('.thumb-sticker');
        stickers.forEach(s => s.style.transform = '');

        this.screen.classList.remove('idle-active');

        if (!this.screen.classList.contains('play-anim')) {
            // Initial page load: trigger animation cleanly without double-reflow or flash
            requestAnimationFrame(() => {
                this.screen.classList.add('play-anim');
            });
        } else {
            // Screensaver reset: reflow to restart frame 0
            this.screen.classList.remove('play-anim');
            void this.screen.offsetWidth;
            this.screen.classList.add('play-anim');
        }

        // After entrance animation completes (~1500ms), transition smoothly to gentle idle floating & enable interactive parallax
        setTimeout(() => {
            if (!this.isKioskActive && this.screen) {
                this.screen.classList.add('idle-active');
                this.isEntranceComplete = true;
            }
        }, 1500);
    }

    /**
     * 2.5D Multi-Plane Interactive Depth Parallax (Mouse & Touch)
     */
    initParallax() {
        if (!this.cupsStage) return;

        const onPointerMove = (clientX, clientY) => {
            if (this.isKioskActive) return;
            this.targetX = (clientX / window.innerWidth) - 0.5;
            this.targetY = (clientY / window.innerHeight) - 0.5;
        };

        // Desktop Mouse Move
        window.addEventListener('mousemove', (e) => {
            onPointerMove(e.clientX, e.clientY);
        }, { passive: true });

        // Touch Drag on Kiosk Screen
        window.addEventListener('touchmove', (e) => {
            if (e.touches && e.touches.length > 0) {
                onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });

        // Reset to center on pointer leave
        document.addEventListener('mouseleave', () => {
            this.targetX = 0;
            this.targetY = 0;
        });

        window.addEventListener('touchend', () => {
            this.targetX = 0;
            this.targetY = 0;
        });

        // 60-120FPS Lerp Animation Loop (Runs ONLY when Kiosk Welcome Screen is active)
        this.renderLoop = () => {
            if (this.isKioskActive) {
                this.rafId = null;
                return;
            }

            if (this.cupsStage && this.isEntranceComplete) {
                // Smooth damping (lerp factor = 0.08)
                this.currentX += (this.targetX - this.currentX) * 0.08;
                this.currentY += (this.targetY - this.currentY) * 0.08;

                const hasOffset = Math.abs(this.currentX) > 0.0005 || Math.abs(this.currentY) > 0.0005;
                if (hasOffset) {
                    const rotY = this.currentX * 14;
                    const rotX = -this.currentY * 10;

                    // 3D perspective tilt on cup stage
                    this.cupsStage.style.transform = `perspective(1200px) rotateY(${rotY.toFixed(2)}deg) rotateX(${rotX.toFixed(2)}deg)`;

                    // Multi-plane translation depth once entrance animation is settled
                    if (this.cupLeft) {
                        const shiftX = this.currentX * 8;
                        const shiftY = this.currentY * 6;
                        this.cupLeft.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0px) rotate(-6deg)`;
                    }

                    if (this.cupRight) {
                        const shiftX = this.currentX * 18;
                        const shiftY = this.currentY * 12;
                        this.cupRight.style.transform = `translate3d(${shiftX.toFixed(2)}px, ${(shiftY + 12).toFixed(2)}px, 20px) rotate(7deg)`;
                    }

                    // Counter-shift background vector doodles
                    if (this.doodles) {
                        const dX = -this.currentX * 24;
                        const dY = -this.currentY * 16;
                        this.doodles.style.transform = `translate3d(calc(-50% + ${dX.toFixed(2)}px), calc(-50% + ${dY.toFixed(2)}px), 0)`;
                    }

                    // Midground 2.5D parallax shift for blurred "MATCHA" watermark
                    if (this.backdropTitle) {
                        const tX = this.currentX * 14;
                        const tY = this.currentY * 10;
                        this.backdropTitle.style.transform = `translate3d(calc(-50% + ${tX.toFixed(2)}px), calc(-50% + ${tY.toFixed(2)}px), 0)`;
                    }
                }
            }

            this.rafId = requestAnimationFrame(this.renderLoop);
        };

        this.rafId = requestAnimationFrame(this.renderLoop);
    }

    /**
     * Binds Click / Tap Events to Enter the Website
     */
    bindEvents() {
        // Tapping anywhere on the thumbnail screen enters the app
        this.screen.addEventListener('click', () => {
            this.enterApp();
        });

        // Return button from the ordering app back to screensaver
        if (this.returnBtn) {
            this.returnBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showScreensaver();
            });
        }
    }

    /**
     * Customer taps: Transition out of thumbnail and into website
     */
    enterApp() {
        if (!this.screen) return;
        this.screen.classList.add('hidden');
        this.isKioskActive = true;

        // Cancel parallax RAF to free up 100% GPU budget for the app
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }

        // Reset and activate the inactivity timer
        this.resetIdleTimer();

        // Direct entrance / page navigation to menu page
        const isPages = window.location.pathname.includes('/pages/');
        const targetMenuUrl = isPages ? '../menu/menu.html' : 'pages/menu/menu.html';
        window.location.href = targetMenuUrl;

        // Dispatch custom event for application components
        document.dispatchEvent(new CustomEvent('matcha:kiosk-start'));
    }

    /**
     * Inactivity timer / return button: returns smoothly back to thumbnail screen
     * and replays the MA-TEA slide-in entrance animation afresh!
     */
    showScreensaver() {
        if (!this.screen) return;
        this.screen.style.display = '';
        this.screen.classList.remove('hidden');
        this.isKioskActive = false;

        // Resume parallax RAF loop if not running
        if (!this.rafId && this.renderLoop) {
            this.rafId = requestAnimationFrame(this.renderLoop);
        }

        // Replay full entrance animation
        this.playEntranceAnimation();

        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
            this.idleTimer = null;
        }

        // Dispatch reset event so cart modal closes and state resets
        document.dispatchEvent(new CustomEvent('matcha:kiosk-reset'));
    }

    /**
     * Sets up global activity listeners for the inactivity timeout
     */
    setupIdleTimer() {
        const resetEvents = ['pointerdown', 'mousemove', 'keydown', 'touchstart', 'scroll'];

        resetEvents.forEach((evt) => {
            window.addEventListener(evt, () => {
                if (this.isKioskActive) {
                    this.resetIdleTimer();
                }
            }, { passive: true });
        });
    }

    resetIdleTimer() {
        if (this.idleTimer) {
            clearTimeout(this.idleTimer);
        }

        this.idleTimer = setTimeout(() => {
            // Customer has been idle for the timeout duration -> return to thumbnail!
            this.showScreensaver();
        }, this.idleTimeoutMs);
    }
}
