import * as THREE from "three";
import vertexShader from "../shaders/vertex.glsl";
import fragmentShader from "../shaders/fragment.glsl";
import { Sizes } from "../lib/types";
import { lerp } from "../lib/utils";

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
  mouseOverPos: {
    current: { x: number; y: number };
    target: { x: number; y: number };
  };
  cursorPos: {
    current: { x: number; y: number };
    target: { x: number; y: number };
  };
  cursorRaf: number | null = null;
  mouseEnter: number = 0;

  constructor({ image, screen, geometry, scene }: MediaProps) {
    this.image = image;
    this.screen = screen;

    // scroll props
    this.scroll = 0;
    this.scrollVelocity = 0;
    this.mouseOverPos = {
      current: { x: 0.5, y: 0.5 },
      target: { x: 0.5, y: 0.5 },
    };
    this.cursorPos = {
      current: { x: 0.5, y: 0.5 },
      target: { x: 0.5, y: 0.5 },
    };

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

  lerpCursorPos() {
    const x = lerp(this.cursorPos.current.x, this.cursorPos.target.x, 0.05);
    const y = lerp(this.cursorPos.current.y, this.cursorPos.target.y, 0.05);

    this.cursorPos.current.x = x;
    this.cursorPos.current.y = y;

    const delta = Math.sqrt(
      (this.cursorPos.target.x - this.cursorPos.current.x) ** 2 +
        (this.cursorPos.target.y - this.cursorPos.current.y) ** 2
    );

    if (delta < 0.001 && this.cursorRaf) {
      cancelAnimationFrame(this.cursorRaf);
      this.cursorRaf = null;
      return;
    }

    this.cursorRaf = requestAnimationFrame(this.lerpCursorPos.bind(this));
  }

  update(time = 0) {
    time /= 1000;

    this.mouseOverPos.current.x = lerp(
      this.mouseOverPos.current.x,
      this.mouseOverPos.target.x,
      0.05
    );
    this.mouseOverPos.current.y = lerp(
      this.mouseOverPos.current.y,
      this.mouseOverPos.target.y,
      0.05
    );

    this.material.uniforms.uResolution.value.x = window.innerWidth;
    this.material.uniforms.uResolution.value.y = window.innerHeight;
    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uCursor.value.x = this.cursorPos.current.x;
    this.material.uniforms.uCursor.value.y = this.cursorPos.current.y;
    this.material.uniforms.uScrollVelocity.value = this.scrollVelocity;
    this.material.uniforms.uMouseOverPos.value.x = this.mouseOverPos.current.x;
    this.material.uniforms.uMouseOverPos.value.y = this.mouseOverPos.current.y;
    this.material.uniforms.uMouseEnter.value = this.mouseEnter;
  }

  onResize() {
    this.screen = { width: window.innerWidth, height: window.innerHeight };
    this.updatePosition();
    this.updateScale();
    this.update();
  }

  onMouseEnter() {}

  onMouseMove(e: MouseEvent) {
    console.log("mousemove");
    const x = e.offsetX / this.image.offsetWidth;
    const y = e.offsetY / this.image.offsetHeight;

    this.material.uniforms.uMouseOverPos.value.x = x;
    this.material.uniforms.uMouseOverPos.value.y = y;
  }

  onScroll({ scroll, velocity }: { scroll: number; velocity: number }) {
    this.scroll = scroll;
    this.scrollVelocity = velocity;
    this.updatePosition();
    this.update();
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));

    // LOGIC
    window.addEventListener("mousemove", (event) => {
      this.cursorPos.target.x = event.clientX / window.innerWidth;
      this.cursorPos.target.y = event.clientY / window.innerHeight;

      if (!this.cursorRaf) {
        this.cursorRaf = requestAnimationFrame(this.lerpCursorPos.bind(this));
      }
    });

    this.image.addEventListener("mousemove", this.onMouseMove.bind(this));
  }
}
