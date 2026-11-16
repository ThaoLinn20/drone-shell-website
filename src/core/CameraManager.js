import * as THREE from 'three';

export class CameraManager {
  constructor() {
    this.instance = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
    this.updateCameraLayout();

    window.addEventListener('resize', this.onResize.bind(this));
    if (typeof window !== 'undefined' && window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.onResize.bind(this));
    }
  }

  updateCameraLayout() {
    const width = (typeof window !== 'undefined' && window.visualViewport)
      ? window.visualViewport.width
      : window.innerWidth;
    const height = (typeof window !== 'undefined' && window.visualViewport)
      ? window.visualViewport.height
      : window.innerHeight;

    const isMobilePortrait = width < height && width <= 768;

    if (isMobilePortrait) {
      // Mobile portrait: pull back slightly and widen FOV to capture entire show
      this.instance.position.set(0, 75, 540);
      this.instance.fov = 80;
    } else {
      this.instance.position.set(0, 70, 420);
      this.instance.fov = 75;
    }

    this.instance.rotation.x = -0.04;
    this.instance.aspect = width / height;
    this.instance.updateProjectionMatrix();
  }

  onResize() {
    this.updateCameraLayout();
  }
}
