import type { Lab } from './types';

export type LightnessLevel = 'veryDark' | 'dark' | 'medium' | 'light' | 'veryLight';
export type ChromaLevel = 'neutral' | 'tinted' | 'muted' | 'moderate' | 'vivid';

export interface Tone {
  lightness: LightnessLevel;
  chroma: ChromaLevel;
  /** Lab tonu, derece cinsinden 0–360 (0 = +a ekseni). Nötr renklerde anlamsızdır. */
  hue: number;
  /** Lab L* değeri; "beyaza/siyaha yakın" gibi uç durumlar için. */
  l: number;
}

const LIGHTNESS_UPPER_BOUNDS: ReadonlyArray<readonly [number, LightnessLevel]> = [
  [22, 'veryDark'],
  [40, 'dark'],
  [62, 'medium'],
  [80, 'light'],
];

const CHROMA_UPPER_BOUNDS: ReadonlyArray<readonly [number, ChromaLevel]> = [
  [4, 'neutral'],
  [10, 'tinted'],
  [30, 'muted'],
  [55, 'moderate'],
];

const levelFor = <T>(value: number, bounds: ReadonlyArray<readonly [number, T]>, fallback: T): T =>
  bounds.find(([upper]) => value < upper)?.[1] ?? fallback;

export function analyzeTone({ l, a, b }: Lab): Tone {
  const degrees = (Math.atan2(b, a) * 180) / Math.PI;
  return {
    lightness: levelFor(l, LIGHTNESS_UPPER_BOUNDS, 'veryLight'),
    chroma: levelFor(Math.hypot(a, b), CHROMA_UPPER_BOUNDS, 'vivid'),
    hue: (degrees + 360) % 360,
    l,
  };
}
