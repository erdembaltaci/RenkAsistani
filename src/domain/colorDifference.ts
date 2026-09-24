import { rgbToLab } from './colorSpace';
import { ciede2000 } from './deltaE';
import { hexToRgb } from './hex';
import type { Lab } from './types';

export type DifferenceLevel = 'imperceptible' | 'slight' | 'noticeable' | 'clear' | 'different';
export type Comparison = 'first' | 'second' | 'same';

export interface ColorDifference {
  /** CIEDE2000 farkı. */
  deltaE: number;
  level: DifferenceLevel;
  /** Hangisi daha açık. */
  lighter: Comparison;
  /** Hangisi daha canlı (doygun). */
  moreVivid: Comparison;
}

// Tekstil ve boya sektöründe yaygın yorum: ΔE < 1 gözle ayırt edilemez, 1–2 çok küçük, 2–3.5 fark edilir.
const LEVEL_UPPER_BOUNDS: ReadonlyArray<readonly [number, DifferenceLevel]> = [
  [1, 'imperceptible'],
  [2, 'slight'],
  [3.5, 'noticeable'],
  [6, 'clear'],
];

const LIGHTNESS_TOLERANCE = 1.5;
const CHROMA_TOLERANCE = 2.5;

const which = (delta: number, tolerance: number): Comparison =>
  Math.abs(delta) < tolerance ? 'same' : delta > 0 ? 'second' : 'first';

export function compareColors(first: Lab, second: Lab): ColorDifference {
  const deltaE = ciede2000(first, second);
  const level = LEVEL_UPPER_BOUNDS.find(([upper]) => deltaE < upper)?.[1] ?? 'different';
  const chromaOf = ({ a, b }: Lab): number => Math.hypot(a, b);

  return {
    deltaE,
    level,
    lighter: which(second.l - first.l, LIGHTNESS_TOLERANCE),
    moreVivid: which(chromaOf(second) - chromaOf(first), CHROMA_TOLERANCE),
  };
}

export function compareHexColors(firstHex: string, secondHex: string): ColorDifference {
  return compareColors(rgbToLab(hexToRgb(firstHex)), rgbToLab(hexToRgb(secondHex)));
}
