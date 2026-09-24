import { describe, expect, it } from 'vitest';
import { rgbToLab } from '../domain/colorSpace';
import { hexToRgb } from '../domain/hex';
import { TurkishToneDescriber } from './TurkishToneDescriber';

const describer = new TurkishToneDescriber();
const describeHex = (hex: string): string => describer.describe(rgbToLab(hexToRgb(hex)));

describe('TurkishToneDescriber', () => {
  it('nötr renkleri sözlükteki gri adlarıyla tutarlı şekilde anlatır', () => {
    expect(describeHex('#FFFFFF')).toBe('Beyaza yakın');
    expect(describeHex('#000000')).toBe('Siyaha yakın');
    expect(describeHex('#EBEBEB')).toBe('Çok açık gri');
    expect(describeHex('#F7F8F9')).toBe('Beyaza yakın');
    expect(describeHex('#D9D9D9')).toBe('Açık gri');
    expect(describeHex('#9B9B9B')).toBe('Orta açık gri');
    expect(describeHex('#858585')).toBe('Orta gri');
    expect(describeHex('#5B5A59')).toBe('Koyu gri');
  });

  it('hafif renk sapması olan griyi bu sapmayla anlatır', () => {
    expect(describeHex('#A5AEA6')).toBe('Orta açıklıkta, hafif yeşilimsi gri');
    expect(describeHex('#C7D0D8')).toBe('Açık, hafif mavimsi gri');
  });

  it('açık ve soluk bir yeşili "soluk" ile anlatır', () => {
    expect(describeHex('#BCE6CF')).toMatch(/^(Çok açık|Açık), soluk .*yeşil/);
  });

  it('açık kırmızıyı pembe olarak anlatır', () => {
    expect(describeHex('#F5BCCB')).toMatch(/pembe/);
    expect(describeHex('#F290B0')).toMatch(/pembe/);
  });

  it('koyu turuncu-kahve tonlarını kahverengi olarak anlatır', () => {
    expect(describeHex('#7A5232')).toMatch(/kahverengi/);
    expect(describeHex('#4C3220')).toMatch(/^(Çok koyu|Koyu) .*kahverengi/);
  });

  it('soluk açık sarımsı tonları bej olarak anlatır', () => {
    expect(describeHex('#E5D8C2')).toMatch(/bej/);
    expect(describeHex('#D8C3A5')).toMatch(/bej/);
  });

  it('vişne çürüğünü koyu ve kırmızımsı bir ton olarak tarif eder', () => {
    const text = describeHex('#5E1626');
    expect(text).toMatch(/koyu/i);
    expect(text).toMatch(/kırmızı/);
  });

  it('canlı renklerde "canlı" der', () => {
    expect(describeHex('#FF0000')).toContain('canlı');
  });

  it('mavi ve mor tonlarını birbirinden ayırır', () => {
    expect(describeHex('#1F2A4D')).toMatch(/mavi/);
    expect(describeHex('#7A3E9D')).toMatch(/mor/);
  });

  it('sözlükteki her renk için boş olmayan bir açıklama üretir', async () => {
    const { COLOR_PALETTE } = await import('../data/colors');
    for (const { name, hex } of COLOR_PALETTE) {
      expect(describeHex(hex).length, name).toBeGreaterThan(3);
    }
  });
});

describe('TurkishToneDescriber mavi/mor ayrımı', () => {
  it.each(['#1F2A4D', '#2A3A78', '#1B4FB8'])('%s mavi olarak anlatılır', (hex) => {
    expect(describeHex(hex)).toMatch(/mavi$/);
  });

  it.each(['#7A3E9D', '#8A6BBE', '#B398D6', '#653B84'])('%s mor olarak anlatılır', (hex) => {
    expect(describeHex(hex)).toMatch(/mor$/);
  });

  it('mavimsi lavantayı "morumsu mavi" diye anlatır', () => {
    expect(describeHex('#C7BFE6')).toMatch(/morumsu mavi$/);
  });
});

describe('TurkishToneDescriber zeytin tonları', () => {
  it.each(['#343113', '#474403', '#746747'])('%s koyu sarı değil, zeytin/kahverengi olarak anlatılır', (hex) => {
    expect(describeHex(hex)).toMatch(/zeytin|kahverengi/);
  });

  it('parlak sarı hâlâ sarıdır', () => {
    expect(describeHex('#F7D117')).toMatch(/sarı/);
  });
});
