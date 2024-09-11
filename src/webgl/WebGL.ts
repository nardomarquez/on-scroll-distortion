import * as THREE from "three";
import Media from "./Media";
import { Sizes } from "../lib/types";

const cameraDistance = 10;

export default class WebGL {
  screen: Sizes;
  viewport: Sizes;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  scroll: number;
  medias: Media[];

  constructor() {
    this.scroll = window.scrollY;

    // sizes
    this.screen = { width: window.innerWidth, height: window.innerHeight };
    this.viewport = { width: 0, height: 0 };

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

    // events
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("scroll", () => {
      this.onScroll();
    });
  }

  createMedias(images: HTMLImageElement[]): Media[] {
    return images.map((image, index) => {
      const media = new Media({
        image: image,
        scene: this.scene,
        screen: this.screen,
        viewport: this.viewport,
        scroll: this.scroll,
        index,
      });

      return media;
    });
  }

  update() {
    this.renderer.render(this.scene, this.camera);
    window.requestAnimationFrame(this.update.bind(this));
  }

  onResize() {
    this.screen = { width: window.innerWidth, height: window.innerHeight };
    this.renderer.setSize(this.screen.width, this.screen.height);
    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = { width, height };

    if (this.medias) {
      this.medias.forEach((media) =>
        media.onResize({
          screen: this.screen,
          viewport: this.viewport,
        })
      );
      this.onScroll(window.scrollY);
    }
  }

  onScroll(scroll: number = window.scrollY) {
    if (this.medias) {
      this.medias.forEach((media) => media.onScroll(scroll));
    }
  }
}
