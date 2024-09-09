import * as THREE from "three";
import Item from "./Item";
import Lenis from "lenis";
import { Sizes } from "../lib/types";

const cameraDistance = 1;

export default class WebGL {
  sizes: Sizes;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  lenis: Lenis;
  currentScroll: number;
  items: Item[];

  constructor() {
    // scroll init
    window.scrollTo(0, 0);
    this.lenis = new Lenis();
    this.currentScroll = this.lenis.scroll;

    // init
    const canvas = document.querySelector("canvas.webgl") as HTMLCanvasElement;
    this.sizes = { width: window.innerWidth, height: window.innerHeight };

    // Scene
    this.scene = new THREE.Scene();

    // Camera
    this.camera = new THREE.PerspectiveCamera(70, this.sizes.width / this.sizes.height, 0.1, 100);
    this.camera.fov = 2 * Math.atan(this.sizes.height / 2 / cameraDistance) * (180 / Math.PI);
    this.camera.position.set(0, 0, cameraDistance);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // create items
    let images = [...document.querySelectorAll("img")];
    this.items = this.createItems(images);

    // methods
    this.resize();
    this.render();

    // events
    window.addEventListener("resize", this.resize.bind(this));
    window.addEventListener("scroll", () => {
      this.currentScroll = this.lenis.scroll;
    });
  }

  createItems(images: HTMLImageElement[]): Item[] {
    return images.map((image) => {
      const item = new Item({
        image: image,
        sizes: { width: this.sizes.width, height: this.sizes.height },
        currentScroll: this.currentScroll,
      });

      if (item.imageData) {
        this.scene.add(item.imageData.mesh);
      }

      return item;
    });
  }

  resize() {
    this.sizes.width = window.innerWidth;
    this.sizes.height = window.innerHeight;
    this.camera.aspect = this.sizes.width / this.sizes.height;
    this.camera.fov = 2 * Math.atan(this.sizes.height / 2 / cameraDistance) * (180 / Math.PI);
    this.renderer.setSize(this.sizes.width, this.sizes.height);
    this.camera.updateProjectionMatrix();
  }

  render() {
    requestAnimationFrame((e) => {
      this.lenis.raf(e);
      this.items.forEach((item) => item.render());
      this.renderer.render(this.scene, this.camera);

      this.render();
    });
  }
}
