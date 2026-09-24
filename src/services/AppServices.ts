import type { ColorAggregator } from './ColorAggregator';
import type { ColorNamer } from './ColorNamer';
import type { ColorStore } from './ColorStore';
import type { ColorSampler } from './ColorSampler';
import type { ImageLoader } from './ImageLoader';
import type { ToneDescriber } from './ToneDescriber';

/** Uygulamanın ihtiyaç duyduğu tüm servisler; somut sınıfları yalnızca `compositionRoot` bilir. */
export interface AppServices {
  imageLoader: ImageLoader;
  sampler: ColorSampler;
  namer: ColorNamer;
  aggregator: ColorAggregator;
  toneDescriber: ToneDescriber;
  colorStore: ColorStore;
}
