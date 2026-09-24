import { describe, expect, it, vi } from 'vitest';
import type { ColorCard, ColorCardRenderer } from './ColorCardRenderer';
import type { ShareCapableNavigator } from './ShareCapableNavigator';
import { WebColorSharer } from './WebColorSharer';

const color: ColorCard = { name: 'Bordo', hex: '#6B0F1A', tone: 'Koyu kırmızı', code: '', note: 'A15 nolu üretim ipi' };
const image = new File([new Uint8Array([1, 2, 3])], 'renk.png', { type: 'image/png' });

const makeSharer = (options: {
  navigator?: ShareCapableNavigator;
  file?: File | null;
  copyText?: (text: string) => Promise<boolean>;
}) => {
  const renderer: ColorCardRenderer = { render: () => (options.file === undefined ? image : options.file) };
  const openUrl = vi.fn();
  const copyText = options.copyText ?? vi.fn().mockResolvedValue(true);
  const sharer = new WebColorSharer({ navigator: options.navigator ?? {}, renderer, openUrl, copyText });
  return { sharer, openUrl, copyText };
};

describe('WebColorSharer', () => {
  it('paylaşım desteği varsa görsel ve metinle birlikte paylaşır', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { sharer } = makeSharer({ navigator: { share, canShare: () => true } });

    expect(await sharer.share(color)).toBe('shared');
    const data = share.mock.calls[0]?.[0] as ShareData;
    expect(data.files).toEqual([image]);
    expect(data.text).toBe('Bordo · #6B0F1A · Koyu kırmızı\nNot: A15 nolu üretim ipi');
  });

  it('dosya paylaşımı desteklenmiyorsa yalnızca metin paylaşır', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { sharer } = makeSharer({ navigator: { share, canShare: () => false } });

    await sharer.share(color);
    const data = share.mock.calls[0]?.[0] as ShareData;
    expect(data.files).toBeUndefined();
    expect(data.text).toContain('Bordo');
  });

  it('görsel çizilemezse yalnızca metin paylaşır', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { sharer } = makeSharer({ navigator: { share, canShare: () => true }, file: null });

    await sharer.share(color);
    expect((share.mock.calls[0]?.[0] as ShareData).files).toBeUndefined();
  });

  it('kullanıcı vazgeçerse "cancelled" döner, WhatsApp veya pano kullanılmaz', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('iptal'), { name: 'AbortError' }));
    const { sharer, openUrl, copyText } = makeSharer({ navigator: { share } });

    expect(await sharer.share(color)).toBe('cancelled');
    expect(openUrl).not.toHaveBeenCalled();
    expect(copyText).not.toHaveBeenCalled();
  });

  it('paylaşım desteği yoksa WhatsApp bağlantısını açar', async () => {
    const { sharer, openUrl } = makeSharer({ navigator: {} });

    expect(await sharer.share(color)).toBe('whatsapp');
    const url = openUrl.mock.calls[0]?.[0] as string;
    expect(url.startsWith('https://wa.me/?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1] ?? '')).toContain('#6B0F1A');
  });

  it('paylaşım hata verirse metni panoya kopyalar', async () => {
    const share = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    const { sharer, copyText } = makeSharer({ navigator: { share } });

    expect(await sharer.share(color)).toBe('copied');
    expect(copyText).toHaveBeenCalledWith(expect.stringContaining('Bordo'));
  });

  it('pano da başarısızsa "failed" döner', async () => {
    const share = vi.fn().mockRejectedValue(new Error('hata'));
    const { sharer } = makeSharer({ navigator: { share }, copyText: () => Promise.resolve(false) });

    expect(await sharer.share(color)).toBe('failed');
  });

  it('paylaşımı, hiçbir "await" olmadan senkron olarak başlatır (Safari kısıtı)', () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { sharer } = makeSharer({ navigator: { share, canShare: () => true } });

    void sharer.share(color);
    expect(share).toHaveBeenCalledTimes(1);
  });
});
