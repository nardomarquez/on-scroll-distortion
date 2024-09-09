import * as THREE from "three";

const cameraDistance = 1;

export default class Scene {
  width: number;
  height: number;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;

  constructor() {
    // init
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, this.width / this.height, 0.1, 100);
    this.camera.fov = 2 * Math.atan(this.height / 2 / cameraDistance) * (180 / Math.PI);
    this.camera.position.set(0, 0, cameraDistance);

    // Renderer
    const container = document.querySelector(".webgl") as HTMLElement;
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      //   alpha: true,
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer.domElement);

    // methods
    this.createCube();
    this.resize();
    this.render();

    // events
    window.addEventListener("resize", () => this.resize());
  }

  createCube() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    this.scene.add(cube);
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.camera.aspect = this.width / this.height;
    this.camera.fov = 2 * Math.atan(this.height / 2 / cameraDistance) * (180 / Math.PI);
    this.renderer.setSize(this.width, this.height);
    this.camera.updateProjectionMatrix();
  }

  render() {
    requestAnimationFrame(() => this.render());
    this.renderer.render(this.scene, this.camera);
  }
}
