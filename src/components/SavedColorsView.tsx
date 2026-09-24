import type { SavedColor } from '../domain/savedColor';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { CheckIcon, CopyIcon } from './icons';
import { Notice } from './Notice';
import { SavedColorCard } from './SavedColorCard';
import styles from './SavedColorsView.module.css';

interface SavedColorsViewProps {
  colors: readonly SavedColor[];
  listText: string;
  isPersistent: boolean;
  error: string | null;
  onUpdateNote: (id: string, note: string) => boolean;
  onRemove: (id: string) => void;
}

export function SavedColorsView({ colors, listText, isPersistent, error, onUpdateNote, onRemove }: SavedColorsViewProps) {
  const { status, copy } = useCopyToClipboard();

  return (
    <section className={styles.view} aria-labelledby="saved-title">
      <div className={styles.head}>
        <h2 id="saved-title" className={styles.title}>
          Kaydedilen renkler
        </h2>
        {colors.length > 0 && (
          <button type="button" className={styles.copyAll} onClick={() => copy(listText)}>
            {status === 'copied' ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
            {status === 'copied' ? 'Kopyalandı' : status === 'failed' ? 'Kopyalanamadı' : 'Listeyi kopyala'}
          </button>
        )}
      </div>

      {error && <Notice variant="error">{error}</Notice>}
      {!isPersistent && (
        <Notice variant="warning" title="Kayıtlar kalıcı değil">
          Bu tarayıcı site verisini saklamaya izin vermiyor (özel gezinti olabilir). Kayıtlar sayfa kapanınca silinir.
        </Notice>
      )}

      {colors.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Henüz kayıtlı renk yok</p>
          <p>Bir rengi bulunca “Rengi kaydet”e dokun; adını, hex kodunu ve istersen bir not burada saklanır.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {colors.map((color) => (
            <SavedColorCard key={color.id} color={color} onUpdateNote={onUpdateNote} onRemove={onRemove} />
          ))}
        </ul>
      )}

      <p className={styles.footnote}>
        Kayıtlar yalnızca bu telefonda, bu tarayıcıda saklanır; fotoğraflar kaydedilmez. Safari, bir siteyi uzun süre
        açmazsanız site verisini silebilir. Önemli kayıtlar için “Listeyi kopyala” ile Notlar uygulamasına yedekleyin.
      </p>
    </section>
  );
}
