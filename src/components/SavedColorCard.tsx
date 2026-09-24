import { useState, type FormEvent } from 'react';
import { MAX_CODE_LENGTH, MAX_NOTE_LENGTH, type SavedColor, type SavedColorChanges } from '../domain/savedColor';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { useShareColor } from '../hooks/useShareColor';
import { CheckIcon, CopyIcon, PencilIcon, ShareIcon, TrashIcon } from './icons';
import styles from './SavedColorCard.module.css';

interface SavedColorCardProps {
  color: SavedColor;
  /** Başarılıysa true döner. */
  onUpdate: (id: string, changes: SavedColorChanges) => boolean;
  onRemove: (id: string) => void;
  /** Karşılaştırma modunda kart seçilebilir; verilirse düzenleme/paylaşma/silme araçları gizlenir. */
  selection?: { isSelected: boolean; onToggle: () => void };
}

type CardMode = 'view' | 'editing' | 'confirmDelete';

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export function SavedColorCard({ color, onUpdate, onRemove, selection }: SavedColorCardProps) {
  const [mode, setMode] = useState<CardMode>('view');
  const [draftCode, setDraftCode] = useState(color.code);
  const [draftNote, setDraftNote] = useState(color.note);
  const { status, copy } = useCopyToClipboard();
  const { share, message } = useShareColor();

  const startEditing = () => {
    setDraftCode(color.code);
    setDraftNote(color.note);
    setMode('editing');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (onUpdate(color.id, { code: draftCode, note: draftNote })) setMode('view');
  };

  return (
    <li className={`${styles.card} ${selection?.isSelected ? styles.selected : ''}`}>
      <div className={styles.summary}>
        <div className={styles.swatch} style={{ background: color.hex }} role="img" aria-label={`Renk örneği ${color.hex}`} />
        <div className={styles.text}>
          {color.code && <p className={styles.code}>{color.code}</p>}
          <h3 className={styles.name}>{color.name}</h3>
          <p className={styles.tone}>{color.tone}</p>
          <button type="button" className={styles.hex} onClick={() => copy(color.hex)} aria-label={`${color.hex} kodunu kopyala`}>
            {status === 'copied' ? <CheckIcon width={16} height={16} /> : <CopyIcon width={16} height={16} />}
            {status === 'copied' ? 'Kopyalandı' : color.hex}
          </button>
        </div>
      </div>

      {mode === 'editing' ? (
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor={`code-${color.id}`}>
            Kod / etiket
          </label>
          <input
            id={`code-${color.id}`}
            className={styles.codeInput}
            type="text"
            value={draftCode}
            maxLength={MAX_CODE_LENGTH}
            placeholder="Kod / etiket (ör. A15)"
            autoComplete="off"
            autoCapitalize="characters"
            autoFocus
            onChange={(event) => setDraftCode(event.target.value)}
          />
          <label className="visually-hidden" htmlFor={`note-${color.id}`}>
            Not
          </label>
          <textarea
            id={`note-${color.id}`}
            className={styles.input}
            rows={3}
            value={draftNote}
            maxLength={MAX_NOTE_LENGTH}
            placeholder="Not ekle"
            autoComplete="off"
            onChange={(event) => setDraftNote(event.target.value)}
          />
          <div className={styles.row}>
            <button type="submit" className={styles.primary}>
              Kaydet
            </button>
            <button type="button" className={styles.secondary} onClick={() => setMode('view')}>
              Vazgeç
            </button>
          </div>
        </form>
      ) : (
        color.note && <p className={styles.note}>{color.note}</p>
      )}

      {message && (
        <p className={styles.message} role="status">
          {message}
        </p>
      )}

      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(color.savedAt)}</span>
        {selection ? (
          <button
            type="button"
            className={selection.isSelected ? styles.selectOn : styles.selectOff}
            aria-pressed={selection.isSelected}
            onClick={selection.onToggle}
          >
            {selection.isSelected ? (
              <>
                <CheckIcon width={18} height={18} />
                Seçildi
              </>
            ) : (
              'Seç'
            )}
          </button>
        ) : mode === 'confirmDelete' ? (
          <span className={styles.confirm}>
            Silinsin mi?
            <button type="button" className={styles.danger} onClick={() => onRemove(color.id)}>
              Sil
            </button>
            <button type="button" className={styles.secondarySmall} onClick={() => setMode('view')}>
              Vazgeç
            </button>
          </span>
        ) : (
          mode === 'view' && (
            <span className={styles.tools}>
              <button type="button" className={styles.iconButton} onClick={() => share(color)} aria-label={`${color.name} notunu paylaş`}>
                <ShareIcon width={20} height={20} />
              </button>
              <button type="button" className={styles.iconButton} onClick={startEditing} aria-label={`${color.name} notunu düzenle`}>
                <PencilIcon width={20} height={20} />
              </button>
              <button type="button" className={styles.iconButton} onClick={() => setMode('confirmDelete')} aria-label={`${color.name} notunu sil`}>
                <TrashIcon width={20} height={20} />
              </button>
            </span>
          )
        )}
      </div>
    </li>
  );
}
