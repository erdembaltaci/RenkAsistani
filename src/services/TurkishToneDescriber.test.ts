import { describe, expect, it } from 'vitest';
import { rgbToLab } from '../domain/colorSpace';
import { hexToRgb } from '../domain/hex';
import { TurkishToneDescriber } from './TurkishToneDescriber';

const describer = new TurkishToneDescriber();
const describeHex = (hex: string): string => describer.describe(rgbToLab(hexToRgb(hex)));

describe('TurkishToneDescriber', () => {
  it('nötr renkleri açıklığına göre gri olarak anlatır', () => {
    expect(describeHex('#FFFFFF')).toBe('Beyaza yakın');
    expect(describeHex('#000000')).toBe('Siyaha yakın');
    expect(describeHex('#D9D9D9')).toBe('Çok açık gri');
    expect(describeHex('#858585')).toBe('Orta gri');
    expect(describeHex('#5B5A59')).toBe('Koyu gri');
  });

  it('hafif renk sapması olan griyi bu sapmayla anlatır', () => {
    expect(describeHex('#A5AEA6')).toBe('Açık, hafif yeşilimsi gri');
    expect(describeHex('#9AA6B2')).toBe('Açık, hafif mavimsi gri');
  });

  it('açık ve soluk bir yeşili "soluk" ile anlatır', () => {
    expect(describeHex('#BCE6CF')).toMatch(/^Çok açık, soluk .*yeşil/);
  });

  it('açık kırmızıyı pembe olarak anlatır', () => {
    expect(describeHex('#F5BCCB')).toMatch(/pembe/);
  });

  it('koyu turuncu-kahve tonlarını kahverengi olarak anlatır', () => {
    expect(describeHex('#7A5232')).toMatch(/kahverengi/);
    expect(describeHex('#4C3220')).toMatch(/^(Çok koyu|Koyu) .*kahverengi/);
  });

  it('soluk açık sarımsı tonları bej olarak anlatır', () => {
    expect(describeHex('#E5D8C2')).toMatch(/bej/);
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
});
