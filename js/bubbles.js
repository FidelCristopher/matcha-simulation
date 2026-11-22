/**
 * Micro-carbonation Rising Bubble Generator
 */
import { APP_CONFIG } from './config.js';

export function initBubbles(containerSelector = '#bubbles-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    let isRunning = false;
    let timer = null;
    const { minSize, maxSize, minDuration, maxDuration, minOpacity, maxOpacity, spawnIntervalMs } = APP_CONFIG.bubbles;

    function createBubble() {
        if (!isRunning) return;
        const bubble = document.createElement('img');
        bubble.src = 'assets/images/bubble.webp';
        bubble.className = 'bubble-img';

        const size = Math.round(Math.random() * (maxSize - minSize) + minSize);
        const duration = Math.random() * (maxDuration - minDuration) + minDuration;
        const opacity = Math.random() * (maxOpacity - minOpacity) + minOpacity;

        bubble.width = size;
        bubble.height = size;
        bubble.alt = '';
        bubble.setAttribute('aria-hidden', 'true');
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.bottom = '-50px';
        bubble.style.opacity = opacity.toFixed(2);
        bubble.style.animation = `floatUpImg ${duration.toFixed(2)}s linear forwards`;

        container.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, duration * 1000);
    }

    function start() {
        if (isRunning) return;
        isRunning = true;
        if (!timer) {
            timer = setInterval(createBubble, spawnIntervalMs);
        }
    }

    function stop() {
        isRunning = false;
        if (timer) {
            clearInterval(timer);
            timer = null;
        }
        if (container) {
            container.innerHTML = '';
        }
    }

    // Only run bubbles when entering the ordering application
    document.addEventListener('matcha:kiosk-start', start);
    document.addEventListener('matcha:kiosk-reset', stop);

    // If kiosk is already active at launch, start immediately
    if (window.thumbnailManager && window.thumbnailManager.isKioskActive) {
        start();
    }

    return () => {
        stop();
        document.removeEventListener('matcha:kiosk-start', start);
        document.removeEventListener('matcha:kiosk-reset', stop);
    };
}
