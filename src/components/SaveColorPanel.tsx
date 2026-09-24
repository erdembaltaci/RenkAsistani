import { useState, type FormEvent } from 'react';
import { CheckIcon, BookmarkIcon } from './icons';
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
          Kaydedildi
        </p>
        <button type="button" className={styles.link} onClick={onOpenSaved}>
          Kaydedilenlere git
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
        <input
          id="save-note"
          className={styles.input}
          type="text"
          value={note}
          maxLength={maxNoteLength}
          placeholder="ör. mavi tişört, mağaza adı, kumaş kodu"
          enterKeyHint="done"
          autoComplete="off"
          autoFocus
          onChange={(event) => setNote(event.target.value)}
        />
        <div className={styles.actions}>
          <button type="submit" className={styles.primary}>
            Kaydet
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
      Rengi kaydet
    </button>
  );
}
