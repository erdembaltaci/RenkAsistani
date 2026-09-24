import { describe, expect, it } from 'vitest';
import { compareColors, compareHexColors } from './colorDifference';

describe('compareHexColors', () => {
  it('aynı rengi "imperceptible" ve ΔE 0 bulur', () => {
    const result = compareHexColors('#CFCFD1', '#CFCFD1');
    expect(result.deltaE).toBe(0);
    expect(result.level).toBe('imperceptible');
    expect(result.lighter).toBe('same');
    expect(result.moreVivid).toBe('same');
  });

  it('siyah ile beyazı "different" bulur, beyaz daha açıktır', () => {
    const result = compareHexColors('#000000', '#FFFFFF');
    expect(result.level).toBe('different');
    expect(result.lighter).toBe('second');
    expect(result.deltaE).toBeGreaterThan(90);
  });

  it('sırayı değiştirince "daha açık" olan da değişir, ΔE aynı kalır', () => {
    const forward = compareHexColors('#D9D9D9', '#B2B2B2');
    const backward = compareHexColors('#B2B2B2', '#D9D9D9');
    expect(forward.lighter).toBe('first');
    expect(backward.lighter).toBe('second');
    expect(forward.deltaE).toBeCloseTo(backward.deltaE, 10);
  });

  it('gri ile soluk yeşili, gri ile yakın grinin farkından belirgin ayırır', () => {
    const grayVsGreen = compareHexColors('#D6D6D6', '#CFE3CF');
    const grayVsGray = compareHexColors('#D6D6D6', '#D4D4D4');
    expect(grayVsGreen.deltaE).toBeGreaterThan(grayVsGray.deltaE);
    expect(grayVsGray.level).toBe('imperceptible');
    expect(['noticeable', 'clear', 'different']).toContain(grayVsGreen.level);
  });

  it('daha canlı olanı gösterir', () => {
    const result = compareHexColors('#C8C8C8', '#E23A34');
    expect(result.moreVivid).toBe('second');
  });

  it('geçersiz hex kodunda hata fırlatır', () => {
    expect(() => compareHexColors('kırmızı', '#FFFFFF')).toThrow();
  });
});

describe('compareColors eşikleri', () => {
  const base = { l: 60, a: 0, b: 0 };
  it.each([
    [0.4, 'imperceptible'],
    [1.5, 'slight'],
    [3, 'noticeable'],
    [5, 'clear'],
    [12, 'different'],
  ])('L farkı %f civarı -> %s', (dl, level) => {
    // Orta açıklıkta nötr renklerde ΔE00 ≈ ΔL / S_L ve S_L ≈ 1; yaklaşık eşdeğerdir.
    const result = compareColors(base, { ...base, l: base.l + dl });
    expect(result.level).toBe(level);
  });
});
