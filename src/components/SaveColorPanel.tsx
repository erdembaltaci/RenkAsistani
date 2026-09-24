import { useState, type FormEvent } from 'react';
import { BookmarkIcon, CheckIcon } from './icons';
import styles from './SaveColorPanel.module.css';

interface SaveColorPanelProps {
  maxNoteLength: number;
  maxCodeLength: number;
  /** Kaydetme başarılıysa true döner. */
  onSave: (fields: { code: string; note: string }) => boolean;
  onOpenSaved: () => void;
}

type PanelState = 'idle' | 'editing' | 'saved';

export function SaveColorPanel({ maxNoteLength, maxCodeLength, onSave, onOpenSaved }: SaveColorPanelProps) {
  const [state, setState] = useState<PanelState>('idle');
  const [code, setCode] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (onSave({ code, note })) setState('saved');
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
        <label className={styles.label} htmlFor="save-code">
          Kod / etiket (isteğe bağlı)
        </label>
        <input
          id="save-code"
          className={styles.codeInput}
          type="text"
          value={code}
          maxLength={maxCodeLength}
          placeholder="ör. A15"
          enterKeyHint="next"
          autoComplete="off"
          autoCapitalize="characters"
          autoFocus
          onChange={(event) => setCode(event.target.value)}
        />
        <label className={styles.label} htmlFor="save-note">
          Not (isteğe bağlı)
        </label>
        <textarea
          id="save-note"
          className={styles.input}
          rows={3}
          value={note}
          maxLength={maxNoteLength}
          placeholder="ör. mavi ip, siparişten önce kontrol et"
          autoComplete="off"
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
