import type { Lab } from './types';

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;
const toDegrees = (radians: number): number => (radians * 180) / Math.PI;

const POW25_7 = 25 ** 7;

const hueAngle = (b: number, aPrime: number): number => {
  if (b === 0 && aPrime === 0) return 0;
  const degrees = toDegrees(Math.atan2(b, aPrime));
  return degrees >= 0 ? degrees : degrees + 360;
};

/** CIEDE2000 (Sharma, Wu, Dalal 2005). Kavramsal olarak "gözle fark edilir fark" ölçüsüdür; ~1 ≈ zar zor seçilir. */
export function ciede2000(first: Lab, second: Lab): number {
  const meanChroma = (Math.hypot(first.a, first.b) + Math.hypot(second.a, second.b)) / 2;
  const chromaCorrection = 0.5 * (1 - Math.sqrt(meanChroma ** 7 / (meanChroma ** 7 + POW25_7)));

  const a1 = first.a * (1 + chromaCorrection);
  const a2 = second.a * (1 + chromaCorrection);
  const c1 = Math.hypot(a1, first.b);
  const c2 = Math.hypot(a2, second.b);
  const h1 = hueAngle(first.b, a1);
  const h2 = hueAngle(second.b, a2);

  const deltaL = second.l - first.l;
  const deltaC = c2 - c1;

  let deltaHue = 0;
  if (c1 * c2 !== 0) {
    deltaHue = h2 - h1;
    if (deltaHue > 180) deltaHue -= 360;
    else if (deltaHue < -180) deltaHue += 360;
  }
  const deltaH = 2 * Math.sqrt(c1 * c2) * Math.sin(toRadians(deltaHue / 2));

  const meanL = (first.l + second.l) / 2;
  const meanC = (c1 + c2) / 2;

  let meanHue = h1 + h2;
  if (c1 * c2 !== 0) {
    meanHue = Math.abs(h1 - h2) <= 180 ? (h1 + h2) / 2 : h1 + h2 < 360 ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
  }

  const t =
    1 -
    0.17 * Math.cos(toRadians(meanHue - 30)) +
    0.24 * Math.cos(toRadians(2 * meanHue)) +
    0.32 * Math.cos(toRadians(3 * meanHue + 6)) -
    0.2 * Math.cos(toRadians(4 * meanHue - 63));

  const rotationAngle = 30 * Math.exp(-(((meanHue - 275) / 25) ** 2));
  const rotationChroma = 2 * Math.sqrt(meanC ** 7 / (meanC ** 7 + POW25_7));
  const rotation = -Math.sin(toRadians(2 * rotationAngle)) * rotationChroma;

  const sL = 1 + (0.015 * (meanL - 50) ** 2) / Math.sqrt(20 + (meanL - 50) ** 2);
  const sC = 1 + 0.045 * meanC;
  const sH = 1 + 0.015 * meanC * t;

  const lightnessTerm = deltaL / sL;
  const chromaTerm = deltaC / sC;
  const hueTerm = deltaH / sH;

  return Math.sqrt(lightnessTerm ** 2 + chromaTerm ** 2 + hueTerm ** 2 + rotation * chromaTerm * hueTerm);
}

/** Ucuz Öklid mesafesi; sadece "yakın piksel mi?" gibi kaba eleme için, isimlendirmede kullanılmaz. */
export function deltaE76(first: Lab, second: Lab): number {
  return Math.hypot(first.l - second.l, first.a - second.a, first.b - second.b);
}
