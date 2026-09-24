import { useRef, type MouseEvent } from 'react';
import { toNormalizedPoint } from '../domain/geometry';
import type { Point } from '../domain/types';
import type { PhotoView } from '../hooks/useColorSession';
import { ResetIcon } from './icons';
import styles from './PhotoStage.module.css';

interface PhotoStageProps {
  photo: PhotoView;
  onPick: (point: Point) => void;
  onAuto: () => void;
}

export function PhotoStage({ photo, onPick, onAuto }: PhotoStageProps) {
  const imageRef = useRef<HTMLImageElement>(null);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const image = imageRef.current;
    if (!image) return;
    // detail === 0: klavye ile tetiklenen tıklama, konum bilgisi yoktur.
    const point =
      event.detail === 0
        ? { x: 0.5, y: 0.5 }
        : toNormalizedPoint(event.clientX, event.clientY, image.getBoundingClientRect());
    onPick(point);
  };

  return (
    <section className={styles.stage} aria-label="Seçili fotoğraf">
      <button type="button" className={styles.frame} onClick={handleClick} aria-label="Rengi almak istediğin noktaya dokun">
        <img ref={imageRef} className={styles.image} src={photo.previewUrl} alt="Rengi okunan fotoğraf" draggable={false} />
        {photo.focus && (
          <span
            className={styles.marker}
            style={{ left: `${photo.focus.x * 100}%`, top: `${photo.focus.y * 100}%` }}
            aria-hidden="true"
          />
        )}
        <span className={styles.chip}>
          <i className={styles.chipSwatch} style={{ background: photo.hex }} aria-hidden="true" />
          <span>{photo.colorName}</span>
        </span>
      </button>

      <div className={styles.caption}>
        <p>{photo.focus ? 'Renk, işaretlediğin noktadan alındı.' : 'Başka bir yerin rengi için fotoğrafa dokun.'}</p>
        {photo.focus && (
          <button type="button" className={styles.autoButton} onClick={onAuto}>
            <ResetIcon width={16} height={16} />
            Otomatik
          </button>
        )}
      </div>
    </section>
  );
}
