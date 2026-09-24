import { ciede2000 } from '../domain/deltaE';
import { medianLab } from '../domain/statistics';
import type { Lab } from '../domain/types';
import type { AggregationResult, ColorAggregator } from './ColorAggregator';

const DEFAULT_DEVIATION_THRESHOLD = 6;

export class MedianColorAggregator implements ColorAggregator {
  constructor(private readonly deviationThreshold: number = DEFAULT_DEVIATION_THRESHOLD) {}

  aggregate(colors: readonly Lab[]): AggregationResult {
    if (colors.length === 0) {
      throw new Error('Birleştirmek için en az bir renk gerekir');
    }

    const color = medianLab(colors);
    const deviations = colors.map((_, index) => this.deviationOf(index, colors, color));
    const deviatingIndexes = deviations.flatMap((deviation, index) => (deviation > this.deviationThreshold ? [index] : []));
    return { color, deviations, deviatingIndexes };
  }

  // İki fotoğrafta medyan tam ortadır ve ikisi de eşit uzak kalır; hangisinin saptığı söylenemez.
  // Bu yüzden aralarındaki mesafe ölçülür ve ikisi de aynı şekilde işaretlenir.
  private deviationOf(index: number, all: readonly Lab[], combined: Lab): number {
    const candidate = all[index] as Lab;
    if (all.length === 2) {
      return ciede2000(candidate, all[1 - index] as Lab);
    }
    return ciede2000(candidate, combined);
  }
}
