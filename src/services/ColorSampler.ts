import type { Lab, PixelBuffer, Point } from '../domain/types';

export interface ColorSampler {
  /** `focus` verilmezse merkez ağırlıklı otomatik tespit; verilirse o noktanın çevresi okunur. */
  sample(image: PixelBuffer, focus?: Point): Lab;
}
