import type { InstallHint } from '../hooks/useInstallPrompt';
import { ShareIcon } from './icons';
import styles from './InstallBanner.module.css';

interface InstallBannerProps {
  hint: Exclude<InstallHint, null>;
  onInstall: () => void;
  onDismiss: () => void;
}

/** Ana ekrana eklemeyi önerir; iOS'ta otomatik istem olmadığı için adımları anlatır. */
export function InstallBanner({ hint, onInstall, onDismiss }: InstallBannerProps) {
  return (
    <section className={styles.banner} aria-label="Ana ekrana ekle">
      <div className={styles.text}>
        <h2 className={styles.title}>Ana ekrana ekle</h2>
        {hint === 'ios' ? (
          <p className={styles.body}>
            Tarayıcının <strong>Paylaş</strong> düğmesine <ShareIcon className={styles.icon} width={16} height={16} /> dokun,
            sonra <strong>Ana Ekrana Ekle</strong>’yi seç. Uygulama gibi açılır, notların da silinmez.
          </p>
        ) : (
          <p className={styles.body}>Uygulama gibi açılır, internet zayıfken de çalışır ve notların güvende kalır.</p>
        )}
      </div>
      <div className={styles.actions}>
        {hint === 'prompt' && (
          <button type="button" className={styles.primary} onClick={onInstall}>
            Yükle
          </button>
        )}
        <button type="button" className={styles.secondary} onClick={onDismiss}>
          {hint === 'ios' ? 'Anladım' : 'Şimdi değil'}
        </button>
      </div>
    </section>
  );
}
