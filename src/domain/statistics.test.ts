import { describe, expect, it } from 'vitest';
import { median, medianLab, weightedMedian } from './statistics';

describe('median', () => {
  it('tek sayıda değerde ortadakini verir', () => {
    expect(median([9, 1, 5])).toBe(5);
  });

  it('çift sayıda değerde ortadaki ikisinin ortalamasını verir', () => {
    expect(median([1, 2, 3, 10])).toBe(2.5);
  });

  it('girdiyi değiştirmez', () => {
    const values = [3, 1, 2];
    median(values);
    expect(values).toEqual([3, 1, 2]);
  });

  it('boş girdide hata fırlatır', () => {
    expect(() => median([])).toThrow();
  });
});

describe('weightedMedian', () => {
  it('eşit ağırlıkta medyanla uyuşur', () => {
    expect(weightedMedian([1, 2, 3], [1, 1, 1])).toBe(2);
  });

  it('ağır ağırlıklı değere doğru kayar', () => {
    expect(weightedMedian([1, 2, 3], [1, 1, 10])).toBe(3);
  });

  it('uzunluklar uyuşmazsa hata fırlatır', () => {
    expect(() => weightedMedian([1, 2], [1])).toThrow();
  });
});

describe('medianLab', () => {
  it('kanalları ayrı ayrı medyanlar', () => {
    const result = medianLab([
      { l: 10, a: 0, b: 0 },
      { l: 20, a: 5, b: -5 },
      { l: 90, a: 100, b: 100 },
    ]);
    expect(result).toEqual({ l: 20, a: 5, b: 0 });
  });
});
