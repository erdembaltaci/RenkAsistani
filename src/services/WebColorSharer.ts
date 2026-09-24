import { formatColorText } from '../domain/savedColor';
import type { ColorCard, ColorCardRenderer } from './ColorCardRenderer';
import type { ColorSharer, ShareOutcome } from './ColorSharer';

/** `navigator`ın paylaşımla ilgili alt kümesi; testte sahte bir nesneyle değiştirilebilir. */
export interface ShareCapableNavigator {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
}

interface WebColorSharerDeps {
  navigator: ShareCapableNavigator;
  renderer: ColorCardRenderer;
  openUrl: (url: string) => void;
  copyText: (text: string) => Promise<boolean>;
}

const isAbort = (error: unknown): boolean => (error as { name?: string } | null)?.name === 'AbortError';

export class WebColorSharer implements ColorSharer {
  constructor(private readonly deps: WebColorSharerDeps) {}

  // Önemli: `share` çağrısından önce hiçbir `await` olmamalı. Safari, paylaşım penceresini yalnızca
  // dokunuşla aynı işlem turunda açmaya izin verir; kart bu yüzden senkron çizilir.
  async share(color: ColorCard): Promise<ShareOutcome> {
    const text = formatColorText(color);
    const { navigator, renderer, openUrl, copyText } = this.deps;

    if (typeof navigator.share !== 'function') {
      openUrl(`https://wa.me/?text=${encodeURIComponent(text)}`);
      return 'whatsapp';
    }

    try {
      const file = renderer.render(color);
      const withImage: ShareData | null = file ? { files: [file], text } : null;
      const data: ShareData = withImage && navigator.canShare?.(withImage) ? withImage : { text };
      await navigator.share(data);
      return 'shared';
    } catch (error) {
      if (isAbort(error)) return 'cancelled';
      return (await copyText(text)) ? 'copied' : 'failed';
    }
  }
}
