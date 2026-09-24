import type { ChangeEvent } from 'react';
import { CameraIcon, GalleryIcon } from './icons';
import styles from './PhotoPicker.module.css';

interface PhotoPickerProps {
  /** hero: ana ekranın büyük düğmesi; bar: sonuç ekranında alta sabitlenen çubuk. */
  variant: 'hero' | 'bar';
  onFiles: (files: File[]) => void;
  isLoading: boolean;
  canAddMore: boolean;
  maxPhotos: number;
}

export function PhotoPicker({ variant, onFiles, isLoading, canAddMore, maxPhotos }: PhotoPickerProps) {
  const disabled = isLoading || !canAddMore;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    // Aynı dosya art arda seçilse de change olayı tetiklensin diye sıfırlanır.
    event.target.value = '';
    if (files.length > 0) onFiles(files);
  };

  const cameraInput = (
    <input
      className="visually-hidden"
      type="file"
      accept="image/*"
      capture="environment"
      disabled={disabled}
      onChange={handleChange}
    />
  );
  const galleryInput = (
    <input className="visually-hidden" type="file" accept="image/*" multiple disabled={disabled} onChange={handleChange} />
  );

  const status = (
    <>
      {isLoading && (
        <p className={styles.status} role="status">
          <span className={styles.spinner} aria-hidden="true" />
          Fotoğraf işleniyor…
        </p>
      )}
      {!canAddMore && !isLoading && <p className={styles.status}>En fazla {maxPhotos} fotoğraf eklenebilir.</p>}
    </>
  );

  if (variant === 'hero') {
    return (
      <div className={styles.hero}>
        <label className={styles.capture} aria-disabled={disabled}>
          <span className={styles.captureButton}>
            <CameraIcon width={40} height={40} strokeWidth={1.6} />
          </span>
          <span className={styles.captureLabel}>Fotoğraf çek</span>
          {cameraInput}
        </label>
        <label className={styles.galleryLink} aria-disabled={disabled}>
          <GalleryIcon width={20} height={20} />
          Galeriden seç
          {galleryInput}
        </label>
        {status}
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <div className={styles.barInner}>
        {status}
        <div className={styles.buttons}>
          <label className={styles.button} aria-disabled={disabled}>
            <CameraIcon width={20} height={20} />
            <span>Fotoğraf ekle</span>
            {cameraInput}
          </label>
          <label className={styles.button} aria-disabled={disabled}>
            <GalleryIcon width={20} height={20} />
            <span>Galeriden seç</span>
            {galleryInput}
          </label>
        </div>
      </div>
    </div>
  );
}
