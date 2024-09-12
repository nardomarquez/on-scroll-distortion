import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";
import { Position, Sizes } from "../lib/types";
import { lerp } from "../lib/utils";
import { gsap } from "gsap";
import CustomEase from "gsap/CustomEase";

gsap.registerPlugin(CustomEase);

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

  // mouse props
  scrollVelocity: number;
  mouseOverPos: Position;
  cursorPos: Position;
  cursorRaf: number | null = null;
  mouseEnter: number = 0;

  constructor({ image, screen, geometry, scene }: MediaProps) {
    this.image = image;
    this.screen = screen;

    // scroll props
    this.scroll = 0;
    this.scrollVelocity = 0;
    this.mouseOverPos = { current: { x: 0.5, y: 0.5 }, target: { x: 0.5, y: 0.5 } };
    this.cursorPos = { current: { x: 0.5, y: 0.5 }, target: { x: 0.5, y: 0.5 } };

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
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTexture: { value: texture },
        uImageSizes: { value: [0, 0] },
        uPlaneSizes: { value: [0, 0] },
        uTime: { value: 0 },
        uCursor: { value: new THREE.Vector2(0.5, 0.5) },
        uScrollVelocity: { value: 0 },
        uMouseEnter: { value: 0 },
        uMouseOverPos: { value: new THREE.Vector2(0.5, 0.5) },
      },
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

  update({ time, cursorPos }: { time: number; cursorPos: Position }) {
    time /= 1000;

    this.mouseOverPos.current.x = lerp(
      this.mouseOverPos.current.x,
      this.mouseOverPos.target.x,
      0.5
    );
    this.mouseOverPos.current.y = lerp(
      this.mouseOverPos.current.y,
      this.mouseOverPos.target.y,
      0.5
    );

    this.material.uniforms.uResolution.value.x = window.innerWidth;
    this.material.uniforms.uResolution.value.y = window.innerHeight;
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uCursor.value.x = cursorPos.current.x;
    this.material.uniforms.uCursor.value.y = cursorPos.current.y;
    this.material.uniforms.uScrollVelocity.value = this.scrollVelocity;
    this.material.uniforms.uMouseOverPos.value.x = this.mouseOverPos.current.x;
    this.material.uniforms.uMouseOverPos.value.y = this.mouseOverPos.current.y;
    this.material.uniforms.uMouseEnter.value = this.mouseEnter;
  }

  onResize() {
    this.screen = { width: window.innerWidth, height: window.innerHeight };
    this.updatePosition();
    this.updateScale();
  }

  onMouseMove(e: MouseEvent) {
    const x = e.offsetX / this.image.offsetWidth;
    const y = e.offsetY / this.image.offsetHeight;

    this.mouseOverPos.target.x = x;
    this.mouseOverPos.target.y = y;
  }

  onMouseEnter() {
    gsap.to(this, {
      mouseEnter: 1,
      duration: 0.6,
      ease: CustomEase.create("custom", "0.4, 0, 0.2, 1"),
    });
  }

  onMouseLeave() {
    gsap.to(this, {
      mouseEnter: 0,
      duration: 0.6,
      ease: CustomEase.create("custom", "0.4, 0, 0.2, 1"),
    });
    gsap.to(this.mouseOverPos.target, {
      x: 0.5,
      y: 0.5,
      duration: 0.6,
      ease: CustomEase.create("custom", "0.4, 0, 0.2, 1"),
    });
  }

  onScroll({ scroll, velocity }: { scroll: number; velocity: number }) {
    this.scroll = scroll;
    this.scrollVelocity = velocity * 0.2;
    this.updatePosition();
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    this.image.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.image.addEventListener("mouseenter", this.onMouseEnter.bind(this));
    this.image.addEventListener("mouseleave", this.onMouseLeave.bind(this));
  }
}
