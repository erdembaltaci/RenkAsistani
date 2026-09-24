import type { SavedColor } from '../domain/savedColor';
import styles from './RecentNotes.module.css';

interface RecentNotesProps {
  colors: readonly SavedColor[];
  onOpen: () => void;
}

/** Ana ekranda son notlara tek dokunuşla ulaşmak için; not yoksa hiç görünmez. */
export function RecentNotes({ colors, onOpen }: RecentNotesProps) {
  if (colors.length === 0) return null;

  return (
    <section className={styles.recent} aria-label="Son notlar">
      <p className={styles.title}>Son notların</p>
      <ul className={styles.list}>
        {colors.map((color) => (
          <li key={color.id}>
            <button type="button" className={styles.chip} onClick={onOpen}>
              <span className={styles.dot} style={{ background: color.hex }} aria-hidden="true" />
              <span className={styles.text}>
                <span className={styles.name}>{color.name}</span>
                {color.note && <span className={styles.note}>{color.note}</span>}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
