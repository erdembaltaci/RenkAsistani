import { COLOR_PALETTE } from './data/colors';
import type { AppServices } from './services/AppServices';
import { CanvasColorCardRenderer } from './services/CanvasColorCardRenderer';
import { CanvasImageLoader } from './services/CanvasImageLoader';
import { copyTextToClipboard } from './services/clipboard';
import type { KeyValueStorage } from './services/KeyValueStorage';
import { LocalStorageColorStore } from './services/LocalStorageColorStore';
import { MedianColorAggregator } from './services/MedianColorAggregator';
import { MemoryStorage } from './services/MemoryStorage';
import { PaletteColorNamer } from './services/PaletteColorNamer';
import { RobustColorSampler } from './services/RobustColorSampler';
import { TurkishToneDescriber } from './services/TurkishToneDescriber';
import { WebColorSharer } from './services/WebColorSharer';
import { WebNotesExporter } from './services/WebNotesExporter';
import { WhiteReferenceCorrector } from './services/WhiteReferenceCorrector';

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

function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
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
    lightCorrector: new WhiteReferenceCorrector(),
    colorStore: new LocalStorageColorStore(storage, { isPersistent }),
    sharer: new WebColorSharer({
      navigator,
      renderer: new CanvasColorCardRenderer(),
      openUrl: (url) => {
        window.open(url, '_blank', 'noopener');
      },
      copyText: copyTextToClipboard,
    }),
    exporter: new WebNotesExporter({
      navigator,
      download: downloadFile,
      preferShare: window.matchMedia('(pointer: coarse)').matches,
    }),
  };
}
