import * as THREE from "three";
import Media from "./Media";
import { Sizes } from "../lib/types";
import Mouse from "./Mouse";

const cameraDistance = 10;

export default class WebGL {
  screen: Sizes;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  medias: Media[];
  mouse: Mouse;

  constructor() {
    this.mouse = new Mouse();
    this.screen = { width: window.innerWidth, height: window.innerHeight };

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, this.screen.width / this.screen.height, 0.1, 100);
    this.camera.position.z = cameraDistance;

    // Renderer
    const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // initial resize
    this.onResize();

    // create medias
    let images = [...document.querySelectorAll("img")];
    this.medias = this.createMedias(images);

    this.update();

    this.addEventListeners();
  }

  createMedias(images: HTMLImageElement[]): Media[] {
    // use the same geometry for all medias
    let geometry = new THREE.PlaneGeometry(1, 1, 16, 16);

    return images.map(
      (image) =>
        new Media({
          image: image,
          geometry: geometry,
          scene: this.scene,
          screen: this.screen,
        })
    );
  }

  update() {
    if (this.medias) {
      this.medias.forEach((media) => media.update({ cursorPos: this.mouse.cursorPos, time: 0 }));
    }

    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.update.bind(this));
  }

  onResize() {
    this.screen = { width: window.innerWidth, height: window.innerHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);

    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.fov = 2 * Math.atan(this.screen.height / 2 / cameraDistance) * (180 / Math.PI);

    this.camera.updateProjectionMatrix();
  }

  onScroll({ scroll, velocity }: { scroll: number; velocity: number }) {
    if (this.medias) {
      this.medias.forEach((media) => media.onScroll({ scroll, velocity }));
    }
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
  }
}
