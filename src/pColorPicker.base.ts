import { rgbToHex } from "./utils/ColorConversion";

export abstract class pColorPickerBase extends HTMLElement {

  protected canvas: HTMLCanvasElement;

  protected context: CanvasRenderingContext2D;

  protected x = 0;

  protected y = 0;

  protected isDragging = false;

  protected dragOutsideListener;

  protected isTouched = false;

  public abstract drawCanvasMarker(): void;

  protected emitEvent(shadowRoot: ShadowRoot, eventName: string, value: any) {
    const event = new CustomEvent(eventName, {
      bubbles: true,
      cancelable: false,
      composed: true,
      detail: value,
    });
    shadowRoot.dispatchEvent(event);
  }

  protected getColorAtXY(x: number, y: number) {
    const color = this.context.getImageData(this.x, this.y, 1, 1);
    return rgbToHex(color.data[0], color.data[1], color.data[2]);
  }

  protected addEventListeners() {
    this.canvas.addEventListener("click", (event) => {
      this.isTouched = true;
      this.x = this.getSafeCoords(this.getCorrectedMouseXY(event).x, this.canvas.offsetLeft, this.canvas.offsetWidth);
      this.y = this.getSafeCoords(this.getCorrectedMouseXY(event).y, this.canvas.offsetTop, this.canvas.offsetHeight);
      this.drawCanvasMarker();
    });

    this.canvas.addEventListener("mousedown", (event) => {
      this.isDragging = true;
      this.isTouched = true;
      this.dragOutsideListener = this.trackClientDrag.bind(this);
      window.addEventListener("mousemove", this.dragOutsideListener);
      window.addEventListener("mouseup", (event) => {
        this.isDragging = false;
        window.removeEventListener("mousemove", this.dragOutsideListener);
      });
    });

    this.canvas.addEventListener("mouseup", (event) => {
      this.isDragging = false;
    });
  }

  protected setCanvasSize(DEFAULT_CANVAS_SIZE: { x: number, y: number}): void {
    const bounds = this?.parentElement?.getBoundingClientRect();
    this.canvas.width = bounds?.width || DEFAULT_CANVAS_SIZE.x;
    this.canvas.height = bounds?.height || DEFAULT_CANVAS_SIZE.y;
  }


  private trackClientDrag(event: MouseEvent) {
    if (this.isDragging) {
      this.x = this.getSafeCoords(this.getCorrectedMouseXY(event).x, this.canvas.offsetLeft, this.canvas.offsetWidth);
      this.y = this.getSafeCoords(this.getCorrectedMouseXY(event).y, this.canvas.offsetTop, this.canvas.offsetHeight);
      this.drawCanvasMarker();
    }
  }

  // Gets safe coordinates to avoid having the color selector outside of the bounds
  private getSafeCoords(coord: number, offset: number, max: number) {
    if (coord <= 0) {
      return 0;
    } else if (coord >= max) {
      return max - 1;
    }
    return coord;
  }

  // Get the corrected client's mouse X Y while taking into account the canvas's position
  private getCorrectedMouseXY(event: MouseEvent): { x: number, y: number } {
    const x = event.clientX;
    const y = event.clientY;

    const bounds = this.canvas.getBoundingClientRect();

    return {
      x: x - bounds.left,
      y: y - bounds.top,
    };
  }

}
