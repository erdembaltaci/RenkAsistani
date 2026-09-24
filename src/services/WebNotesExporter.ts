import { formatSavedColorsAsCsv, type SavedColor } from '../domain/savedColor';
import type { ExportOutcome, NotesExporter } from './NotesExporter';
import { isAbortError, type ShareCapableNavigator } from './ShareCapableNavigator';

interface WebNotesExporterDeps {
  navigator: ShareCapableNavigator;
  /** Dosyayı doğrudan indirir (masaüstü tarayıcılar için). */
  download: (file: File) => void;
  /** Dokunmatik cihazlarda paylaşım penceresi (Dosyalar, Mail, WhatsApp…) tercih edilir. */
  preferShare: boolean;
  now?: () => Date;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export class WebNotesExporter implements NotesExporter {
  constructor(private readonly deps: WebNotesExporterDeps) {}

  async export(colors: readonly SavedColor[]): Promise<ExportOutcome> {
    const { navigator, download, preferShare, now = () => new Date() } = this.deps;
    const date = now();
    const stamp = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const file = new File([formatSavedColorsAsCsv(colors)], `renk-notlarim-${stamp}.csv`, { type: 'text/csv;charset=utf-8' });

    if (preferShare && typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Renk notlarım' });
        return 'shared';
      } catch (error) {
        if (isAbortError(error)) return 'cancelled';
        // Paylaşım açılamadıysa dosya indirmeyi dener.
      }
    }

    try {
      download(file);
      return 'downloaded';
    } catch {
      return 'failed';
    }
  }
}
