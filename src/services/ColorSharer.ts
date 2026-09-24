import type { ColorCard } from './ColorCardRenderer';

/**
 * shared: paylaşım penceresiyle görsel gönderildi; cancelled: kullanıcı vazgeçti;
 * copiedImage: paylaşım penceresi görsel kabul etmedi, görsel panoya kopyalandı;
 * downloaded: pano da olmadı, görsel indirildi; copiedText: görsel çizilemedi, metin panoya kopyalandı.
 */
export type ShareOutcome = 'shared' | 'cancelled' | 'copiedImage' | 'downloaded' | 'copiedText' | 'failed';

export interface ColorSharer {
  share(color: ColorCard): Promise<ShareOutcome>;
}
