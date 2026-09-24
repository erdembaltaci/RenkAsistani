import { describe, expect, it } from 'vitest';
import { rgbToLab } from '../domain/colorSpace';
import { deltaE76 } from '../domain/deltaE';
import type { Rgb } from '../domain/types';
import { centeredSquare, makeBuffer, solid, withTexture } from './__fixtures__/pixelBuffers';
import { RobustColorSampler } from './RobustColorSampler';

const sampler = new RobustColorSampler();
const size = { width: 120, height: 90 };

const white: Rgb = { r: 250, g: 250, b: 250 };
const shirtBlue: Rgb = { r: 60, g: 90, b: 160 };
const lightGray: Rgb = { r: 205, g: 205, b: 208 };

const distanceTo = (rgb: Rgb, lab: ReturnType<RobustColorSampler['sample']>): number => deltaE76(rgbToLab(rgb), lab);

describe('RobustColorSampler', () => {
  it('düz renkli görselde o rengi verir', () => {
    const image = makeBuffer(size.width, size.height, solid(lightGray));
    expect(distanceTo(lightGray, sampler.sample(image))).toBeLessThan(0.5);
  });

  it('otomatik modda merkezdeki ürünü seçer, arka planı değil', () => {
    const paint = centeredSquare(solid(shirtBlue), solid(white), size, 0.5);
    const image = makeBuffer(size.width, size.height, paint);
    expect(distanceTo(shirtBlue, sampler.sample(image))).toBeLessThan(3);
  });

  it('ürün kadrajı kısmen doldururken bile arka plana kaymaz', () => {
    const paint = centeredSquare(solid(shirtBlue), solid(white), size, 0.35);
    const image = makeBuffer(size.width, size.height, paint);
    expect(distanceTo(shirtBlue, sampler.sample(image))).toBeLessThan(3);
  });

  it('dokulu kumaşta gerçek renge yakın kalır', () => {
    const image = makeBuffer(size.width, size.height, withTexture(lightGray, 10));
    expect(distanceTo(lightGray, sampler.sample(image))).toBeLessThan(3);
  });

  it('soluk yeşil ve soluk grinin farkını korur', () => {
    const paleGreen: Rgb = { r: 200, g: 224, b: 204 };
    const paleGray: Rgb = { r: 210, g: 210, b: 210 };
    const greenLab = sampler.sample(makeBuffer(size.width, size.height, withTexture(paleGreen, 6)));
    const grayLab = sampler.sample(makeBuffer(size.width, size.height, withTexture(paleGray, 6)));
    expect(deltaE76(greenLab, grayLab)).toBeGreaterThan(6);
  });

  it('dokunulan noktanın çevresinden renk okur', () => {
    const paint = centeredSquare(solid(shirtBlue), solid(white), size, 0.5);
    const image = makeBuffer(size.width, size.height, paint);

    const onBackground = sampler.sample(image, { x: 0.05, y: 0.05 });
    const onProduct = sampler.sample(image, { x: 0.5, y: 0.5 });

    expect(distanceTo(white, onBackground)).toBeLessThan(1);
    expect(distanceTo(shirtBlue, onProduct)).toBeLessThan(1);
  });

  it('dokunulan bölgedeki küçük bir leke veya parlama sonucu bozmaz', () => {
    const paint = (x: number, y: number): Rgb => (x >= 58 && x <= 61 && y >= 43 && y <= 46 ? { r: 255, g: 255, b: 255 } : shirtBlue);
    const image = makeBuffer(size.width, size.height, paint);
    expect(distanceTo(shirtBlue, sampler.sample(image, { x: 0.5, y: 0.5 }))).toBeLessThan(1);
  });

  it('görselin köşesine dokunulunca da hata vermez', () => {
    const image = makeBuffer(size.width, size.height, solid(shirtBlue));
    expect(distanceTo(shirtBlue, sampler.sample(image, { x: 1, y: 1 }))).toBeLessThan(0.5);
    expect(distanceTo(shirtBlue, sampler.sample(image, { x: 0, y: 0 }))).toBeLessThan(0.5);
  });

  it('şeffaf pikselleri yok sayar', () => {
    const image = makeBuffer(size.width, size.height, solid(shirtBlue));
    for (let i = 3; i < image.data.length; i += 8) image.data[i] = 0;
    expect(distanceTo(shirtBlue, sampler.sample(image))).toBeLessThan(0.5);
  });

  it('tamamen şeffaf görselde hata fırlatır', () => {
    const image = makeBuffer(10, 10, solid(shirtBlue));
    for (let i = 3; i < image.data.length; i += 4) image.data[i] = 0;
    expect(() => sampler.sample(image)).toThrow();
  });
});
