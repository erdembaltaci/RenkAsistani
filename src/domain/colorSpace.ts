import type { Lab, Rgb } from './types';

const WHITE_X = 0.95047;
const WHITE_Y = 1;
const WHITE_Z = 1.08883;

const EPSILON = 216 / 24389;
const KAPPA = 24389 / 27;

const clampByte = (value: number): number => Math.min(255, Math.max(0, value));

/** sRGB kanalını (0–255) doğrusal ışık değerine (0–1) çevirir. */
export const channelToLinear = (channel: number): number => {
  const c = channel / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

/** Doğrusal ışık değerini (0–1) sRGB kanalına (0–255) çevirir; aralık dışını sıkıştırır. */
export const linearToChannel = (linear: number): number => {
  const c = linear <= 0.0031308 ? linear * 12.92 : 1.055 * linear ** (1 / 2.4) - 0.055;
  return clampByte(c * 255);
};

const labPivot = (t: number): number => (t > EPSILON ? Math.cbrt(t) : (KAPPA * t + 16) / 116);

const labPivotInverse = (t: number): number => {
  const cubed = t ** 3;
  return cubed > EPSILON ? cubed : (116 * t - 16) / KAPPA;
};

export function rgbToLab({ r, g, b }: Rgb): Lab {
  const lr = channelToLinear(r);
  const lg = channelToLinear(g);
  const lb = channelToLinear(b);

  const x = 0.4124564 * lr + 0.3575761 * lg + 0.1804375 * lb;
  const y = 0.2126729 * lr + 0.7151522 * lg + 0.072175 * lb;
  const z = 0.0193339 * lr + 0.119192 * lg + 0.9503041 * lb;

  const fx = labPivot(x / WHITE_X);
  const fy = labPivot(y / WHITE_Y);
  const fz = labPivot(z / WHITE_Z);

  return { l: 116 * fy - 16, a: 500 * (fx - fy), b: 200 * (fy - fz) };
}

/** Gamut dışı değerler en yakın geçerli sRGB değerine sıkıştırılır. */
export function labToRgb({ l, a, b }: Lab): Rgb {
  const fy = (l + 16) / 116;
  const fx = fy + a / 500;
  const fz = fy - b / 200;

  const x = labPivotInverse(fx) * WHITE_X;
  const y = labPivotInverse(fy) * WHITE_Y;
  const z = labPivotInverse(fz) * WHITE_Z;

  return {
    r: linearToChannel(3.2404542 * x - 1.5371385 * y - 0.4985314 * z),
    g: linearToChannel(-0.969266 * x + 1.8760108 * y + 0.041556 * z),
    b: linearToChannel(0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
  };
}
