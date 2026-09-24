import type { Lab } from '../domain/types';

export interface AggregationResult {
  color: Lab;
  /** Her girdinin, birleşik sonuçtan (ΔE2000) ne kadar saptığı; girdiyle aynı sırada. */
  deviations: readonly number[];
  /** Belirgin sapan girdilerin dizinleri. */
  deviatingIndexes: readonly number[];
}

export interface ColorAggregator {
  aggregate(colors: readonly Lab[]): AggregationResult;
}
