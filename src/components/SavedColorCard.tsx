import { useState, type FormEvent } from 'react';
import { MAX_NOTE_LENGTH, type SavedColor } from '../domain/savedColor';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { CheckIcon, CopyIcon, PencilIcon, TrashIcon } from './icons';
import styles from './SavedColorCard.module.css';

interface SavedColorCardProps {
  color: SavedColor;
  /** Başarılıysa true döner. */
  onUpdateNote: (id: string, note: string) => boolean;
  onRemove: (id: string) => void;
}

type CardMode = 'view' | 'editing' | 'confirmDelete';

const formatDate = (timestamp: number): string =>
  new Date(timestamp).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });

export function SavedColorCard({ color, onUpdateNote, onRemove }: SavedColorCardProps) {
  const [mode, setMode] = useState<CardMode>('view');
  const [draft, setDraft] = useState(color.note);
  const { status, copy } = useCopyToClipboard();

  const startEditing = () => {
    setDraft(color.note);
    setMode('editing');
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (onUpdateNote(color.id, draft)) setMode('view');
  };

  return (
    <li className={styles.card}>
      <div className={styles.summary}>
        <div className={styles.swatch} style={{ background: color.hex }} role="img" aria-label={`Renk örneği ${color.hex}`} />
        <div className={styles.text}>
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
          <label className="visually-hidden" htmlFor={`note-${color.id}`}>
            Not
          </label>
          <input
            id={`note-${color.id}`}
            className={styles.input}
            type="text"
            value={draft}
            maxLength={MAX_NOTE_LENGTH}
            placeholder="Not ekle"
            enterKeyHint="done"
            autoComplete="off"
            autoFocus
            onChange={(event) => setDraft(event.target.value)}
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
        <p className={color.note ? styles.note : styles.noNote}>{color.note ? `Not: ${color.note}` : 'Not eklenmemiş'}</p>
      )}

      <div className={styles.footer}>
        <span className={styles.date}>{formatDate(color.savedAt)}</span>
        {mode === 'confirmDelete' ? (
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
              <button type="button" className={styles.iconButton} onClick={startEditing} aria-label={`${color.name} notunu düzenle`}>
                <PencilIcon width={20} height={20} />
              </button>
              <button type="button" className={styles.iconButton} onClick={() => setMode('confirmDelete')} aria-label={`${color.name} kaydını sil`}>
                <TrashIcon width={20} height={20} />
              </button>
            </span>
          )
        )}
      </div>
    </li>
  );
}
