import { describe, expect, it } from 'vitest';
import { rgbToLab } from '../domain/colorSpace';
import { deltaE76 } from '../domain/deltaE';
import type { Lab, Rgb } from '../domain/types';
import { MedianColorAggregator } from './MedianColorAggregator';

const labOf = (rgb: Rgb): Lab => rgbToLab(rgb);

const paleGreen = labOf({ r: 200, g: 224, b: 204 });
const paleGreenSlightlyBrighter = labOf({ r: 204, g: 227, b: 207 });
const paleGreenSlightlyDarker = labOf({ r: 196, g: 220, b: 200 });
const orange = labOf({ r: 240, g: 150, b: 60 });

const aggregator = new MedianColorAggregator();

describe('MedianColorAggregator', () => {
  it('tek fotoğrafta o rengi olduğu gibi döndürür ve sapma bildirmez', () => {
    const result = aggregator.aggregate([paleGreen]);
    expect(result.color).toEqual(paleGreen);
    expect(result.deviatingIndexes).toEqual([]);
    expect(result.deviations).toEqual([0]);
  });

  it('birbirine yakın fotoğraflarda medyanı verir ve uyarı çıkarmaz', () => {
    const result = aggregator.aggregate([paleGreen, paleGreenSlightlyBrighter, paleGreenSlightlyDarker]);
    expect(deltaE76(result.color, paleGreen)).toBeLessThan(0.5);
    expect(result.deviatingIndexes).toEqual([]);
  });

  it('bir aykırı fotoğraf medyanı kaydırmaz ve sapan olarak işaretlenir', () => {
    const result = aggregator.aggregate([paleGreen, orange, paleGreenSlightlyBrighter, paleGreenSlightlyDarker]);
    expect(deltaE76(result.color, paleGreen)).toBeLessThan(3);
    expect(result.deviatingIndexes).toEqual([1]);
  });

  it('sapma değerlerini girdiyle aynı sırada verir', () => {
    const result = aggregator.aggregate([paleGreen, orange, paleGreenSlightlyBrighter]);
    expect(result.deviations).toHaveLength(3);
    expect(result.deviations[1]).toBeGreaterThan(result.deviations[0] as number);
    expect(result.deviations[1]).toBeGreaterThan(result.deviations[2] as number);
  });

  it('iki fotoğraf birbirinden çok farklıysa ikisini de işaretler', () => {
    const result = aggregator.aggregate([paleGreen, orange]);
    expect(result.deviatingIndexes).toEqual([0, 1]);
  });

  it('iki fotoğraf birbirine yakınsa hiçbirini işaretlemez', () => {
    const result = aggregator.aggregate([paleGreen, paleGreenSlightlyBrighter]);
    expect(result.deviatingIndexes).toEqual([]);
  });

  it('sapma eşiği kurucudan ayarlanabilir', () => {
    const strict = new MedianColorAggregator(0.1);
    const result = strict.aggregate([paleGreen, paleGreenSlightlyBrighter, paleGreenSlightlyDarker]);
    expect(result.deviatingIndexes.length).toBeGreaterThan(0);
  });

  it('boş girdide hata fırlatır', () => {
    expect(() => aggregator.aggregate([])).toThrow();
  });
});
