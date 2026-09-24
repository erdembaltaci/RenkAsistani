import { useRef, useState, type MouseEvent } from 'react';
import { toNormalizedPoint } from '../domain/geometry';
import type { Point } from '../domain/types';
import type { LightStatus, PhotoView } from '../hooks/useColorSession';
import { ResetIcon, SunIcon } from './icons';
import styles from './PhotoStage.module.css';

interface PhotoStageProps {
  photo: PhotoView;
  onPick: (point: Point) => void;
  onAuto: () => void;
  /** Fotoğraftaki beyaz kâğıdın noktası; ışık bu referansa göre düzeltilir. */
  onPickReference: (point: Point) => void;
  onClearReference: () => void;
}

const LIGHT_HINT: Record<LightStatus, string | null> = {
  none: null,
  applied: 'Işık, beyaz kâğıda göre düzeltildi.',
  unreliable: 'Seçtiğin nokta beyaza benzemiyor; ışık düzeltilmedi. Kaldırıp başka bir nokta dene.',
};

export function PhotoStage({ photo, onPick, onAuto, onPickReference, onClearReference }: PhotoStageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isPickingReference, setIsPickingReference] = useState(false);

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    const image = imageRef.current;
    if (!image) return;
    // detail === 0: klavye ile tetiklenen tıklama, konum bilgisi yoktur.
    const point =
      event.detail === 0
        ? { x: 0.5, y: 0.5 }
        : toNormalizedPoint(event.clientX, event.clientY, image.getBoundingClientRect());

    if (isPickingReference) {
      onPickReference(point);
      setIsPickingReference(false);
    } else {
      onPick(point);
    }
  };

  const hint = isPickingReference
    ? 'Fotoğraftaki beyaz kâğıda dokun.'
    : (LIGHT_HINT[photo.lightStatus] ??
      (photo.focus ? 'Renk, işaretlediğin noktadan alındı.' : 'Başka bir yerin rengi için fotoğrafa dokun.'));

  return (
    <section className={styles.stage} aria-label="Seçili fotoğraf">
      <button
        type="button"
        className={`${styles.frame} ${isPickingReference ? styles.picking : ''}`}
        onClick={handleClick}
        aria-label={isPickingReference ? 'Beyaz kâğıdın olduğu noktaya dokun' : 'Rengi almak istediğin noktaya dokun'}
      >
        <img ref={imageRef} className={styles.image} src={photo.previewUrl} alt="Rengi okunan fotoğraf" draggable={false} />
        {photo.focus && (
          <span
            className={styles.marker}
            style={{ left: `${photo.focus.x * 100}%`, top: `${photo.focus.y * 100}%` }}
            aria-hidden="true"
          />
        )}
        {photo.reference && (
          <span
            className={styles.referenceMarker}
            style={{ left: `${photo.reference.x * 100}%`, top: `${photo.reference.y * 100}%` }}
            aria-hidden="true"
          >
            Beyaz
          </span>
        )}
        <span className={styles.chip}>
          <i className={styles.chipSwatch} style={{ background: photo.hex }} aria-hidden="true" />
          <span>{photo.colorName}</span>
        </span>
      </button>

      <div className={styles.tools}>
        {photo.reference ? (
          <button type="button" className={styles.tool} onClick={onClearReference}>
            <SunIcon width={18} height={18} />
            {photo.lightStatus === 'applied' ? 'Işık düzeltildi · kaldır' : 'Referansı kaldır'}
          </button>
        ) : isPickingReference ? (
          <button type="button" className={`${styles.tool} ${styles.toolActive}`} onClick={() => setIsPickingReference(false)}>
            Vazgeç
          </button>
        ) : (
          <button type="button" className={styles.tool} onClick={() => setIsPickingReference(true)}>
            <SunIcon width={18} height={18} />
            Işığı düzelt
          </button>
        )}
        {photo.focus && (
          <button type="button" className={styles.tool} onClick={onAuto}>
            <ResetIcon width={16} height={16} />
            Otomatik
          </button>
        )}
      </div>
      <p className={styles.hint} role="status">
        {hint}
      </p>
    </section>
  );
}
