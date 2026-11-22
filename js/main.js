/**
 * Main Application Bootstrapper
 */
import { initBubbles } from './bubbles.js';
import { ModelController } from './model-controller.js';
import { InteractionManager } from './interactions.js';
import { PageNavigator } from './page-navigation.js';
import { MatchaSimulator } from './matcha-simulation.js';
import { CartManager } from './cart.js';
import { I18nManager } from './i18n.js';
import { ThumbnailManager } from '../pages/thumbnail/thumbnail.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Page-Modular Thumbnail / Kiosk Welcome Screen (with 3D & Idle Timer)
    const thumbnailManager = new ThumbnailManager({ idleTimeoutMs: 90000 });
    window.thumbnailManager = thumbnailManager;

    // 2. Initialize Internationalization (Default: EN, toggleable to ID)
    const i18nManager = new I18nManager();
    window.i18nManager = i18nManager;

    // 3. Initialize Micro-carbonation Bubbles
    initBubbles('#bubbles-container');

    // 4. Initialize 3D Model Layer Simulation Controller
    const modelController = new ModelController('#matcha-canvas-container');

    // 5. Initialize Interactive Physics & Flavor Transitions
    new InteractionManager(modelController);

    // 6. Initialize iPad Swipe & Page Navigation (Menu <-> Landing <-> Simulation)
    const pageNav = new PageNavigator();

    // 7. Initialize Shopping Cart System & Pop-Up Modal
    const cartManager = new CartManager();
    window.cartManager = cartManager;

    // 8. Initialize Interactive Matcha Crafting Simulation Lab
    new MatchaSimulator(cartManager);

    // 9. When Kiosk resets to screensaver, close any open modal
    document.addEventListener('matcha:kiosk-reset', () => {
        if (cartManager && cartManager.isOpen()) {
            cartManager.close();
        }
    });
});
