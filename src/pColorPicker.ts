import { rgbToHex } from "./utils/ColorConversion";
import { COLORS, DEFAULT_BASE_COLOR, HEX_COLOR_REGEX } from "./utils/Constants";

export const DATASET = {
    BASE_COLOR: 'data-base-color',
};

export class pColorPicker extends HTMLElement {

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
        this.emitEvent(this.shadowRoot, 'colorChanged', value);
        this.dataset.currentColor = value;
    }

    private gradient: CanvasGradient;

    private colorGradient: CanvasGradient;

    private canvas: HTMLCanvasElement;

    private context: CanvasRenderingContext2D;

    private _currentColor = '#000000';

    private x = 0;
    private y = 0;
    private radius = 4;
    private isDragging = false;

    private dragOutsideListener;

    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
        <canvas></canvas>
        `;
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.canvas = this.shadowRoot.querySelector('canvas');
        this.setCanvasSize();
        this.initXY();
        this.addEventListeners();
        this.renderCanvas();
    }

    private emitEvent(shadowRoot: ShadowRoot, eventName: string, value: any) {
        const event = new CustomEvent(eventName, {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: value,
        });
        shadowRoot.dispatchEvent(event);
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
        this.drawCircle();
    }

    private setCanvasSize() {
        const bounds = this.parentElement.getBoundingClientRect();
        this.canvas.width = bounds.width;
        this.canvas.height = bounds.height;
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

    private getCurrentColor(event?: MouseEvent) {
        const color = this.context.getImageData(this.x, this.y, 1, 1);
        return rgbToHex(color.data[0], color.data[1], color.data[2]);
    }

    private drawCircle(event?: MouseEvent) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCanvasBackground();
        this.currentColor = this.getCurrentColor();

        this.context.beginPath();
        this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        this.context.lineWidth = 6;
        this.context.strokeStyle = "white";
        this.context.fillStyle = this.currentColor;
        this.context.stroke();
        this.context.fill();
    }

    private initCanvas() {
        this.context = this.canvas.getContext("2d", { willReadFrequently: true });
        this.initGradients();
        this.drawCanvasBackground();
    }

    private addEventListeners() {
        this.canvas.addEventListener("click", (event) => {
            this.x = this.getSafeCoords(event.clientX, this.canvas.offsetLeft, this.canvas.offsetWidth);
            this.y = this.getSafeCoords(event.clientY, this.canvas.offsetTop, this.canvas.offsetHeight);
            this.drawCircle(event);
        });

        this.canvas.addEventListener("mousedown", (event) => {
            this.isDragging = true;
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

    private trackClientDrag(event: MouseEvent) {
        if (this.isDragging) {
            this.x = this.getSafeCoords(event.clientX, this.canvas.offsetLeft, this.canvas.offsetWidth);
            this.y = this.getSafeCoords(event.clientY, this.canvas.offsetTop, this.canvas.offsetHeight);
            this.drawCircle(event);
        }
    }

    // Gets safe coordinates to avoid having the color selector outside of the bounds
    private getSafeCoords(coord: number, offset: number, max: number) {
        if (coord <= offset) {
            return 0;
        } else if (coord - offset <= max) {
            return coord - offset;
        }
        return max - 1;
    }
}


