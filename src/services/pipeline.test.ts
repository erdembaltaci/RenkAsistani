import { describe, expect, it } from 'vitest';
import { COLOR_PALETTE } from '../data/colors';
import { rgbToLab } from '../domain/colorSpace';
import { ciede2000 } from '../domain/deltaE';
import { hexToRgb } from '../domain/hex';
import type { Rgb } from '../domain/types';
import { centeredSquare, makeBuffer, solid, type PixelPainter } from './__fixtures__/pixelBuffers';
import { PaletteColorNamer } from './PaletteColorNamer';
import { RobustColorSampler } from './RobustColorSampler';

const sampler = new RobustColorSampler();
const namer = new PaletteColorNamer(COLOR_PALETTE);
const size = { width: 160, height: 120 };
const background: Rgb = { r: 244, g: 244, b: 242 };

/** Doku gürültüsü ve yukarıdan aşağıya hafif gölge içeren sentetik kumaş. */
function fabric(base: Rgb): PixelPainter {
  return (x, y) => {
    const texture = (((x * 31 + y * 17) % 9) - 4) / 4;
    const shade = 1 - 0.05 * (y / size.height);
    return {
      r: (base.r + texture * 6) * shade,
      g: (base.g - texture * 6) * shade,
      b: (base.b + texture * 4) * shade,
    };
  };
}

const isPale = ({ hex }: { hex: string }): boolean => rgbToLab(hexToRgb(hex)).l > 75;

describe('sentetik fotoğraftan renk adı (uçtan uca)', () => {
  const paleColors = COLOR_PALETTE.filter(isPale);

  it('soluk tonlarda ölçülen renk, gerçek renge ΔE ≤ 4 yakın kalır', () => {
    const tooFar = paleColors.flatMap(({ name, hex }) => {
      const truth = rgbToLab(hexToRgb(hex));
      const image = makeBuffer(size.width, size.height, centeredSquare(fabric(hexToRgb(hex)), solid(background), size, 0.6));
      const distance = ciede2000(truth, sampler.sample(image));
      return distance > 4 ? [`${name} (${distance.toFixed(1)})`] : [];
    });
    expect(tooFar).toEqual([]);
  });

  it('soluk tonların çoğunda ilk iki addan biri doğru renktir', () => {
    const misses = paleColors.flatMap(({ name, hex }) => {
      const image = makeBuffer(size.width, size.height, centeredSquare(fabric(hexToRgb(hex)), solid(background), size, 0.6));
      const { primary, secondary } = namer.name(sampler.sample(image));
      return primary.name === name || secondary.name === name ? [] : [name];
    });
    const hitRate = 1 - misses.length / paleColors.length;
    expect(hitRate, `kaçırılanlar: ${misses.join(', ')}`).toBeGreaterThanOrEqual(0.9);
  });

  it('açık gri ile soluk yeşil ürünler farklı adlar alır', () => {
    const grayImage = makeBuffer(size.width, size.height, centeredSquare(fabric({ r: 214, g: 214, b: 216 }), solid(background), size, 0.6));
    const greenImage = makeBuffer(size.width, size.height, centeredSquare(fabric({ r: 198, g: 226, b: 203 }), solid(background), size, 0.6));
    const gray = namer.name(sampler.sample(grayImage)).primary.name;
    const green = namer.name(sampler.sample(greenImage)).primary.name;
    expect(gray).toMatch(/gri/i);
    expect(green).not.toMatch(/^(Açık gri|Gümüş gri|Çok açık gri)$/);
  });
});
