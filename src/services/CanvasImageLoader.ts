import type { ImageLoader, LoadedImage } from './ImageLoader';

const DEFAULT_MAX_SIDE = 800;
const PREVIEW_QUALITY = 0.9;

export class CanvasImageLoader implements ImageLoader {
  constructor(private readonly maxSide: number = DEFAULT_MAX_SIDE) {}

  async load(file: Blob): Promise<LoadedImage> {
    const url = URL.createObjectURL(file);
    try {
      const image = await this.decode(url);
      const scale = Math.min(1, this.maxSide / Math.max(image.naturalWidth, image.naturalHeight));
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) {
        throw new Error('Tarayıcı görsel işlemeyi desteklemiyor');
      }
      context.drawImage(image, 0, 0, width, height);

      return {
        pixels: context.getImageData(0, 0, width, height),
        previewUrl: canvas.toDataURL('image/jpeg', PREVIEW_QUALITY),
      };
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  // <img> EXIF yönünü tarayıcı düzeyinde uygular; createImageBitmap bunu eski Safari sürümlerinde yapmaz.
  private async decode(url: string): Promise<HTMLImageElement> {
    const image = new Image();
    image.src = url;
    await image.decode();
    return image;
  }
}
