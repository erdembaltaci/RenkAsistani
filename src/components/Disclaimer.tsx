import { InfoIcon } from './icons';
import styles from './Disclaimer.module.css';

/** Tek satırlık, sürekli görünen dipnot. */
export function Disclaimer() {
  return (
    <p className={styles.note}>
      <InfoIcon className={styles.icon} width={16} height={16} />
      <span>Tahmini sonuç: ışık ve kamera rengi kaydırabilir.</span>
    </p>
  );
}
