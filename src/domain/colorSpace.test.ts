import { describe, expect, it } from 'vitest';
import { labToRgb, rgbToLab } from './colorSpace';

describe('rgbToLab', () => {
  it('saf beyazı L=100 ve nötr a/b ile eşler', () => {
    const lab = rgbToLab({ r: 255, g: 255, b: 255 });
    expect(lab.l).toBeCloseTo(100, 1);
    expect(lab.a).toBeCloseTo(0, 1);
    expect(lab.b).toBeCloseTo(0, 1);
  });

  it('siyahı L=0 ile eşler', () => {
    const lab = rgbToLab({ r: 0, g: 0, b: 0 });
    expect(lab.l).toBeCloseTo(0, 3);
    expect(lab.a).toBeCloseTo(0, 3);
    expect(lab.b).toBeCloseTo(0, 3);
  });

  it('bilinen referans değerlerle uyuşur', () => {
    const red = rgbToLab({ r: 255, g: 0, b: 0 });
    expect(red.l).toBeCloseTo(53.24, 1);
    expect(red.a).toBeCloseTo(80.09, 1);
    expect(red.b).toBeCloseTo(67.2, 1);

    const blue = rgbToLab({ r: 0, g: 0, b: 255 });
    expect(blue.l).toBeCloseTo(32.3, 1);
    expect(blue.a).toBeCloseTo(79.19, 1);
    expect(blue.b).toBeCloseTo(-107.86, 1);
  });

  it('orta griyi nötr bırakır', () => {
    const lab = rgbToLab({ r: 119, g: 119, b: 119 });
    expect(lab.l).toBeCloseTo(50, 0);
    expect(Math.abs(lab.a)).toBeLessThan(0.1);
    expect(Math.abs(lab.b)).toBeLessThan(0.1);
  });
});

describe('labToRgb', () => {
  it('rgb → lab → rgb gidiş dönüşünde değeri korur', () => {
    const samples = [
      { r: 12, g: 200, b: 99 },
      { r: 250, g: 240, b: 230 },
      { r: 33, g: 33, b: 90 },
      { r: 200, g: 200, b: 205 },
    ];
    for (const rgb of samples) {
      const back = labToRgb(rgbToLab(rgb));
      expect(back.r).toBeCloseTo(rgb.r, 0);
      expect(back.g).toBeCloseTo(rgb.g, 0);
      expect(back.b).toBeCloseTo(rgb.b, 0);
    }
  });

  it('gamut dışı değerleri 0–255 aralığına sıkıştırır', () => {
    const rgb = labToRgb({ l: 50, a: 120, b: -120 });
    for (const channel of [rgb.r, rgb.g, rgb.b]) {
      expect(channel).toBeGreaterThanOrEqual(0);
      expect(channel).toBeLessThanOrEqual(255);
    }
  });
});
