import { Position } from "../lib/types";
import { lerp } from "../lib/utils";

export default class Mouse {
  cursorPos: Position;
  cursorRaf: number | null = null;

  constructor() {
    this.cursorPos = {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
    };

    this.addEventListeners();
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

    console.log(this.cursorPos.current.x, this.cursorPos.current.y);
    this.cursorRaf = requestAnimationFrame(this.lerpCursorPos.bind(this));
  }

  addEventListeners() {
    window.addEventListener("mousemove", (event) => {
      this.cursorPos.target.x = event.clientX / window.innerWidth;
      this.cursorPos.target.y = event.clientY / window.innerHeight;

      if (!this.cursorRaf) {
        this.lerpCursorPos();
      }
    });
  }
}
