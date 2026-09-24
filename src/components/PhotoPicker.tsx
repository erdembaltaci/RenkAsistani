import type { ChangeEvent } from 'react';
import { CameraIcon, GalleryIcon } from './icons';
import styles from './PhotoPicker.module.css';

interface PhotoPickerProps {
  onFiles: (files: File[]) => void;
  isLoading: boolean;
  canAddMore: boolean;
  maxPhotos: number;
}

export function PhotoPicker({ onFiles, isLoading, canAddMore, maxPhotos }: PhotoPickerProps) {
  const disabled = isLoading || !canAddMore;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Aynı dosya art arda seçilse de change olayı tetiklensin diye sıfırlanır.
    event.target.value = '';
    if (files.length > 0) onFiles(files);
  };

  return (
    <div className={styles.bar}>
      <div className={styles.inner}>
        {isLoading && (
          <p className={styles.status} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            Fotoğraf işleniyor…
          </p>
        )}
        {!canAddMore && !isLoading && <p className={styles.status}>En fazla {maxPhotos} fotoğraf eklenebilir.</p>}
        <div className={styles.buttons}>
          <label className={`${styles.button} ${styles.primary}`} aria-disabled={disabled}>
            <CameraIcon />
            <span>Fotoğraf çek</span>
            <input
              className="visually-hidden"
              type="file"
              accept="image/*"
              capture="environment"
              disabled={disabled}
              onChange={handleChange}
            />
          </label>
          <label className={styles.button} aria-disabled={disabled}>
            <GalleryIcon />
            <span>Galeriden seç</span>
            <input
              className="visually-hidden"
              type="file"
              accept="image/*"
              multiple
              disabled={disabled}
              onChange={handleChange}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
