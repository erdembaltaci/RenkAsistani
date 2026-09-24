import { useCallback, useEffect, useRef, useState } from 'react';
import { copyTextToClipboard } from '../services/clipboard';

export type CopyStatus = 'idle' | 'copied' | 'failed';

const RESET_AFTER_MS = 2000;

export function useCopyToClipboard() {
  const [status, setStatus] = useState<CopyStatus>('idle');
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string) => {
    const succeeded = await copyTextToClipboard(text);
    setStatus(succeeded ? 'copied' : 'failed');
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus('idle'), RESET_AFTER_MS);
  }, []);

  return { status, copy };
}
