import type { SavedColor } from '../domain/savedColor';

/** shared: paylaşım penceresiyle gönderildi; downloaded: dosya indirildi; cancelled: kullanıcı vazgeçti. */
export type ExportOutcome = 'shared' | 'downloaded' | 'cancelled' | 'failed';

export interface NotesExporter {
  /** Notları Excel'in açabileceği bir CSV dosyası olarak dışa aktarır. */
  export(colors: readonly SavedColor[]): Promise<ExportOutcome>;
}
