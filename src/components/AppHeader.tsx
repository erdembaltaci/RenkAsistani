import { ArrowLeftIcon, BookmarkIcon, HeartIcon } from './icons';
import styles from './AppHeader.module.css';

interface AppHeaderProps {
  recipientName: string;
  savedCount: number;
  isSavedViewOpen: boolean;
  onToggleSaved: () => void;
}

export function AppHeader({ recipientName, savedCount, isSavedViewOpen, onToggleSaved }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.topRow}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
          <span className={styles.brandName}>Renk Asistanı</span>
        </div>

        <button type="button" className={styles.savedButton} onClick={onToggleSaved}>
          {isSavedViewOpen ? (
            <>
              <ArrowLeftIcon width={20} height={20} />
              Ana ekran
            </>
          ) : (
            <>
              <BookmarkIcon width={20} height={20} />
              Kaydedilenler
              {savedCount > 0 && (
                <span className={styles.count} aria-label={`${savedCount} kayıt`}>
                  {savedCount}
                </span>
              )}
            </>
          )}
        </button>
      </div>

      <h1 className={styles.greeting}>
        Hoş geldin {recipientName}
        <HeartIcon className={styles.heart} width={24} height={24} />
      </h1>
      <p className={styles.tagline}>Bugün hangi renkleri keşfediyoruz?</p>
    </header>
  );
}
