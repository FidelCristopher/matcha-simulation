/**
 * Micro-carbonation Rising Bubble Generator
 */
import { APP_CONFIG } from './config.js';

export function initBubbles(containerSelector = '#bubbles-container') {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const { minSize, maxSize, minDuration, maxDuration, minOpacity, maxOpacity, spawnIntervalMs } = APP_CONFIG.bubbles;

    function createBubble() {
        const bubble = document.createElement('img');
        bubble.src = 'assets/images/bubble.png';
        bubble.className = 'bubble-img';

        const size = Math.random() * (maxSize - minSize) + minSize;
        const duration = Math.random() * (maxDuration - minDuration) + minDuration;
        const opacity = Math.random() * (maxOpacity - minOpacity) + minOpacity;

        bubble.style.width = `${size}px`;
        bubble.style.height = 'auto';
        bubble.style.left = `${Math.random() * 100}%`;
        bubble.style.bottom = '-50px';
        bubble.style.opacity = opacity.toFixed(2);
        bubble.style.animation = `floatUpImg ${duration.toFixed(2)}s linear forwards`;

        container.appendChild(bubble);

        setTimeout(() => {
            bubble.remove();
        }, duration * 1000);
    }

    // Start interval
    const timer = setInterval(createBubble, spawnIntervalMs);

    return () => clearInterval(timer);
}
