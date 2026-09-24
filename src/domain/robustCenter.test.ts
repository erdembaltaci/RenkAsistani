import { describe, expect, it } from 'vitest';
import { rgbToLab } from './colorSpace';
import { deltaE76 } from './deltaE';
import { robustCenter } from './robustCenter';
import type { Lab, Rgb, WeightedLab } from './types';

const red: Rgb = { r: 200, g: 40, b: 50 };
const white: Rgb = { r: 250, g: 250, b: 250 };

const repeat = (rgb: Rgb, count: number, weight = 1): WeightedLab[] =>
  Array.from({ length: count }, () => ({ lab: rgbToLab(rgb), weight }));

const jittered = (rgb: Rgb, count: number, amount: number): WeightedLab[] =>
  Array.from({ length: count }, (_, i) => {
    const wobble = ((i * 37) % 11) - 5;
    return {
      lab: rgbToLab({
        r: rgb.r + (wobble * amount) / 5,
        g: rgb.g - (wobble * amount) / 5,
        b: rgb.b + (((i * 13) % 7) - 3) * (amount / 3),
      }),
      weight: 1,
    };
  });

describe('robustCenter', () => {
  it('tek renkli örneklerde o rengi döndürür', () => {
    const result = robustCenter(repeat(red, 50));
    expect(deltaE76(result, rgbToLab(red))).toBeLessThan(0.5);
  });

  it('en kalabalık kümeyi seçer, iki küme arasındaki sahte ara rengi değil', () => {
    const result = robustCenter([...repeat(red, 60), ...repeat(white, 40)]);
    expect(deltaE76(result, rgbToLab(red))).toBeLessThan(2);
  });

  it('ağırlıklar eşit kalabalıkta baskın kümeyi belirler', () => {
    const samples = [...repeat(red, 50, 1), ...repeat(white, 50, 5)];
    const result = robustCenter(samples);
    expect(deltaE76(result, rgbToLab(white))).toBeLessThan(2);
  });

  it('kumaş dokusu gibi küçük gürültüde gerçek renge yakın kalır', () => {
    const result = robustCenter(jittered({ r: 190, g: 200, b: 192 }, 400, 12));
    expect(deltaE76(result, rgbToLab({ r: 190, g: 200, b: 192 }))).toBeLessThan(3);
  });

  it('az sayıda aykırı pikselden (parlama, gölge) etkilenmez', () => {
    const base = jittered({ r: 180, g: 205, b: 185 }, 300, 8);
    const outliers: WeightedLab[] = [
      ...repeat({ r: 255, g: 255, b: 255 }, 20),
      ...repeat({ r: 10, g: 10, b: 10 }, 20),
    ];
    const result: Lab = robustCenter([...base, ...outliers]);
    expect(deltaE76(result, rgbToLab({ r: 180, g: 205, b: 185 }))).toBeLessThan(4);
  });

  it('boş girdide hata fırlatır', () => {
    expect(() => robustCenter([])).toThrow();
  });
});
