import { describe, expect, it, vi } from 'vitest';
import type { SavedColor } from '../domain/savedColor';
import type { ShareCapableNavigator } from './ShareCapableNavigator';
import { WebNotesExporter } from './WebNotesExporter';

const colors: SavedColor[] = [
  { id: '1', name: 'Bordo', hex: '#6B0F1A', tone: 'Koyu kırmızı', code: 'A15', note: 'ip', savedAt: new Date(2026, 8, 24, 12).getTime() },
];
const fixedNow = () => new Date(2026, 8, 24, 12);

const makeExporter = (options: { navigator?: ShareCapableNavigator; preferShare?: boolean; download?: (file: File) => void }) => {
  const download = vi.fn(options.download ?? (() => undefined));
  const exporter = new WebNotesExporter({
    navigator: options.navigator ?? {},
    download,
    preferShare: options.preferShare ?? false,
    now: fixedNow,
  });
  return { exporter, download };
};

describe('WebNotesExporter', () => {
  it('masaüstünde dosyayı doğrudan indirir', async () => {
    const share = vi.fn();
    const { exporter, download } = makeExporter({ navigator: { share, canShare: () => true }, preferShare: false });

    expect(await exporter.export(colors)).toBe('downloaded');
    expect(share).not.toHaveBeenCalled();
    const file = download.mock.calls[0]?.[0] as File;
    expect(file.name).toBe('renk-notlarim-2026-09-24.csv');
    expect(file.type).toContain('text/csv');
  });

  it('dosya içeriği Türkçe Excel için BOM ve başlık içerir', async () => {
    const { exporter, download } = makeExporter({});
    await exporter.export(colors);
    const file = download.mock.calls[0]?.[0] as File;
    // `File.text()` BOM'u okurken siler; bu yüzden ham baytlara bakılır (UTF-8 BOM: EF BB BF).
    const bytes = new Uint8Array(await file.arrayBuffer());
    expect([...bytes.slice(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
    const text = await file.text();
    expect(text).toContain('Tarih;Kod;Renk adı;Hex;Ton;Not');
    expect(text).toContain('A15;Bordo;#6B0F1A');
  });

  it('dokunmatik cihazda paylaşım penceresini kullanır', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const { exporter, download } = makeExporter({ navigator: { share, canShare: () => true }, preferShare: true });

    expect(await exporter.export(colors)).toBe('shared');
    expect(download).not.toHaveBeenCalled();
    expect((share.mock.calls[0]?.[0] as ShareData).files).toHaveLength(1);
  });

  it('kullanıcı paylaşımdan vazgeçerse indirmeye geçmez', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('iptal'), { name: 'AbortError' }));
    const { exporter, download } = makeExporter({ navigator: { share, canShare: () => true }, preferShare: true });

    expect(await exporter.export(colors)).toBe('cancelled');
    expect(download).not.toHaveBeenCalled();
  });

  it('paylaşım hata verirse dosyayı indirmeyi dener', async () => {
    const share = vi.fn().mockRejectedValue(new Error('NotAllowedError'));
    const { exporter, download } = makeExporter({ navigator: { share, canShare: () => true }, preferShare: true });

    expect(await exporter.export(colors)).toBe('downloaded');
    expect(download).toHaveBeenCalledTimes(1);
  });

  it('dosya paylaşımı desteklenmiyorsa indirir', async () => {
    const share = vi.fn();
    const { exporter, download } = makeExporter({ navigator: { share, canShare: () => false }, preferShare: true });

    expect(await exporter.export(colors)).toBe('downloaded');
    expect(share).not.toHaveBeenCalled();
    expect(download).toHaveBeenCalled();
  });

  it('indirme de başarısız olursa "failed" döner', async () => {
    const { exporter } = makeExporter({
      download: () => {
        throw new Error('engellendi');
      },
    });
    expect(await exporter.export(colors)).toBe('failed');
  });
});
