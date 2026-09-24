import { useCallback, useEffect, useMemo, useState } from 'react';
import { detectInstallEnvironment } from '../domain/installEnvironment';
import { useServices } from './servicesContext';

const DISMISSED_KEY = 'renk-asistani.kurulum-ipucu-kapatildi';

/** Chrome/Edge/Android'in kurulum istemi olayı; TypeScript'in DOM tanımlarında yoktur. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/** prompt: tarayıcı kurulum istemini sunabilir; ios: Paylaş menüsünden elle eklenmeli; null: gösterilecek bir şey yok. */
export type InstallHint = 'prompt' | 'ios' | null;

const isStandalone = (): boolean =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

export function useInstallPrompt() {
  const { preferences } = useServices();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return preferences.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  const environment = useMemo(
    () =>
      detectInstallEnvironment({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints,
        isStandalone: isStandalone(),
      }),
    [],
  );

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => setDeferred(null);

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const hint: InstallHint =
    dismissed || environment === 'installed' ? null : deferred ? 'prompt' : environment === 'ios' ? 'ios' : null;

  const install = useCallback(async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
  }, [deferred]);

  const dismiss = useCallback(() => {
    setDismissed(true);
    try {
      preferences.setItem(DISMISSED_KEY, '1');
    } catch {
      // Depolama kapalıysa ipucu bu oturumda gizli kalır, sonraki açılışta yeniden görünür.
    }
  }, [preferences]);

  return { hint, install, dismiss };
}
