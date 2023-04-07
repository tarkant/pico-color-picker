const template = document.createElement('template');
template.innerHTML = `
  <canvas id="myCanvas" width="10" height="200"></canvas>
`;

const DATASET = {
    COLOR: 'data-color',
};

const HEX_REGEX = /#[A-Fa-f0-9]{6}/;

export class ColorSliderVertical extends HTMLElement {

    static get observedAttributes() {
        return [DATASET.COLOR];
    }

    public baseColor = '#0000FF';

    public get currentColor(): string {
        return this._currentColor;
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

    private colorGradient: CanvasGradient;

    private canvas: HTMLCanvasElement;

    private context: CanvasRenderingContext2D;

    private _currentColor = '#000000';

    private changedEvent: Event;

    private x = 69;
    private y = 42;
    private radius = 4;
    private isDragging = false;

    private dragOutsideListener;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        this.setCanvasSize();
        this.initCanvas();
        this.addEventListeners();
    }

    public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
        if (name === DATASET.COLOR) {
            if (HEX_REGEX.test(newValue)) {
                this.baseColor = newValue;
                this.initCanvas();
            } else {
                console.log(`color not matching regex`)
            }
        }
    }

    private setCanvasSize() {
        const bounds = this.parentElement.getBoundingClientRect();
        const canvas = this.shadowRoot.getElementById("myCanvas") as HTMLCanvasElement;
        canvas.width = bounds.width;
        canvas.height = bounds.height;
        // this.x = bounds.width;
    }

    private drawCanvasBackground() {

        this.colorGradient.addColorStop(0, "#ff0000");
        this.colorGradient.addColorStop(1/6, "#ffff00");
        this.colorGradient.addColorStop(2/6, "#00ff00");
        this.colorGradient.addColorStop(3/6, "#00ffff");
        this.colorGradient.addColorStop(4/6, "#0000ff");
        this.colorGradient.addColorStop(5/6, "#ff00ff");
        this.colorGradient.addColorStop(1, "#ff0000");


        this.context.fillStyle = this.colorGradient;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private initGradients() {
        this.colorGradient = this.context.createLinearGradient(0, 0, 0, this.canvas.height);
    }

    private getCursorPosition(canvas: HTMLCanvasElement, event: MouseEvent) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        return { x, y };
    }

    private componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }

    private rgbToHex(r, g, b) {
        return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
    }

    private hexToRgb(hex: string) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    private getCurrentColor(event: MouseEvent) {
        if (event) {
            const { x, y } = this.getCursorPosition(this.canvas, event);
            const color = this.context.getImageData(1, y, 1, 1);
            return this.rgbToHex(color.data[0], color.data[1], color.data[2]);
        } else {
            const color = this.context.getImageData(this.x, this.y, 1, 1);
            return this.rgbToHex(color.data[0], color.data[1], color.data[2]);
        }
    }

    private drawCircle(event) {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawCanvasBackground();
        this.currentColor = this.getCurrentColor(event);

        this.context.beginPath();
        this.context.roundRect(0, this.y, 10, this.radius, 1);
        this.context.lineWidth = 6;
        this.context.strokeStyle = "white";
        this.context.fillStyle = this.currentColor;
        this.context.stroke();
        this.context.fill();
    }

    private initCanvas() {
        this.canvas = this.shadowRoot.getElementById("myCanvas") as HTMLCanvasElement;
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
            // Lock the axis to Y only
            this.y = event.clientY - this.canvas.offsetTop;
            this.drawCircle(event);
        }
    }
}


