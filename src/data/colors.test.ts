import { describe, expect, it } from 'vitest';
import { rgbToLab } from '../domain/colorSpace';
import { ciede2000 } from '../domain/deltaE';
import { hexToRgb, isValidHex } from '../domain/hex';
import type { Lab } from '../domain/types';
import { COLOR_PALETTE } from './colors';

const normalized = (name: string): string => name.toLocaleLowerCase('tr');

describe('COLOR_PALETTE', () => {
  it('geniş bir sözlük sunar', () => {
    expect(COLOR_PALETTE.length).toBeGreaterThanOrEqual(400);
  });

  it('her rengin adı benzersiz ve hex kodu geçerlidir', () => {
    const names = new Set<string>();
    const hexes = new Set<string>();
    for (const { name, hex } of COLOR_PALETTE) {
      expect(isValidHex(hex), `${name}: ${hex}`).toBe(true);
      expect(names.has(normalized(name)), `tekrar eden ad: ${name}`).toBe(false);
      expect(hexes.has(hex.toUpperCase()), `tekrar eden hex: ${name} ${hex}`).toBe(false);
      names.add(normalized(name));
      hexes.add(hex.toUpperCase());
    }
  });

  it('iki renk gözle ayırt edilemeyecek kadar birbirine yakın değildir', () => {
    const labs = COLOR_PALETTE.map(({ hex }) => rgbToLab(hexToRgb(hex)));
    const tooClose: string[] = [];
    for (let i = 0; i < labs.length; i++) {
      for (let j = i + 1; j < labs.length; j++) {
        const distance = ciede2000(labs[i] as Lab, labs[j] as Lab);
        if (distance < 2) {
          tooClose.push(`${COLOR_PALETTE[i]?.name} ~ ${COLOR_PALETTE[j]?.name} (${distance.toFixed(2)})`);
        }
      }
    }
    expect(tooClose).toEqual([]);
  });

  it('soluk nötr ve pastel tonlar açıkça tanımlıdır', () => {
    const required = [
      'Açık gri', 'Gri', 'Antrasit', 'Ekru', 'Bej', 'Krem', 'Nane yeşili', 'Adaçayı',
      'Pudra pembe', 'Açık pembe', 'Açık yeşil', 'Açık mavi', 'Vişne çürüğü', 'Lila', 'Lavanta',
    ];
    const available = new Set(COLOR_PALETTE.map(({ name }) => name));
    for (const name of required) {
      expect(available.has(name), name).toBe(true);
    }
  });

  it('açık ve koyu varyantlar sözlükte tek tek yer alır', () => {
    const available = new Set(COLOR_PALETTE.map(({ name }) => name));
    for (const name of ['Koyu gri', 'Çok açık gri', 'Koyu yeşil', 'Açık kahverengi', 'Koyu kahverengi', 'Açık mor', 'Koyu mor']) {
      expect(available.has(name), name).toBe(true);
    }
  });
});
