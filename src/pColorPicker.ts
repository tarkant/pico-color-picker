import { rgbToHex } from "./utils/ColorConversion";
import { HEX_COLOR_REGEX } from "./utils/Constants";

export const DATASET = {
    BASE_COLOR: 'data-base-color',
};

export class pColorPicker extends HTMLElement {

    static get observedAttributes() {
        return [DATASET.BASE_COLOR];
    }

    private _baseColor = '#FF0000';

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
        this.changedEvent = new CustomEvent('colorChanged', {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: value,
        });
        this.shadowRoot.dispatchEvent(this.changedEvent);
        this.dataset.currentColor = value;
    }

    private gradient: CanvasGradient;

    private colorGradient: CanvasGradient;

    private canvas: HTMLCanvasElement;

    private context: CanvasRenderingContext2D;

    private _currentColor = '#000000';

    private changedEvent: Event;

    private x = 0;
    private y = 0;
    private radius = 4;
    private isDragging = false;

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
        this.gradient.addColorStop(0, "transparent");
        this.gradient.addColorStop(1, "black");

        this.colorGradient.addColorStop(0, "white");
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

    private getCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    private getCurrentColor(event?: MouseEvent) {
        if (event) {
            const { x, y } = this.getCursorPosition(this.canvas, event);
            const color = this.context.getImageData(x, y, 1, 1);
            return rgbToHex(color.data[0], color.data[1], color.data[2]);
        } else {
            const color = this.context.getImageData(this.x, this.y, 1, 1);
            return rgbToHex(color.data[0], color.data[1], color.data[2]);
        }
    }

    private drawCircle(event?: MouseEvent) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCanvasBackground();
        this.currentColor = this.getCurrentColor(event);

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
            this.x = event.clientX - this.canvas.offsetLeft;
            this.y = event.clientY - this.canvas.offsetTop;
            this.drawCircle(event);
        });

        this.canvas.addEventListener("mousedown", (event) => {
            this.isDragging = true;
        });

        this.canvas.addEventListener("mousemove", (event) => {
            if (this.isDragging) {
                this.x = event.clientX - this.canvas.offsetLeft;
                this.y = event.clientY - this.canvas.offsetTop;
                this.drawCircle(event);
            }
        });

        this.canvas.addEventListener("mouseup", (event) => {
            this.isDragging = false;
        });
    }
}


