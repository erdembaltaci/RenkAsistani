import type { ReactNode } from 'react';
import styles from './Welcome.module.css';

interface WelcomeProps {
  /** Fotoğraf seçici (ana ekran görünümü). */
  children: ReactNode;
}

export function Welcome({ children }: WelcomeProps) {
  return (
    <section className={styles.welcome} aria-label="Başla">
      <h2 className={styles.question}>Bugün hangi rengi öğrenelim?</h2>
      {children}
      <p className={styles.tip}>Gün ışığında, ürünü kadrajın ortasına alarak çek.</p>
    </section>
  );
}
