import { useState, type FormEvent } from 'react';
import { BookmarkIcon, CheckIcon } from './icons';
import styles from './SaveColorPanel.module.css';

interface SaveColorPanelProps {
  maxNoteLength: number;
  /** Kaydetme başarılıysa true döner. */
  onSave: (note: string) => boolean;
  onOpenSaved: () => void;
}

type PanelState = 'idle' | 'editing' | 'saved';

export function SaveColorPanel({ maxNoteLength, onSave, onOpenSaved }: SaveColorPanelProps) {
  const [state, setState] = useState<PanelState>('idle');
  const [note, setNote] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (onSave(note)) setState('saved');
  };

  if (state === 'saved') {
    return (
      <div className={styles.saved} role="status">
        <p className={styles.savedText}>
          <CheckIcon width={20} height={20} />
          Notlarına eklendi
        </p>
        <button type="button" className={styles.link} onClick={onOpenSaved}>
          Notlarıma git
        </button>
      </div>
    );
  }

  if (state === 'editing') {
    return (
      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="save-note">
          Not (isteğe bağlı)
        </label>
        <textarea
          id="save-note"
          className={styles.input}
          rows={3}
          value={note}
          maxLength={maxNoteLength}
          placeholder="ör. A15 nolu üretim, mavi ip"
          autoComplete="off"
          autoFocus
          onChange={(event) => setNote(event.target.value)}
        />
        <p className={styles.counter}>
          {note.length} / {maxNoteLength}
        </p>
        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            Notlarıma ekle
          </button>
          <button type="button" className={styles.secondary} onClick={() => setState('idle')}>
            Vazgeç
          </button>
        </div>
      </form>
    );
  }

  return (
    <button type="button" className={styles.trigger} onClick={() => setState('editing')}>
      <BookmarkIcon width={20} height={20} />
      Notlarıma ekle
    </button>
  );
}
