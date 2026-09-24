import { InfoIcon } from './icons';
import styles from './Disclaimer.module.css';

/** Kısa, sürekli görünen dipnot; uzun uyarı kutusu yerine ekranı sade tutar. */
export function Disclaimer() {
  return (
    <p className={styles.note}>
      <InfoIcon className={styles.icon} width={16} height={16} />
      <span>
        Sonuç bir tahmindir: kamera, ışığa ve beyaz dengesine göre rengi kaydırabilir. Resmî renk onayının yerini tutmaz.
      </span>
    </p>
  );
}
