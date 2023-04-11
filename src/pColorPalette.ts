import { pColorPickerBase } from "./pColorPicker.base";

const DATASET = {
  COLOR: 'data-color',
};

const DEFAULT_CANVAS_SIZE = {
  x: 10,
  y: 200,
};

const HEX_REGEX = /#[A-Fa-f0-9]{6}/;

export class pColorPalette extends pColorPickerBase {

  static get observedAttributes() {
    return [DATASET.COLOR];
  }

  public baseColor = '#0000FF';

  public get currentColor(): string {
    return this._currentColor;
  }

  public set currentColor(value: string) {
    this._currentColor = value;
    if (this.isTouched) {
      this.emitEvent(this.shadowRoot, 'colorChanged', value);
      this.dataset.currentColor = value;
    }
  }

  private colorGradient: CanvasGradient;

  private _currentColor = '#000000';

  private radius = 1;

  public connectedCallback() {
    const template = document.createElement('template');
    template.innerHTML = `<canvas></canvas>`;
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.canvas = this.shadowRoot.querySelector('canvas');
    this.setCanvasSize(DEFAULT_CANVAS_SIZE);
    this.renderCanvas();
    this.addEventListeners();
    window.onresize = () => {
      this.setCanvasSize(DEFAULT_CANVAS_SIZE);
      this.renderCanvas();
    };
  }

  public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === DATASET.COLOR) {
      if (HEX_REGEX.test(newValue)) {
        this.baseColor = newValue;
        this.renderCanvas();
      }
    }
  }

  private drawCanvasBackground() {

    this.colorGradient.addColorStop(0, "#ff0000");
    this.colorGradient.addColorStop(1 / 6, "#ffff00");
    this.colorGradient.addColorStop(2 / 6, "#00ff00");
    this.colorGradient.addColorStop(3 / 6, "#00ffff");
    this.colorGradient.addColorStop(4 / 6, "#0000ff");
    this.colorGradient.addColorStop(5 / 6, "#ff00ff");
    this.colorGradient.addColorStop(1, "#ff0000");


    this.context.fillStyle = this.colorGradient;
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private initGradients() {
    this.colorGradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
  }

  private renderCanvas() {
    this.initCanvas();
    this.drawCanvasMarker();
  }

  public drawCanvasMarker() {
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawCanvasBackground();
    this.currentColor = this.getColorAtXY(this.x, this.y);

    this.context.beginPath();
    this.context.roundRect(0, this.y, this.canvas.width, this.radius, 1);
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


