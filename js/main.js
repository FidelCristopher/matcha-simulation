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

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Internationalization (Default: EN, toggleable to ID)
    const i18nManager = new I18nManager();
    window.i18nManager = i18nManager;

    // 2. Initialize Micro-carbonation Bubbles
    initBubbles('#bubbles-container');

    // 2. Initialize 3D Model Layer Simulation Controller
    const modelController = new ModelController('#matcha-canvas-container');

    // 3. Initialize Interactive Physics & Flavor Transitions
    new InteractionManager(modelController);

    // 4. Initialize iPad Swipe & Page Navigation (Menu <-> Landing <-> Simulation)
    new PageNavigator();

    // 5. Initialize Shopping Cart System & Pop-Up Modal
    const cartManager = new CartManager();
    window.cartManager = cartManager;

    // 6. Initialize Interactive Matcha Crafting Simulation Lab
    new MatchaSimulator(cartManager);
});
