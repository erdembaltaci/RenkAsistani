import type { Point } from './types';

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

export interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export function toNormalizedPoint(clientX: number, clientY: number, bounds: Bounds): Point {
  if (bounds.width <= 0 || bounds.height <= 0) {
    return { x: 0.5, y: 0.5 };
  }
  return {
    x: clampUnit((clientX - bounds.left) / bounds.width),
    y: clampUnit((clientY - bounds.top) / bounds.height),
  };
}
