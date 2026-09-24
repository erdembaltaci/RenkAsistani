import type { PixelBuffer, Rgb } from '../../domain/types';

export type PixelPainter = (x: number, y: number) => Rgb;

export function makeBuffer(width: number, height: number, paint: PixelPainter): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { r, g, b } = paint(x, y);
      const offset = (y * width + x) * 4;
      data[offset] = r;
      data[offset + 1] = g;
      data[offset + 2] = b;
      data[offset + 3] = 255;
    }
  }
  return { width, height, data };
}

export const solid = (rgb: Rgb): PixelPainter => () => rgb;

/** Kumaş dokusunu taklit eden, tekrarlanabilir (rastgele olmayan) küçük sapmalar. */
export function withTexture(base: Rgb, amount: number): PixelPainter {
  return (x, y) => {
    const wobble = (((x * 31 + y * 17) % 9) - 4) / 4;
    return {
      r: base.r + wobble * amount,
      g: base.g - wobble * amount,
      b: base.b + (((x * 7 + y * 13) % 5) - 2) * (amount / 2),
    };
  };
}

export function centeredSquare(
  inside: PixelPainter,
  outside: PixelPainter,
  size: { width: number; height: number },
  ratio: number,
): PixelPainter {
  return (x, y) => {
    const halfW = (size.width * ratio) / 2;
    const halfH = (size.height * ratio) / 2;
    const insideSquare = Math.abs(x - size.width / 2) <= halfW && Math.abs(y - size.height / 2) <= halfH;
    return insideSquare ? inside(x, y) : outside(x, y);
  };
}
