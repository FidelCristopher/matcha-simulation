/**
 * Main Application Bootstrapper
 */
import { initBubbles } from './bubbles.js';
import { ModelController } from './model-controller.js';
import { InteractionManager } from './interactions.js';
import { PageNavigator } from './page-navigation.js';
import { MatchaSimulator } from './matcha-simulation.js';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Micro-carbonation Bubbles
    initBubbles('#bubbles-container');

    // 2. Initialize 3D Model Layer Simulation Controller
    const modelController = new ModelController('#matcha-canvas-container');

    // 3. Initialize Interactive Physics & Flavor Transitions
    new InteractionManager(modelController);

    // 4. Initialize iPad Swipe & Page Navigation (Menu <-> Landing <-> Simulation)
    new PageNavigator();

    // 5. Initialize Interactive Matcha Crafting Simulation Lab
    new MatchaSimulator();
});
