import { useMemo, useState } from 'react';
import { filterSavedColors, type SavedColor } from '../domain/savedColor';
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

/** Arama kutusu, birkaç not birikince işe yarar; öncesinde ekranı kalabalıklaştırmaz. */
const SEARCH_MIN_ITEMS = 3;

export function SavedColorsView({ colors, listText, isPersistent, error, onUpdateNote, onRemove }: SavedColorsViewProps) {
  const { status, copy } = useCopyToClipboard();
  const [query, setQuery] = useState('');
  const visible = useMemo(() => filterSavedColors(colors, query), [colors, query]);
  const isSearching = query.trim() !== '';

  return (
    <section className={styles.view} aria-labelledby="saved-title">
      <div className={styles.head}>
        <h2 id="saved-title" className={styles.title}>
          Notlarım
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
        <Notice variant="warning" title="Notlar kalıcı değil">
          Bu tarayıcı site verisini saklamaya izin vermiyor (özel gezinti olabilir). Notlar sayfa kapanınca silinir.
        </Notice>
      )}

      {colors.length >= SEARCH_MIN_ITEMS && (
        <div className={styles.search}>
          <label className="visually-hidden" htmlFor="notes-search">
            Notlarda ara
          </label>
          <input
            id="notes-search"
            className={styles.searchInput}
            type="search"
            value={query}
            placeholder="Notlarda ara (ör. A15, bordo)"
            enterKeyHint="search"
            autoComplete="off"
            onChange={(event) => setQuery(event.target.value)}
          />
          {isSearching && (
            <p className={styles.count} role="status">
              {visible.length} sonuç
            </p>
          )}
        </div>
      )}

      {colors.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Henüz not yok</p>
          <p>Bir rengi bulunca “Notlarıma ekle”ye dokun; adı, hex kodu ve yazdığın not (ör. “A15 nolu üretim ipi”) burada saklanır.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Eşleşen not yok</p>
          <p>Başka bir sözcükle veya hex koduyla aramayı dene.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {visible.map((color) => (
            <SavedColorCard key={color.id} color={color} onUpdateNote={onUpdateNote} onRemove={onRemove} />
          ))}
        </ul>
      )}

      <p className={styles.footnote}>
        Notlar yalnızca bu telefonda, bu tarayıcıda saklanır; fotoğraflar kaydedilmez. Safari, bir siteyi uzun süre
        açmazsanız site verisini silebilir; siteyi ana ekrana ekleyin ve önemli notları “Listeyi kopyala” ile yedekleyin.
      </p>
    </section>
  );
}
