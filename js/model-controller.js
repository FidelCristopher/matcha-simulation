/**
 * 3D Model Controller for Google <model-viewer>
 */
import { APP_CONFIG } from './config.js';

export class ModelController {
    constructor(viewerSelector = '#product-model') {
        this.viewer = document.querySelector(viewerSelector);
        this.switchSpin = 0;
        this.isReady = false;
        this.init();
    }

    init() {
        if (!this.viewer) return;

        this.viewer.addEventListener('load', () => {
            this.isReady = true;
            this.warmupMaterials();
        });
    }

    warmupMaterials() {
        try {
            if (this.viewer.model && this.viewer.model.materials) {
                // Ensure initial PBR factor is set
                this.viewer.model.materials.forEach(mat => {
                    if (mat.pbrMetallicRoughness) {
                        mat.pbrMetallicRoughness.setBaseColorFactor([1.0, 1.0, 1.0, 1.0]);
                    }
                });
            }
        } catch (err) {
            console.warn('Model shader warmup:', err);
        }
    }

    updateTilt(currentMouse) {
        if (!this.viewer) return;
        const { orbitDistance, fieldOfView, tiltFactorX, tiltFactorY } = APP_CONFIG.camera;
        const orbitX = (currentMouse.x * tiltFactorX) + this.switchSpin;
        const orbitY = 90 + (currentMouse.y * tiltFactorY);

        this.viewer.cameraOrbit = `${orbitX}deg ${orbitY}deg ${orbitDistance}`;
    }

    applyFlavorTone(flavorId) {
        const flavor = APP_CONFIG.flavors[flavorId];
        if (!flavor || !this.viewer.model) return;

        this.viewer.model.materials.forEach(mat => {
            if (mat.pbrMetallicRoughness) {
                mat.pbrMetallicRoughness.setBaseColorFactor(flavor.modelBaseColorFactor);
            }
        });
    }
}
