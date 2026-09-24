import { COLOR_PALETTE } from './data/colors';
import type { AppServices } from './services/AppServices';
import { CanvasImageLoader } from './services/CanvasImageLoader';
import { MedianColorAggregator } from './services/MedianColorAggregator';
import { PaletteColorNamer } from './services/PaletteColorNamer';
import { RobustColorSampler } from './services/RobustColorSampler';
import { TurkishToneDescriber } from './services/TurkishToneDescriber';

/** Somut sınıfların seçildiği tek yer: bir servisi değiştirmek için sadece burası düzenlenir. */
export function createServices(): AppServices {
  return {
    imageLoader: new CanvasImageLoader(),
    sampler: new RobustColorSampler(),
    namer: new PaletteColorNamer(COLOR_PALETTE),
    aggregator: new MedianColorAggregator(),
    toneDescriber: new TurkishToneDescriber(),
  };
}
