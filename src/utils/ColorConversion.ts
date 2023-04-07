import { HEX_COLOR_REGEX } from "./Constants";

export function rgbToHex(r: number, g: number, b: number) {
    return `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
}

export function componentToHex(c: number) {
    c = Math.trunc(c);
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

export function hexToRgb(hex: string) {
    const result = HEX_COLOR_REGEX.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

export function getHue(color: string): number {
    let { r, g, b } = hexToRgb(color);
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0;
    return 60 * h < 0 ? 60 * h + 360 : 60 * h;
}

export function hsl2rgb(h: number, s: number, l: number) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return {
        r: 255 * f(0),
        g: 255 * f(8),
        b: 255 * f(4)
    };
}

export function hsl2hex(h: number, s: number, l: number): string {
    const { r, g, b } = hsl2rgb(h, s, l);
    return rgbToHex(r, g, b);
}

export function rgb2hsl(r: number, g: number, b: number): Array<number> {
    r /= 255;
    g /= 255;
    b /= 255;
    const l = Math.max(r, g, b);
    const s = l - Math.min(r, g, b);
    const h = s
        ? l === r
            ? (g - b) / s
            : l === g
                ? 2 + (b - r) / s
                : 4 + (r - g) / s
        : 0;
    return [
        60 * h < 0 ? 60 * h + 360 : 60 * h,
        100 * (s ? (l <= 0.5 ? s / (2 * l - s) : s / (2 - (2 * l - s))) : 0),
        (100 * (2 * l - s)) / 2,
    ];
};

export function hex2hsl(v: string): Array<number> {
    const { r, g, b } = hexToRgb(v);
    return rgb2hsl(r, g, b);
}