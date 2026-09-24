import { formatColorText } from '../domain/savedColor';
import type { ColorCard, ColorCardRenderer } from './ColorCardRenderer';
import type { ColorSharer, ShareOutcome } from './ColorSharer';
import { isAbortError, type ShareCapableNavigator } from './ShareCapableNavigator';

interface WebColorSharerDeps {
  navigator: ShareCapableNavigator;
  renderer: ColorCardRenderer;
  copyImage: (file: File) => Promise<boolean>;
  download: (file: File) => void;
  copyText: (text: string) => Promise<boolean>;
}

/**
 * Paylaşılan şey her zaman "renk kartı" görselidir. Sıra: paylaşım penceresi (dosya destekleniyorsa) →
 * görseli panoya kopyala → PNG indir. Düz metin yalnızca görsel hiç çizilemezse kullanılır.
 */
export class WebColorSharer implements ColorSharer {
  constructor(private readonly deps: WebColorSharerDeps) {}

  // Önemli: paylaşım penceresi veya pano yazımı çağrılmadan önce hiçbir `await` olmamalı. Safari, bunları yalnızca
  // dokunuşla aynı işlem turunda açmaya izin verir; kart bu yüzden senkron çizilir.
  async share(color: ColorCard): Promise<ShareOutcome> {
    const { navigator, renderer, copyImage, download, copyText } = this.deps;
    const file = renderer.render(color);

    if (!file) {
      return (await copyText(formatColorText(color))) ? 'copiedText' : 'failed';
    }

    // Yalnızca görsel gönderilir: kart zaten ad, hex, ton ve notu içerir; bazı uygulamalar dosyayla birlikte gelen
    // metni atlar veya görselin yerine yalnızca metni alır.
    if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: color.name });
        return 'shared';
      } catch (error) {
        if (isAbortError(error)) return 'cancelled';
        // Paylaşım penceresi açılamadıysa pano ve indirme denenir.
      }
    }

    if (await copyImage(file)) return 'copiedImage';

    try {
      download(file);
      return 'downloaded';
    } catch {
      return 'failed';
    }
  }
}
