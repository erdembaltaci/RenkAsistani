import { describe, expect, it } from 'vitest';
import { hexToRgb, isValidHex, rgbToHex } from './hex';

describe('rgbToHex', () => {
  it('büyük harfli #RRGGBB üretir', () => {
    expect(rgbToHex({ r: 255, g: 255, b: 255 })).toBe('#FFFFFF');
    expect(rgbToHex({ r: 0, g: 0, b: 0 })).toBe('#000000');
    expect(rgbToHex({ r: 10, g: 171, b: 255 })).toBe('#0AABFF');
  });

  it('ondalıkları yuvarlar ve aralık dışını sıkıştırır', () => {
    expect(rgbToHex({ r: 254.6, g: -4, b: 300 })).toBe('#FF00FF');
  });
});

describe('hexToRgb', () => {
  it('hex kodunu ayrıştırır', () => {
    expect(hexToRgb('#0aabff')).toEqual({ r: 10, g: 171, b: 255 });
  });

  it('geçersiz girdide hata fırlatır', () => {
    expect(() => hexToRgb('red')).toThrow();
    expect(() => hexToRgb('#12345')).toThrow();
  });

  it('rgbToHex ile gidiş dönüşte tutarlıdır', () => {
    expect(rgbToHex(hexToRgb('#7A3E9D'))).toBe('#7A3E9D');
  });
});

describe('isValidHex', () => {
  it('yalnızca 6 haneli #hex kabul eder', () => {
    expect(isValidHex('#A1b2C3')).toBe(true);
    expect(isValidHex('A1B2C3')).toBe(false);
    expect(isValidHex('#ABC')).toBe(false);
    expect(isValidHex('#GGGGGG')).toBe(false);
  });
});
