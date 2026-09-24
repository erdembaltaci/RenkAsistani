import { describe, expect, it } from 'vitest';
import { channelToLinear, linearToChannel, rgbToLab } from './colorSpace';
import { ciede2000 } from './deltaE';
import type { Rgb } from './types';
import { applyWhiteReference } from './whiteReference';

/** Işığı simüle eder: her kanalı, doğrusal ışıkta belirli bir çarpanla ölçekler (renk sapması + pozlama). */
const underLight = (rgb: Rgb, gain: { r: number; g: number; b: number }): Rgb => ({
  r: linearToChannel(channelToLinear(rgb.r) * gain.r),
  g: linearToChannel(channelToLinear(rgb.g) * gain.g),
  b: linearToChannel(channelToLinear(rgb.b) * gain.b),
});

const PAPER: Rgb = { r: 242, g: 242, b: 240 };
const products: Record<string, Rgb> = {
  'soluk yeşil': { r: 198, g: 226, b: 203 },
  'açık gri': { r: 214, g: 214, b: 216 },
  bordo: { r: 110, g: 21, b: 39 },
  'pastel pembe': { r: 240, g: 190, b: 205 },
};

const lights = {
  'sıcak ampul (sarımsı)': { r: 1.0, g: 0.82, b: 0.5 },
  'soğuk gölge (mavimsi)': { r: 0.7, g: 0.85, b: 1.0 },
  'loş oda': { r: 0.45, g: 0.45, b: 0.45 },
  'loş ve sarımsı': { r: 0.55, g: 0.45, b: 0.28 },
};

describe('applyWhiteReference', () => {
  for (const [lightName, gain] of Object.entries(lights)) {
    for (const [productName, product] of Object.entries(products)) {
      it(`${lightName} altındaki ${productName} rengini gerçeğe yaklaştırır`, () => {
        const truth = rgbToLab(product);
        const observedProduct = rgbToLab(underLight(product, gain));
        const observedPaper = rgbToLab(underLight(PAPER, gain));

        const { corrected, isReliable } = applyWhiteReference(observedProduct, observedPaper);

        expect(isReliable).toBe(true);
        const before = ciede2000(truth, observedProduct);
        const after = ciede2000(truth, corrected);
        expect(after).toBeLessThan(before);
        expect(after).toBeLessThan(6);
      });
    }
  }

  it('ışık zaten nötr ve doğruysa rengi neredeyse değiştirmez', () => {
    const truth = rgbToLab(products['soluk yeşil'] as Rgb);
    const { corrected } = applyWhiteReference(truth, rgbToLab(PAPER));
    expect(ciede2000(truth, corrected)).toBeLessThan(3);
  });

  it('referans beyaz/gri değilse (renkli bir nokta) düzeltme yapmaz', () => {
    const product = rgbToLab(products['açık gri'] as Rgb);
    const notWhite = rgbToLab({ r: 200, g: 40, b: 60 });
    const result = applyWhiteReference(product, notWhite);
    expect(result.isReliable).toBe(false);
    expect(result.corrected).toEqual(product);
  });

  it('referans çok koyuysa (beyaz kâğıt olamaz) düzeltme yapmaz', () => {
    const product = rgbToLab(products['açık gri'] as Rgb);
    const result = applyWhiteReference(product, rgbToLab({ r: 40, g: 40, b: 40 }));
    expect(result.isReliable).toBe(false);
  });

  it('düzeltilmiş rengi geçerli aralıkta tutar (aşırı parlak referans)', () => {
    const { corrected } = applyWhiteReference(rgbToLab({ r: 250, g: 250, b: 250 }), rgbToLab({ r: 120, g: 118, b: 116 }));
    expect(Number.isFinite(corrected.l)).toBe(true);
    expect(corrected.l).toBeLessThanOrEqual(100.5);
  });
});
