import type { Lab, WeightedLab } from './types';

export function median(values: readonly number[]): number {
  if (values.length === 0) {
    throw new Error('Medyan için en az bir değer gerekir');
  }
  const sorted = [...values].sort((x, y) => x - y);
  const middle = Math.floor(sorted.length / 2);
  const upper = sorted[middle] as number;
  return sorted.length % 2 === 1 ? upper : ((sorted[middle - 1] as number) + upper) / 2;
}

export function weightedMedian(values: readonly number[], weights: readonly number[]): number {
  if (values.length === 0 || values.length !== weights.length) {
    throw new Error('Ağırlıklı medyan için eşit uzunlukta ve boş olmayan diziler gerekir');
  }
  const pairs = values.map((value, index) => ({ value, weight: weights[index] as number }));
  pairs.sort((x, y) => x.value - y.value);

  const half = pairs.reduce((sum, pair) => sum + pair.weight, 0) / 2;
  let cumulative = 0;
  for (const pair of pairs) {
    cumulative += pair.weight;
    if (cumulative >= half) return pair.value;
  }
  return (pairs[pairs.length - 1] as { value: number }).value;
}

/** Kanalları ayrı ayrı medyanlar; tek bir aykırı değer sonucu kaydıramaz. */
export function medianLab(colors: readonly Lab[]): Lab {
  return {
    l: median(colors.map((color) => color.l)),
    a: median(colors.map((color) => color.a)),
    b: median(colors.map((color) => color.b)),
  };
}

export function weightedMedianLab(samples: readonly WeightedLab[]): Lab {
  const weights = samples.map((sample) => sample.weight);
  return {
    l: weightedMedian(samples.map((sample) => sample.lab.l), weights),
    a: weightedMedian(samples.map((sample) => sample.lab.a), weights),
    b: weightedMedian(samples.map((sample) => sample.lab.b), weights),
  };
}
