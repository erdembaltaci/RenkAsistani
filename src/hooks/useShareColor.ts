import { useCallback, useEffect, useRef, useState } from 'react';
import type { ColorCard } from '../services/ColorCardRenderer';
import type { ShareOutcome } from '../services/ColorSharer';
import { useServices } from './servicesContext';

const MESSAGE_MS = 3200;

const MESSAGES: Partial<Record<ShareOutcome, string>> = {
  copiedImage: 'Görsel kopyalandı. Yapıştırabilirsin.',
  downloaded: 'Görsel indirildi.',
  copiedText: 'Metin kopyalandı.',
  failed: 'Paylaşılamadı.',
};

export function useShareColor() {
  const { sharer } = useServices();
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // `sharer.share` dokunuş olayının içinde, senkron çağrılmalıdır (bkz. WebColorSharer).
  const share = useCallback(
    (color: ColorCard) => {
      void sharer.share(color).then((outcome) => {
        const text = MESSAGES[outcome] ?? null;
        setMessage(text);
        window.clearTimeout(timer.current);
        if (text) timer.current = window.setTimeout(() => setMessage(null), MESSAGE_MS);
      });
    },
    [sharer],
  );

  return { share, message };
}
