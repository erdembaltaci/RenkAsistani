import type { ColorAggregator } from './ColorAggregator';
import type { ColorNamer } from './ColorNamer';
import type { ColorSampler } from './ColorSampler';
import type { ColorSharer } from './ColorSharer';
import type { ColorStore } from './ColorStore';
import type { ImageLoader } from './ImageLoader';
import type { LightCorrector } from './LightCorrector';
import type { NotesExporter } from './NotesExporter';
import type { ToneDescriber } from './ToneDescriber';

/** Uygulamanın ihtiyaç duyduğu tüm servisler; somut sınıfları yalnızca `compositionRoot` bilir. */
export interface AppServices {
  imageLoader: ImageLoader;
  sampler: ColorSampler;
  namer: ColorNamer;
  aggregator: ColorAggregator;
  toneDescriber: ToneDescriber;
  lightCorrector: LightCorrector;
  colorStore: ColorStore;
  sharer: ColorSharer;
  exporter: NotesExporter;
}
