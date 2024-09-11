import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";
import { Sizes } from "../lib/types";

interface MediaProps {
  image: HTMLImageElement;
  scene: THREE.Scene;
  screen: Sizes;
  viewport: Sizes;
  index: number;
  scroll: number;
}

export default class Media {
  image: HTMLImageElement;
  parent: HTMLElement;
  scene: THREE.Scene;
  mesh: THREE.Mesh;
  screen: Sizes;
  viewport: Sizes;
  scroll: number;

  constructor({ image, scene, screen, viewport, scroll }: MediaProps) {
    this.image = image;
    this.parent = image.parentElement as HTMLElement;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.scroll = scroll;

    // methods
    this.mesh = this.createMesh();

    this.onResize({ screen: this.screen, viewport: this.viewport });
  }

  createMesh() {
    let geometry = new THREE.PlaneGeometry(1, 1, 16, 16);
    let texture = new THREE.TextureLoader().load(this.image.src);

    let material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
      },
      // wireframe: true,
    });
    material.uniforms.uImageSizes.value = [this.image.naturalWidth, this.image.naturalHeight];

    const mesh = new THREE.Mesh(geometry, material);
    this.scene.add(mesh);

    return mesh;
  }

  updateScale() {
    this.mesh.scale.x = (this.viewport.width * this.parent.offsetWidth) / this.screen.width;
    this.mesh.scale.y = (this.viewport.height * this.parent.offsetHeight) / this.screen.height;
  }

  updateX(left = 0) {
    this.mesh.position.x =
      -(this.viewport.width / 2) +
      this.mesh.scale.x / 2 +
      left * (this.viewport.width / this.screen.width);
  }

  updateY(top = 0) {
    this.mesh.position.y =
      this.viewport.height / 2 -
      this.mesh.scale.y / 2 -
      (top - this.scroll) * (this.viewport.width / this.screen.width);
  }

  onScroll(scroll: number) {
    this.scroll = scroll;
    this.updateY(this.parent.offsetTop);
  }

  onResize(sizes: { screen: Sizes; viewport: Sizes }) {
    const { screen, viewport } = sizes;
    this.screen = screen;
    this.viewport = viewport;

    this.updateScale();
    this.updateX(this.parent.offsetLeft);
    this.updateY(this.parent.offsetTop);
  }
}
