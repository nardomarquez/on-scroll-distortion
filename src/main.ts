import "./style.css";
import WebGL from "./webgl/WebGL";
import Lenis from "lenis";

class App {
  lenis: Lenis;
  webgl: WebGL;

  constructor() {
    this.lenis = new Lenis();
    this.webgl = new WebGL();

    this.updateScroll();

    this.addEventListeners();
  }

  updateScroll() {
    const raf = (time: number) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);
  }

  addEventListeners() {
    this.lenis.on("scroll", () => {
      this.webgl.onScroll(this.lenis.scroll);
    });
  }
}

window.addEventListener("load", () => {
  new App();
});
