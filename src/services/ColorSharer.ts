import type { ColorCard } from './ColorCardRenderer';

/**
 * shared: paylaşım penceresi açıldı ve tamamlandı; cancelled: kullanıcı vazgeçti;
 * whatsapp: paylaşım penceresi yok, WhatsApp bağlantısı açıldı; copied: paylaşılamadı, metin panoya alındı.
 */
export type ShareOutcome = 'shared' | 'cancelled' | 'whatsapp' | 'copied' | 'failed';

export interface ColorSharer {
  share(color: ColorCard): Promise<ShareOutcome>;
}
