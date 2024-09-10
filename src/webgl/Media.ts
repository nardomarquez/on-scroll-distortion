import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";
import { Sizes } from "../lib/types";

interface MediaProps {
  image: HTMLImageElement;
  sizes: Sizes;
  currentScroll: number;
}

export default class Media {
  image: HTMLImageElement;
  sizes: Sizes;
  imageData: {
    image: HTMLImageElement;
    mesh: THREE.Mesh;
    material: THREE.RawShaderMaterial;
    top: number;
    left: number;
    width: number;
    height: number;
  } | null = null;
  currentScroll: number;

  constructor({ image, sizes, currentScroll }: MediaProps) {
    this.image = image;
    this.sizes = sizes;
    this.currentScroll = currentScroll;

    // methods
    this.createImage();
    this.update();

    // events
    window.addEventListener("resize", this.resize.bind(this));
  }

  createImage() {
    let bounds = this.image.getBoundingClientRect();
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
    const imageMesh = new THREE.Mesh(geometry, material);
    imageMesh.scale.set(bounds.width, bounds.height, 1);
    this.imageData = {
      image: this.image,
      mesh: imageMesh,
      material: material,
      top: bounds.top,
      left: bounds.left,
      width: bounds.width,
      height: bounds.height,
    };
  }

  updatePosition() {
    if (this.imageData) {
      this.imageData.mesh.position.x =
        this.imageData.left - this.sizes.width / 2 + this.imageData.width / 2;
      this.imageData.mesh.position.y =
        this.currentScroll - this.imageData.top + this.sizes.height / 2 - this.imageData.height / 2;
    }
  }

  updateImageData() {
    if (this.imageData) {
      let bounds = this.image.getBoundingClientRect();
      this.imageData.top = bounds.top + this.currentScroll;
      this.imageData.left = bounds.left;
      this.imageData.width = bounds.width;
      this.imageData.height = bounds.height;
      this.imageData.mesh.scale.set(this.imageData.width, this.imageData.height, 1);

      this.imageData.material.uniforms.uPlaneSizes.value = [
        this.imageData.mesh.scale.x,
        this.imageData.mesh.scale.y,
      ];
    }
  }

  resize() {
    this.sizes = {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  update() {
    this.updatePosition();
    this.updateImageData();
  }
}
