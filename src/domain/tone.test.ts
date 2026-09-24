import { describe, expect, it } from 'vitest';
import { rgbToLab } from './colorSpace';
import { hexToRgb } from './hex';
import { analyzeTone } from './tone';

const toneOf = (hex: string) => analyzeTone(rgbToLab(hexToRgb(hex)));

describe('analyzeTone', () => {
  it('saf beyazı çok açık ve nötr bulur', () => {
    expect(toneOf('#FFFFFF')).toMatchObject({ lightness: 'veryLight', chroma: 'neutral' });
  });

  it('siyahı çok koyu ve nötr bulur', () => {
    expect(toneOf('#000000')).toMatchObject({ lightness: 'veryDark', chroma: 'neutral' });
  });

  it('gri basamaklarını sözlükteki adlarla uyumlu açıklık seviyelerine ayırır', () => {
    expect(toneOf('#EBEBEB').lightness).toBe('veryLight');
    expect(toneOf('#D9D9D9').lightness).toBe('light');
    expect(toneOf('#9B9B9B').lightness).toBe('mediumLight');
    expect(toneOf('#858585').lightness).toBe('medium');
    expect(toneOf('#6F6F6F').lightness).toBe('dark');
    expect(toneOf('#454545').lightness).toBe('dark');
    expect(toneOf('#2C2E31').lightness).toBe('veryDark');
  });

  it('soluk pastel ile canlı rengi ayırır', () => {
    expect(toneOf('#BCE6CF').chroma).toBe('muted');
    expect(toneOf('#FF0000').chroma).toBe('vivid');
  });

  it('çok az renk sapması olan griyi "tinted" sayar', () => {
    expect(toneOf('#A5AEA6').chroma).toBe('tinted');
  });

  it('ton açısını doğru bölgeye koyar', () => {
    expect(toneOf('#FF0000').hue).toBeGreaterThan(30);
    expect(toneOf('#FF0000').hue).toBeLessThan(50);
    expect(toneOf('#00FF00').hue).toBeGreaterThan(125);
    expect(toneOf('#00FF00').hue).toBeLessThan(145);
    expect(toneOf('#0000FF').hue).toBeGreaterThan(300);
    expect(toneOf('#0000FF').hue).toBeLessThan(312);
  });
});
