import { robustCenter } from '../domain/robustCenter';
import type { Lab, PixelBuffer, Point } from '../domain/types';
import type { ColorSampler } from './ColorSampler';
import { centerWeightedSamples, focusSamples } from './samplingWindows';

export class RobustColorSampler implements ColorSampler {
  sample(image: PixelBuffer, focus?: Point): Lab {
    const samples = focus ? focusSamples(image, focus) : centerWeightedSamples(image);
    if (samples.length === 0) {
      throw new Error('Görselde okunabilir piksel bulunamadı');
    }
    return robustCenter(samples);
  }
}
