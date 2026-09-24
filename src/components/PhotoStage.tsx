import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type MouseEvent, type PointerEvent } from 'react';
import { toNormalizedPoint } from '../domain/geometry';
import type { Point } from '../domain/types';
import type { PhotoView } from '../hooks/useColorSession';
import { MoveIcon, ResetIcon, SunIcon } from './icons';
import styles from './PhotoStage.module.css';

interface PhotoStageProps {
  photo: PhotoView;
  onPick: (point: Point) => void;
  onAuto: () => void;
  /** Fotoğraftaki beyaz kâğıdın noktası; ışık bu referansa göre düzeltilir. */
  onPickReference: (point: Point) => void;
  onClearReference: () => void;
}

/** Otomatik modda daire, görselin ortasında durur (renk zaten merkeze ağırlık verilerek okunur). */
const AUTO_POINT: Point = { x: 0.5, y: 0.5 };
const KEY_STEP = 0.02;
const KEY_STEP_LARGE = 0.1;
/** Daire görselin bu oranından yukarıdaysa renk baloncuğu altta gösterilir (görselin dışına taşmasın). */
const BUBBLE_FLIP_Y = 0.3;

const ARROWS: Record<string, Point> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};

const clamp01 = (value: number): number => Math.min(1, Math.max(0, value));

export function PhotoStage({ photo, onPick, onAuto, onPickReference, onClearReference }: PhotoStageProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isPickingReference, setIsPickingReference] = useState(false);
  const [dragPoint, setDragPoint] = useState<Point | null>(null);
  const grabOffset = useRef({ x: 0, y: 0 });
  const pending = useRef<Point | null>(null);
  const frame = useRef<number | undefined>(undefined);

  const pointFrom = (clientX: number, clientY: number): Point | null => {
    const image = imageRef.current;
    return image ? toNormalizedPoint(clientX, clientY, image.getBoundingClientRect()) : null;
  };

  const flush = useCallback(() => {
    if (frame.current !== undefined) window.cancelAnimationFrame(frame.current);
    frame.current = undefined;
    const point = pending.current;
    pending.current = null;
    if (point) onPick(point);
  }, [onPick]);

  // Sürüklerken renk okuma, ekran yenileme hızıyla sınırlanır; her pointermove olayında ayrı hesap yapılmaz.
  const schedule = (point: Point) => {
    pending.current = point;
    frame.current ??= window.requestAnimationFrame(flush);
  };

  useEffect(
    () => () => {
      if (frame.current !== undefined) window.cancelAnimationFrame(frame.current);
    },
    [],
  );

  const isDragging = dragPoint !== null;
  const point = dragPoint ?? photo.focus ?? AUTO_POINT;
  const showCue = !photo.focus && !isDragging && !isPickingReference;

  const handleFrameClick = (event: MouseEvent<HTMLDivElement>) => {
    const picked = pointFrom(event.clientX, event.clientY);
    if (!picked) return;
    if (isPickingReference) {
      onPickReference(picked);
      setIsPickingReference(false);
    } else {
      onPick(picked);
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    // Parmak dairenin tam ortasında olmayabilir; aradaki fark korunur, daire yerinden zıplamaz.
    const rect = event.currentTarget.getBoundingClientRect();
    grabOffset.current = {
      x: event.clientX - (rect.left + rect.width / 2),
      y: event.clientY - (rect.top + rect.height / 2),
    };
    setDragPoint(point);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (!isDragging) return;
    const moved = pointFrom(event.clientX - grabOffset.current.x, event.clientY - grabOffset.current.y);
    if (!moved) return;
    setDragPoint(moved);
    schedule(moved);
  };

  const endDrag = () => {
    if (!isDragging) return;
    flush();
    setDragPoint(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const direction = ARROWS[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? KEY_STEP_LARGE : KEY_STEP;
    onPick({ x: clamp01(point.x + direction.x * step), y: clamp01(point.y + direction.y * step) });
  };

  const hint = isPickingReference
    ? 'Beyaz kâğıda dokun'
    : photo.lightStatus === 'unreliable'
      ? 'Beyaza benzemiyor, başka nokta dene'
      : showCue
        ? 'Daireyi sürükle'
        : null;

  return (
    <section className={styles.stage} aria-label="Seçili fotoğraf">
      <div
        className={`${styles.frame} ${isPickingReference ? styles.picking : ''}`}
        onClick={handleFrameClick}
        role="group"
        aria-label="Fotoğraf"
      >
        <img ref={imageRef} className={styles.image} src={photo.previewUrl} alt="Rengi okunan fotoğraf" draggable={false} />

        <button
          type="button"
          className={`${styles.marker} ${showCue ? styles.cue : ''} ${isDragging ? styles.dragging : ''}`}
          style={{ left: `${point.x * 100}%`, top: `${point.y * 100}%` }}
          aria-label="Renk seçici daire. Sürükleyerek yerini değiştir"
          onClick={(event) => event.stopPropagation()}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={handleKeyDown}
        >
          <span className={styles.ring} />
          {showCue && (
            <span className={styles.cueBadge} aria-hidden="true">
              <MoveIcon width={14} height={14} strokeWidth={2.2} />
            </span>
          )}
          {isDragging && (
            <span
              className={`${styles.bubble} ${point.y < BUBBLE_FLIP_Y ? styles.bubbleBelow : ''}`}
              style={{ background: photo.hex }}
              aria-hidden="true"
            />
          )}
        </button>

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
      </div>

      <div className={styles.tools}>
        {photo.reference ? (
          <button type="button" className={styles.tool} onClick={onClearReference}>
            <SunIcon width={18} height={18} />
            {photo.lightStatus === 'applied' ? 'Işık düzeltildi · kaldır' : 'Kaldır'}
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
            Ortaya al
          </button>
        )}
        {hint && (
          <p className={styles.hint} role="status">
            {hint}
          </p>
        )}
      </div>
    </section>
  );
}
