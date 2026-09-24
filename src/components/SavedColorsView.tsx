import { useMemo, useState } from 'react';
import { filterSavedColors, type SavedColor, type SavedColorChanges } from '../domain/savedColor';
import { useCompareSelection, type ComparedColor } from '../hooks/useCompareSelection';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useNotesExport } from '../hooks/useNotesExport';
import { CheckIcon, CompareIcon, CopyIcon, DownloadIcon } from './icons';
import { CompareView } from './CompareView';
import { Notice } from './Notice';
import { SavedColorCard } from './SavedColorCard';
import styles from './SavedColorsView.module.css';

interface SavedColorsViewProps {
  colors: readonly SavedColor[];
  listText: string;
  isPersistent: boolean;
  error: string | null;
  onUpdate: (id: string, changes: SavedColorChanges) => boolean;
  onRemove: (id: string) => void;
  /** Verilirse karşılaştırma modu bu renkle başlar (ör. şu anki fotoğraftaki renk). */
  compareBase: ComparedColor | null;
  /** Karşılaştırma bitince çağrılır; üst bileşen "şu anki renk"i unutur. */
  onExitCompare: () => void;
}

/** Arama kutusu, birkaç not birikince işe yarar; öncesinde ekranı kalabalıklaştırmaz. */
const SEARCH_MIN_ITEMS = 3;

export function SavedColorsView({ colors, listText, isPersistent, error, onUpdate, onRemove, compareBase, onExitCompare }: SavedColorsViewProps) {
  const { status, copy } = useCopyToClipboard();
  const { exportNotes, message: exportMessage } = useNotesExport();
  const compare = useCompareSelection(colors, compareBase);
  const [query, setQuery] = useState('');
  const visible = useMemo(() => filterSavedColors(colors, query), [colors, query]);
  const isSearching = query.trim() !== '';
  const canCompare = compareBase ? colors.length >= 1 : colors.length >= 2;

  return (
    <section className={styles.view} aria-labelledby="saved-title">
      <h2 id="saved-title" className={styles.title}>
        Notlarım
      </h2>

      {colors.length > 0 && (
        <div className={styles.actions}>
          <button type="button" className={styles.action} onClick={() => copy(listText)}>
            {status === 'copied' ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
            {status === 'copied' ? 'Kopyalandı' : status === 'failed' ? 'Kopyalanamadı' : 'Listeyi kopyala'}
          </button>
          <button type="button" className={styles.action} onClick={() => exportNotes(colors)}>
            <DownloadIcon width={18} height={18} />
            Excel’e aktar
          </button>
          {canCompare && !compare.isActive && (
            <button type="button" className={styles.action} onClick={compare.start}>
              <CompareIcon width={18} height={18} />
              Karşılaştır
            </button>
          )}
        </div>
      )}
      {exportMessage && (
        <p className={styles.message} role="status">
          {exportMessage}
        </p>
      )}

      {compare.isActive && (
        <div className={styles.compareBar} role="status">
          <p>
            {compareBase
              ? 'Şu anki rengi karşılaştırmak için bir not seç.'
              : compare.selectedIds.length < 2
                ? `Karşılaştırmak için ${2 - compare.selectedIds.length} not seç.`
                : 'Karşılaştırma hazır.'}
          </p>
          <button
            type="button"
            className={styles.finish}
            onClick={() => {
              compare.stop();
              onExitCompare();
            }}
          >
            Bitir
          </button>
        </div>
      )}
      {compare.isActive && compare.first && compare.second && compare.difference && (
        <CompareView first={compare.first} second={compare.second} difference={compare.difference} />
      )}

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
          <p>Bir rengi bulunca “Notlarıma ekle”ye dokun; adı, hex kodu, kod/etiketi ve yazdığın not burada saklanır.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Eşleşen not yok</p>
          <p>Başka bir sözcükle, koduyla veya hex koduyla aramayı dene.</p>
        </div>
      ) : (
        <ul className={styles.list}>
          {visible.map((color) => (
            <SavedColorCard
              key={color.id}
              color={color}
              onUpdate={onUpdate}
              onRemove={onRemove}
              {...(compare.isActive
                ? { selection: { isSelected: compare.selectedIds.includes(color.id), onToggle: () => compare.toggle(color.id) } }
                : {})}
            />
          ))}
        </ul>
      )}

      <p className={styles.footnote}>
        Notlar yalnızca bu telefonda, bu tarayıcıda saklanır; fotoğraflar kaydedilmez. Safari, bir siteyi uzun süre
        açmazsanız site verisini silebilir; siteyi ana ekrana ekleyin ve önemli notları “Excel’e aktar” veya “Listeyi
        kopyala” ile yedekleyin.
      </p>
    </section>
  );
}
