import * as THREE from 'three';
import { renderingConfig } from '../config/rendering.js';

export class Renderer {
  constructor() {
    this.resizeListeners = [];
    this.instance = new THREE.WebGLRenderer({
      antialias: renderingConfig.renderer.antialias,
      alpha: false
    });

    this.instance.outputColorSpace = THREE.SRGBColorSpace;
    this.instance.toneMapping = THREE.ACESFilmicToneMapping;
    this.instance.toneMappingExposure = renderingConfig.renderer.exposure;
    this.instance.physicallyCorrectLights = true;

    this.updateDimensions();
    
    // Important for Three.js environments that we append the DOM
    document.body.appendChild(this.instance.domElement);

    window.addEventListener('resize', this.onResize.bind(this));
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.onResize.bind(this));
    }
  }

  getEffectivePixelRatio() {
    const isMobile = typeof window !== 'undefined' && (
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );
    const maxDpr = isMobile ? 1.5 : (renderingConfig.renderer.maxPixelRatio || 2);
    return Math.min(window.devicePixelRatio || 1, maxDpr);
  }

  updateDimensions() {
    const width = (typeof window !== 'undefined' && window.visualViewport)
      ? window.visualViewport.width
      : window.innerWidth;
    const height = (typeof window !== 'undefined' && window.visualViewport)
      ? window.visualViewport.height
      : window.innerHeight;

    this.instance.setSize(width, height);
    this.instance.setPixelRatio(this.getEffectivePixelRatio());
    return { width, height };
  }

  addResizeListener(listener) {
    this.resizeListeners.push(listener);
  }

  onResize() {
    const { width, height } = this.updateDimensions();

    for (const listener of this.resizeListeners) {
      listener(width, height, this.instance.getPixelRatio());
    }
  }

  render(scene, camera) {
    this.instance.render(scene, camera);
  }
}
