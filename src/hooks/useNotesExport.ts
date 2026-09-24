import { useCallback, useEffect, useRef, useState } from 'react';
import type { SavedColor } from '../domain/savedColor';
import type { ExportOutcome } from '../services/NotesExporter';
import { useServices } from './servicesContext';

const MESSAGE_MS = 2600;

const MESSAGES: Partial<Record<ExportOutcome, string>> = {
  downloaded: 'CSV dosyası indirildi; Excel ile açabilirsin.',
  failed: 'Dışa aktarılamadı.',
};

export function useNotesExport() {
  const { exporter } = useServices();
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // `exporter.export` dokunuş olayının içinde, senkron çağrılmalıdır (paylaşım penceresi kısıtı).
  const exportNotes = useCallback(
    (colors: readonly SavedColor[]) => {
      void exporter.export(colors).then((outcome) => {
        const text = MESSAGES[outcome] ?? null;
        setMessage(text);
        window.clearTimeout(timer.current);
        if (text) timer.current = window.setTimeout(() => setMessage(null), MESSAGE_MS);
      });
    },
    [exporter],
  );

  return { exportNotes, message };
}
