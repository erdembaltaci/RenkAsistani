import type { PixelBuffer } from '../domain/types';

export interface LoadedImage {
  /** Küçültülmüş görselin pikselleri; renk okuma bunun üzerinden yapılır. */
  pixels: PixelBuffer;
  /** Ekranda gösterilecek, `pixels` ile birebir aynı görüntü. */
  previewUrl: string;
}

export interface ImageLoader {
  load(file: Blob): Promise<LoadedImage>;
}
