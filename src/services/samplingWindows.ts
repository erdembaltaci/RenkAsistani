import { rgbToLab } from '../domain/colorSpace';
import type { Lab, PixelBuffer, Point, WeightedLab } from '../domain/types';

const MAX_SAMPLES_PER_AXIS = 64;
const CENTER_SIGMA = 0.12;
const FOCUS_RADIUS_RATIO = 0.04;
const MIN_FOCUS_RADIUS_PX = 4;
const MAX_FOCUS_STEPS = 12;
const OPAQUE_ALPHA = 128;

function labAt(image: PixelBuffer, x: number, y: number): Lab | null {
  const offset = (y * image.width + x) * 4;
  const alpha = image.data[offset + 3] as number;
  if (alpha < OPAQUE_ALPHA) return null;
  return rgbToLab({
    r: image.data[offset] as number,
    g: image.data[offset + 1] as number,
    b: image.data[offset + 2] as number,
  });
}

/** Ürün genellikle kadrajın ortasındadır; kenara doğru azalan ağırlık arka planın sonucu ezmesini önler. */
export function centerWeightedSamples(image: PixelBuffer): WeightedLab[] {
  const stepX = Math.max(1, Math.floor(image.width / MAX_SAMPLES_PER_AXIS));
  const stepY = Math.max(1, Math.floor(image.height / MAX_SAMPLES_PER_AXIS));
  const samples: WeightedLab[] = [];

  for (let y = 0; y < image.height; y += stepY) {
    for (let x = 0; x < image.width; x += stepX) {
      const lab = labAt(image, x, y);
      if (!lab) continue;
      const dx = (x + 0.5) / image.width - 0.5;
      const dy = (y + 0.5) / image.height - 0.5;
      const weight = Math.exp(-(dx * dx + dy * dy) / (2 * CENTER_SIGMA * CENTER_SIGMA));
      samples.push({ lab, weight });
    }
  }
  return samples;
}

/** Dokunulan noktanın çevresindeki dairesel bölge; tüm pikseller eşit ağırlıklıdır. */
export function focusSamples(image: PixelBuffer, focus: Point): WeightedLab[] {
  const radius = Math.max(MIN_FOCUS_RADIUS_PX, Math.min(image.width, image.height) * FOCUS_RADIUS_RATIO);
  const step = Math.max(1, Math.floor(radius / MAX_FOCUS_STEPS));
  const centerX = focus.x * image.width;
  const centerY = focus.y * image.height;

  const minX = Math.max(0, Math.floor(centerX - radius));
  const maxX = Math.min(image.width - 1, Math.ceil(centerX + radius));
  const minY = Math.max(0, Math.floor(centerY - radius));
  const maxY = Math.min(image.height - 1, Math.ceil(centerY + radius));

  const samples: WeightedLab[] = [];
  for (let y = minY; y <= maxY; y += step) {
    for (let x = minX; x <= maxX; x += step) {
      if (Math.hypot(x - centerX, y - centerY) > radius) continue;
      const lab = labAt(image, x, y);
      if (lab) samples.push({ lab, weight: 1 });
    }
  }
  return samples;
}
