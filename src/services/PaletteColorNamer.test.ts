import { describe, expect, it } from 'vitest';
import { COLOR_PALETTE } from '../data/colors';
import { rgbToLab } from '../domain/colorSpace';
import { hexToRgb } from '../domain/hex';
import { PaletteColorNamer } from './PaletteColorNamer';

const namer = new PaletteColorNamer(COLOR_PALETTE);
const nameOf = (hex: string) => namer.name(rgbToLab(hexToRgb(hex)));

describe('PaletteColorNamer', () => {
  it('saf beyaz ve siyahı doğru adlandırır', () => {
    expect(nameOf('#FFFFFF').primary.name).toBe('Beyaz');
    expect(nameOf('#000000').primary.name).toBe('Siyah');
  });

  it('sözlükteki her rengi kendi adıyla bulur', () => {
    const wrong = COLOR_PALETTE.filter(({ name, hex }) => nameOf(hex).primary.name !== name);
    expect(wrong).toEqual([]);
  });

  it('bir renkten çok az sapan ölçümü yine aynı adla bulur', () => {
    const wrong: string[] = [];
    for (const { name, hex } of COLOR_PALETTE) {
      const { r, g, b } = hexToRgb(hex);
      const nudged = rgbToLab({ r: Math.min(255, r + 1), g: Math.max(0, g - 1), b: Math.min(255, b + 1) });
      if (namer.name(nudged).primary.name !== name) wrong.push(name);
    }
    expect(wrong).toEqual([]);
  });

  it.each([
    ['#D3D3D3', /gri/i],
    ['#FFC0CB', /pembe/i],
    ['#90EE90', /yeşil|nane/i],
    ['#98FF98', /nane|yeşil/i],
    ['#ADD8E6', /mavi|buz/i],
    ['#E6E6FA', /lavanta|lila|mavi/i],
    ['#F5F5DC', /krem|fildişi|ekru|beyaz|sarı|bej/i],
    ['#FFF0F5', /pembe|beyaz|orkide|gül/i],
    ['#B0C4DE', /mavi|gri|toz|kayrak|sis/i],
  ])('bilinen pastel %s için makul bir aile adı verir', (hex, family) => {
    expect(nameOf(hex).primary.name).toMatch(family);
  });

  it('açık grinin adında "gri" geçer ve soluk yeşilden ayrı adlandırılır', () => {
    const gray = nameOf('#D6D6D6').primary.name;
    const green = nameOf('#CFE3CF').primary.name;
    expect(gray).toMatch(/gri/i);
    expect(green).not.toBe(gray);
  });

  it('koyu tonlar açık tonlarla karışmaz', () => {
    expect(nameOf('#3B3B3B').primary.name).toMatch(/gri|antrasit|kömür|siyah|füme/i);
    expect(nameOf('#5E1626').primary.name).toMatch(/vişne|bordo|şarap|kan|kara/i);
  });

  it('ikinci en yakın rengi, birinciden farklı olarak döndürür', () => {
    const result = nameOf('#C6C6C6');
    expect(result.secondary.name).not.toBe(result.primary.name);
    expect(result.secondary.distance).toBeGreaterThanOrEqual(result.primary.distance);
  });

  it('iki sözlük rengi arasında kalan ölçümü belirsiz işaretler', () => {
    const first = rgbToLab(hexToRgb('#D9D9D9'));
    const second = rgbToLab(hexToRgb('#C6C6C6'));
    const midpoint = { l: (first.l + second.l) / 2, a: (first.a + second.a) / 2, b: (first.b + second.b) / 2 };

    const result = namer.name(midpoint);
    expect(result.isAmbiguous).toBe(true);
    expect([result.primary.name, result.secondary.name].sort()).toEqual(['Açık gri', 'Gümüş gri']);
  });

  it('tam eşleşmeyi belirsiz işaretlemez', () => {
    expect(nameOf('#D9D9D9').isAmbiguous).toBe(false);
  });

  it('enjekte edilen sözlüğü kullanır (bağımlılık tersine çevirme)', () => {
    const custom = new PaletteColorNamer([
      { name: 'Deneme kırmızısı', hex: '#FF0000' },
      { name: 'Deneme mavisi', hex: '#0000FF' },
    ]);
    expect(custom.name(rgbToLab({ r: 230, g: 20, b: 20 })).primary.name).toBe('Deneme kırmızısı');
    expect(custom.name(rgbToLab({ r: 20, g: 20, b: 230 })).primary.name).toBe('Deneme mavisi');
  });

  it('tek renkli sözlükte hata fırlatır', () => {
    expect(() => new PaletteColorNamer([{ name: 'Tek', hex: '#FFFFFF' }])).toThrow();
  });
});
