/**
 * App Configuration & Flavor Presets
 */
export const APP_CONFIG = {
    // 3D Camera Configuration
    camera: {
        orbitBaseAngle: 0,
        orbitBaseElevation: 90,
        orbitDistance: '280%',
        fieldOfView: '30deg',
        tiltFactorX: 40,
        tiltFactorY: 20,
        lerpFactor: 0.05
    },

    // Parallax Multipliers for Layers
    parallax: {
        foreground: 60,
        background: -30,
        leaves: -15
    },

    // Pointer Repulsion Physics
    repulsion: {
        radius: 400,
        strength: -80,
        lerp: 0.1,
        speedMultiplierBase: 1,
        speedMultiplierForce: 5
    },

    // Micro-carbonation Bubbles
    bubbles: {
        spawnIntervalMs: 400,
        minSize: 10,
        maxSize: 30,
        minDuration: 4,
        maxDuration: 10,
        minOpacity: 0.2,
        maxOpacity: 0.65
    },

    // Flavor Configurations
    flavors: {
        classic: {
            id: 'classic',
            name: 'Ceremonial Uji',
            price: '$3.49',
            themeClass: '',
            colors: {
                inner: '#1f4f2c',
                mid: '#102d18',
                outer: '#040e07'
            },
            modelBaseColorFactor: [1.0, 1.0, 1.0, 1.0],
            botanicalModel: 'assets/models/cherry.glb'
        },
        yuzu: {
            id: 'yuzu',
            name: 'Matcha Yuzu',
            price: '$3.49',
            themeClass: 'yuzu-theme',
            colors: {
                inner: '#3a5818',
                mid: '#22370c',
                outer: '#091203'
            },
            modelBaseColorFactor: [0.95, 1.0, 0.7, 1.0],
            botanicalModel: 'assets/models/blueberry.glb'
        }
    }
};
