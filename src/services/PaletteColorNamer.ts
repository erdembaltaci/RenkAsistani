import { rgbToLab } from '../domain/colorSpace';
import { ciede2000 } from '../domain/deltaE';
import { hexToRgb } from '../domain/hex';
import type { Lab, NamedColor } from '../domain/types';
import type { ColorMatch, ColorNamer, NameResult } from './ColorNamer';

interface PaletteEntry {
  color: NamedColor;
  lab: Lab;
}

const DEFAULT_AMBIGUITY_MARGIN = 1.5;

export class PaletteColorNamer implements ColorNamer {
  private readonly entries: readonly PaletteEntry[];

  constructor(
    palette: readonly NamedColor[],
    private readonly ambiguityMargin: number = DEFAULT_AMBIGUITY_MARGIN,
  ) {
    if (palette.length < 2) {
      throw new Error('Sözlükte en az iki renk olmalı');
    }
    this.entries = palette.map((color) => ({ color, lab: rgbToLab(hexToRgb(color.hex)) }));
  }

  name(target: Lab): NameResult {
    let first: ColorMatch | null = null;
    let second: ColorMatch | null = null;

    for (const { color, lab } of this.entries) {
      const match: ColorMatch = { name: color.name, hex: color.hex, distance: ciede2000(target, lab) };
      if (first === null || match.distance < first.distance) {
        second = first;
        first = match;
      } else if (second === null || match.distance < second.distance) {
        second = match;
      }
    }

    // Kurucu en az iki renk garanti ettiği için ikisi de doludur.
    const primary = first as ColorMatch;
    const secondary = second as ColorMatch;
    return {
      primary,
      secondary,
      isAmbiguous: secondary.distance - primary.distance < this.ambiguityMargin,
    };
  }
}
