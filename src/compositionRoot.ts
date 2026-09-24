import { COLOR_PALETTE } from './data/colors';
import type { AppServices } from './services/AppServices';
import { CanvasImageLoader } from './services/CanvasImageLoader';
import type { KeyValueStorage } from './services/KeyValueStorage';
import { LocalStorageColorStore } from './services/LocalStorageColorStore';
import { MedianColorAggregator } from './services/MedianColorAggregator';
import { MemoryStorage } from './services/MemoryStorage';
import { PaletteColorNamer } from './services/PaletteColorNamer';
import { RobustColorSampler } from './services/RobustColorSampler';
import { TurkishToneDescriber } from './services/TurkishToneDescriber';

// Özel gezinti veya kapalı site verisi gibi durumlarda localStorage erişimi hata verebilir.
function pickStorage(): { storage: KeyValueStorage; isPersistent: boolean } {
  try {
    const probe = '__renk_asistani_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return { storage: window.localStorage, isPersistent: true };
  } catch {
    return { storage: new MemoryStorage(), isPersistent: false };
  }
}

/** Somut sınıfların seçildiği tek yer: bir servisi değiştirmek için sadece burası düzenlenir. */
export function createServices(): AppServices {
  const { storage, isPersistent } = pickStorage();
  return {
    imageLoader: new CanvasImageLoader(),
    sampler: new RobustColorSampler(),
    namer: new PaletteColorNamer(COLOR_PALETTE),
    aggregator: new MedianColorAggregator(),
    toneDescriber: new TurkishToneDescriber(),
    colorStore: new LocalStorageColorStore(storage, { isPersistent }),
  };
}
