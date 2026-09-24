import { ArrowLeftIcon, BookmarkIcon, HeartIcon } from './icons';
import styles from './TopBar.module.css';

export type TopBarMode = 'welcome' | 'result' | 'notes';

interface TopBarProps {
  mode: TopBarMode;
  greeting: string;
  savedCount: number;
  onOpenNotes: () => void;
  onBack: () => void;
}

const BACK_LABEL: Record<Exclude<TopBarMode, 'welcome'>, string> = {
  result: 'Yeni ürün',
  notes: 'Geri',
};

export function TopBar({ mode, greeting, savedCount, onOpenNotes, onBack }: TopBarProps) {
  return (
    <header className={styles.bar}>
      <div className={styles.row}>
        {mode === 'welcome' ? (
          <div className={styles.welcome}>
            <h1 className={styles.greeting}>
              {greeting}
              <HeartIcon className={styles.heart} width={20} height={20} />
            </h1>
            <p className={styles.tagline}>Renk Asistanı</p>
          </div>
        ) : (
          <>
            <h1 className="visually-hidden">Renk Asistanı</h1>
            <button type="button" className={styles.back} onClick={onBack}>
              <ArrowLeftIcon width={20} height={20} />
              {BACK_LABEL[mode]}
            </button>
          </>
        )}

        {mode !== 'notes' && (
          <button type="button" className={styles.notes} onClick={onOpenNotes}>
            <BookmarkIcon width={20} height={20} />
            Notlarım
            {savedCount > 0 && (
              <span className={styles.count} aria-label={`${savedCount} not`}>
                {savedCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
