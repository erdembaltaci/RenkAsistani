import { describe, expect, it } from 'vitest';
import { ciede2000 } from './deltaE';
import { rgbToLab } from './colorSpace';
import type { Lab } from './types';

const lab = (l: number, a: number, b: number): Lab => ({ l, a, b });

// Sharma, Wu ve Dalal (2005) makalesindeki referans test çiftleri.
const SHARMA_PAIRS: ReadonlyArray<readonly [Lab, Lab, number]> = [
  [lab(50, 2.6772, -79.7751), lab(50, 0, -82.7485), 2.0425],
  [lab(50, 3.1571, -77.2803), lab(50, 0, -82.7485), 2.8615],
  [lab(50, 2.8361, -74.02), lab(50, 0, -82.7485), 3.4412],
  [lab(50, -1.3802, -84.2814), lab(50, 0, -82.7485), 1.0],
  [lab(50, 0, 0), lab(50, -1, 2), 2.3669],
  [lab(50, 2.49, -0.001), lab(50, -2.49, 0.0009), 7.1792],
  [lab(50, 2.5, 0), lab(50, 0, -2.5), 4.3065],
  [lab(50, 2.5, 0), lab(73, 25, -18), 27.1492],
  [lab(50, 2.5, 0), lab(61, -5, 29), 22.8977],
  [lab(60.2574, -34.0099, 36.2677), lab(60.4626, -34.1751, 39.4387), 1.2644],
  [lab(22.7233, 20.0904, -46.694), lab(23.0331, 14.973, -42.5619), 2.0373],
];

describe('ciede2000', () => {
  it.each(SHARMA_PAIRS)('referans çiftinde doğru ΔE üretir (%#)', (first, second, expected) => {
    expect(ciede2000(first, second)).toBeCloseTo(expected, 3);
  });

  it('aynı renk için 0 döner', () => {
    const color = rgbToLab({ r: 180, g: 220, b: 190 });
    expect(ciede2000(color, color)).toBe(0);
  });

  it('simetriktir', () => {
    const first = rgbToLab({ r: 210, g: 210, b: 210 });
    const second = rgbToLab({ r: 205, g: 214, b: 207 });
    expect(ciede2000(first, second)).toBeCloseTo(ciede2000(second, first), 10);
  });

  it('beyaz ile siyahı çok uzak bulur', () => {
    const white = rgbToLab({ r: 255, g: 255, b: 255 });
    const black = rgbToLab({ r: 0, g: 0, b: 0 });
    expect(ciede2000(white, black)).toBeGreaterThan(90);
  });

  it('açık gri ile açık yeşili, açık gri ile bir sonraki griden daha uzak bulur', () => {
    const lightGray = rgbToLab({ r: 217, g: 217, b: 217 });
    const lightGreen = rgbToLab({ r: 200, g: 230, b: 192 });
    const nearGray = rgbToLab({ r: 212, g: 212, b: 212 });
    expect(ciede2000(lightGray, lightGreen)).toBeGreaterThan(ciede2000(lightGray, nearGray));
  });
});
