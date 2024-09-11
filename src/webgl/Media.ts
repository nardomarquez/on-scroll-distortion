import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";
import { Sizes } from "../lib/types";

interface MediaProps {
  image: HTMLImageElement;
  scene: THREE.Scene;
  geometry: THREE.PlaneGeometry;
  screen: Sizes;
  viewport: Sizes;
  index: number;
  scroll: number;
}

export default class Media {
  image: HTMLImageElement;
  parent: HTMLElement;
  scene: THREE.Scene;
  geometry: THREE.PlaneGeometry;
  material: THREE.RawShaderMaterial;
  mesh: THREE.Mesh;
  screen: Sizes;
  viewport: Sizes;
  scroll: number;

  constructor({ image, scene, screen, viewport, scroll, geometry }: MediaProps) {
    this.image = image;
    this.parent = image.parentElement as HTMLElement;
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;
    this.scroll = scroll;

    // create mesh
    this.geometry = geometry;
    this.material = this.createMaterial();
    this.mesh = this.createMesh();

    this.onResize({ screen: this.screen, viewport: this.viewport });
  }

  createMaterial() {
    let texture = new THREE.TextureLoader().load(this.image.src);
    let material = new THREE.RawShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        tMap: { value: texture },
        uPlaneSizes: { value: [0, 0] },
        uImageSizes: { value: [0, 0] },
      },
    });
    material.uniforms.uImageSizes.value = [this.image.naturalWidth, this.image.naturalHeight];

    return material;
  }

  createMesh() {
    const mesh = new THREE.Mesh(this.geometry, this.material);
    this.scene.add(mesh);

    return mesh;
  }

  updateScale() {
    this.mesh.scale.x = (this.viewport.width * this.parent.offsetWidth) / this.screen.width;
    this.mesh.scale.y = (this.viewport.height * this.parent.offsetHeight) / this.screen.height;

    this.material.uniforms.uPlaneSizes.value = [this.mesh.scale.x, this.mesh.scale.y];
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
