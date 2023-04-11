import { pColorPickerBase } from "./pColorPicker.base";
import { COLORS, DEFAULT_BASE_COLOR, HEX_COLOR_REGEX } from "./utils/Constants";

export const DATASET = {
  BASE_COLOR: 'data-base-color',
};

const DEFAULT_CANVAS_SIZE = {
  x: 200,
  y: 200,
};

export class pColorPicker extends pColorPickerBase {

  static get observedAttributes() {
    return [DATASET.BASE_COLOR];
  }

  private _baseColor = DEFAULT_BASE_COLOR;

  public get currentColor(): string {
    return this._currentColor;
  }

  public get baseColor(): string {
    return this._baseColor;
  }

  public set baseColor(value: string) {
    this._baseColor = value;
    this.renderCanvas();
  }

  public set currentColor(value: string) {
    this._currentColor = value;
    if (this.isTouched) {
      this.emitEvent(this.shadowRoot, 'colorChanged', value);
      this.dataset.currentColor = value;
    }
  }

  private gradient: CanvasGradient;

  private colorGradient: CanvasGradient;

  private _currentColor = '#000000';

  private radius = 4;

  public connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = `<canvas></canvas>`;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.setCanvasSize(DEFAULT_CANVAS_SIZE);
    this.initXY();
    this.addEventListeners();
    this.renderCanvas();
    window.onresize = () => {
      this.setCanvasSize(DEFAULT_CANVAS_SIZE);
      this.renderCanvas();
    };
  }

  public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === DATASET.BASE_COLOR) {
      if (HEX_COLOR_REGEX.test(newValue)) {
        this.baseColor = newValue;
      }
    }
  }

  private initXY() {
    this.x = this.canvas.width;
    this.y = 0;
  }

  private renderCanvas() {
    this.initCanvas();
    this.drawCanvasMarker();
  }

  private drawCanvasBackground() {
    this.gradient.addColorStop(0, COLORS.TRANSPARENT);
    this.gradient.addColorStop(1, COLORS.BLACK);

    this.colorGradient.addColorStop(0, COLORS.WHITE);
    this.colorGradient.addColorStop(1, this.baseColor);

    this.context.fillStyle = this.colorGradient;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.context.fillStyle = this.gradient;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private initGradients() {
    this.gradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
    this.colorGradient = this.context.createLinearGradient(0, 0, this.canvas.width, 0);
  }

  public drawCanvasMarker() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCanvasBackground();
    this.currentColor = this.getColorAtXY(this.x, this.y);

    this.context.beginPath();
    this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    this.context.lineWidth = 6;
    this.context.strokeStyle = "white";
    this.context.fillStyle = this.currentColor;
    this.context.stroke();
    this.context.fill();
  }

  private initCanvas() {
    if (this.canvas) {
      this.context = this.canvas.getContext("2d", { willReadFrequently: true });
      this.initGradients();
      this.drawCanvasBackground();
    }
  }
}
