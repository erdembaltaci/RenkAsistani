import type { PhotoView } from '../hooks/useColorSession';
import { AlertIcon, CloseIcon } from './icons';
import styles from './PhotoStrip.module.css';

interface PhotoStripProps {
  photos: readonly PhotoView[];
  activeId: string;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
}

export function PhotoStrip({ photos, activeId, onSelect, onRemove }: PhotoStripProps) {
  return (
    <ul className={styles.strip} aria-label="Eklenen fotoğraflar">
      {photos.map((photo, index) => (
        <li key={photo.id} className={styles.item}>
          <button
            type="button"
            className={`${styles.thumb} ${photo.id === activeId ? styles.active : ''}`}
            onClick={() => onSelect(photo.id)}
            aria-pressed={photo.id === activeId}
            aria-label={`${index + 1}. fotoğraf: ${photo.colorName}${photo.isDeviating ? ', diğerlerinden farklı çıktı' : ''}`}
          >
            <img src={photo.previewUrl} alt="" draggable={false} />
          </button>
          <button
            type="button"
            className={styles.remove}
            onClick={() => onRemove(photo.id)}
            aria-label={`${index + 1}. fotoğrafı kaldır`}
          >
            <CloseIcon width={16} height={16} />
          </button>
          <p className={styles.name}>{photo.colorName}</p>
          {photo.isDeviating && (
            <p className={styles.badge}>
              <AlertIcon width={14} height={14} />
              Farklı çıktı
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
