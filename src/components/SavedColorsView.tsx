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
  const remaining = (compareBase ? 1 : 2) - compare.selectedIds.length;

  return (
    <section className={styles.view} aria-labelledby="saved-title">
      <h2 id="saved-title" className={styles.title}>
        Notlarım
      </h2>

      {colors.length > 0 && (
        <div className={styles.actions}>
          {canCompare && !compare.isActive && (
            <button type="button" className={styles.action} onClick={compare.start}>
              <CompareIcon width={18} height={18} />
              Karşılaştır
            </button>
          )}
          <button type="button" className={styles.action} onClick={() => copy(listText)}>
            {status === 'copied' ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
            {status === 'copied' ? 'Kopyalandı' : status === 'failed' ? 'Olmadı' : 'Kopyala'}
          </button>
          <button type="button" className={styles.action} onClick={() => exportNotes(colors)}>
            <DownloadIcon width={18} height={18} />
            Excel
          </button>
        </div>
      )}
      {exportMessage && (
        <p className={styles.message} role="status">
          {exportMessage}
        </p>
      )}

      {compare.isActive && (
        <div className={styles.compareBar} role="status">
          <p>{remaining > 0 ? (remaining === 2 ? 'İki not seç' : 'Bir not seç') : 'Hazır'}</p>
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
          Bu tarayıcı kayıt tutmaya izin vermiyor; sayfa kapanınca silinir.
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
            placeholder="Ara (ör. A15)"
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
          <p>Bir renk bulunca “Notlarıma ekle”ye dokun.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>Eşleşen not yok</p>
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

      {colors.length > 0 && <p className={styles.footnote}>Notlar bu telefonda saklanır. Yedek için Excel’e aktar.</p>}
    </section>
  );
}
