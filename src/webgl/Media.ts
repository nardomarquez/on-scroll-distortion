import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";
import { Sizes } from "../lib/types";

interface MediaProps {
  image: HTMLImageElement;
  geometry: THREE.PlaneGeometry;
  screen: Sizes;
  scene: THREE.Scene;
}

export default class Media {
  image: HTMLImageElement;
  geometry: THREE.PlaneGeometry;
  screen: Sizes;
  scroll: number;
  material: THREE.RawShaderMaterial;
  mesh: THREE.Mesh;

  constructor({ image, screen, geometry, scene }: MediaProps) {
    this.image = image;
    this.screen = screen;
    this.scroll = 0;

    // create mesh
    this.geometry = geometry;
    this.material = this.createMaterial();
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    scene.add(this.mesh);

    // set mesh's initial position and scale
    this.onResize();

    this.addEventListeners();
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
      wireframe: true,
    });
    material.uniforms.uImageSizes.value = [this.image.naturalWidth, this.image.naturalHeight];

    return material;
  }

  updatePosition() {
    this.mesh.position.x =
      this.image.offsetLeft - this.screen.width / 2 + this.image.offsetWidth / 2;
    this.mesh.position.y =
      this.scroll - this.image.offsetTop + this.screen.height / 2 - this.image.offsetHeight / 2;
  }

  updateScale() {
    this.mesh.scale.x = this.image.offsetWidth;
    this.mesh.scale.y = this.image.offsetHeight;

    this.material.uniforms.uPlaneSizes.value = [this.mesh.scale.x, this.mesh.scale.y];
  }

  onResize() {
    this.screen = { width: window.innerWidth, height: window.innerHeight };
    this.updatePosition();
    this.updateScale();
  }

  onScroll(scroll: number) {
    this.scroll = scroll;
    this.updatePosition();
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
  }
}
