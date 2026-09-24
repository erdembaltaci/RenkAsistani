import { describe, expect, it, vi } from 'vitest';
import type { ColorCard, ColorCardRenderer } from './ColorCardRenderer';
import type { ShareCapableNavigator } from './ShareCapableNavigator';
import { WebColorSharer } from './WebColorSharer';

const color: ColorCard = { name: 'Bordo', hex: '#6B0F1A', tone: 'Koyu kırmızı', code: 'A15', note: 'üretim ipi' };
const image = new File([new Uint8Array([1, 2, 3])], 'renk.png', { type: 'image/png' });

const makeSharer = (options: {
  navigator?: ShareCapableNavigator;
  file?: File | null;
  copyImage?: (file: File) => Promise<boolean>;
  download?: (file: File) => void;
  copyText?: (text: string) => Promise<boolean>;
}) => {
  const renderer: ColorCardRenderer = { render: () => (options.file === undefined ? image : options.file) };
  const copyImage = vi.fn(options.copyImage ?? (() => Promise.resolve(true)));
  const download = vi.fn(options.download ?? (() => undefined));
  const copyText = vi.fn(options.copyText ?? (() => Promise.resolve(true)));
  const sharer = new WebColorSharer({ navigator: options.navigator ?? {}, renderer, copyImage, download, copyText });
  return { sharer, copyImage, download, copyText };
};

describe('WebColorSharer', () => {
  it('dosya paylaşımı destekleniyorsa yalnızca görseli paylaşır (metin eklenmez)', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { sharer, copyImage } = makeSharer({ navigator: { share, canShare: () => true } });

    expect(await sharer.share(color)).toBe('shared');
    const data = share.mock.calls[0]?.[0] as ShareData;
    expect(data.files).toEqual([image]);
    expect(data.text).toBeUndefined();
    expect(copyImage).not.toHaveBeenCalled();
  });

  it('paylaşım penceresi dosyayı kabul etmiyorsa metne düşmez, görseli panoya kopyalar', async () => {
    const share = vi.fn();
    const { sharer, copyImage } = makeSharer({ navigator: { share, canShare: () => false } });

    expect(await sharer.share(color)).toBe('copiedImage');
    expect(share).not.toHaveBeenCalled();
    expect(copyImage).toHaveBeenCalledWith(image);
  });

  it('paylaşım desteği hiç yoksa (masaüstü) görseli panoya kopyalar; WhatsApp metni açmaz', async () => {
    const { sharer, copyImage, copyText } = makeSharer({ navigator: {} });

    expect(await sharer.share(color)).toBe('copiedImage');
    expect(copyImage).toHaveBeenCalledTimes(1);
    expect(copyText).not.toHaveBeenCalled();
  });

  it('pano görseli kabul etmezse PNG dosyasını indirir', async () => {
    const { sharer, download } = makeSharer({ navigator: {}, copyImage: () => Promise.resolve(false) });

    expect(await sharer.share(color)).toBe('downloaded');
    expect(download).toHaveBeenCalledWith(image);
  });

  it('kullanıcı paylaşımdan vazgeçerse "cancelled" döner, pano ve indirme kullanılmaz', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('iptal'), { name: 'AbortError' }));
    const { sharer, copyImage, download } = makeSharer({ navigator: { share, canShare: () => true } });

    expect(await sharer.share(color)).toBe('cancelled');
    expect(copyImage).not.toHaveBeenCalled();
    expect(download).not.toHaveBeenCalled();
  });

  it('paylaşım hata verirse görseli panoya kopyalamayı dener', async () => {
    const share = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    const { sharer, copyImage } = makeSharer({ navigator: { share, canShare: () => true } });

    expect(await sharer.share(color)).toBe('copiedImage');
    expect(copyImage).toHaveBeenCalledWith(image);
  });

  it('indirme de başarısız olursa "failed" döner', async () => {
    const { sharer } = makeSharer({
      navigator: {},
      copyImage: () => Promise.resolve(false),
      download: () => {
        throw new Error('engellendi');
      },
    });
    expect(await sharer.share(color)).toBe('failed');
  });

  it('görsel hiç çizilemezse son çare olarak metni panoya kopyalar', async () => {
    const { sharer, copyText } = makeSharer({ file: null });

    expect(await sharer.share(color)).toBe('copiedText');
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining('A15 · Bordo · #6B0F1A'));
  });

  it('görsel çizilemez ve pano da olmazsa "failed" döner', async () => {
    const { sharer } = makeSharer({ file: null, copyText: () => Promise.resolve(false) });
    expect(await sharer.share(color)).toBe('failed');
  });

  it('paylaşımı, hiçbir "await" olmadan senkron olarak başlatır (Safari kısıtı)', () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { sharer } = makeSharer({ navigator: { share, canShare: () => true } });

    void sharer.share(color);
    expect(share).toHaveBeenCalledTimes(1);
  });

  it('paylaşım desteği yokken panoya yazmayı da senkron başlatır', () => {
    const { sharer, copyImage } = makeSharer({ navigator: {} });

    void sharer.share(color);
    expect(copyImage).toHaveBeenCalledTimes(1);
  });
});
