import type { ReactNode } from 'react';
import styles from './Welcome.module.css';

interface WelcomeProps {
  /** Fotoğraf seçici (ana ekran görünümü). */
  children: ReactNode;
  /** Ana ekranın altında görünen ek içerik (ör. son notlar). */
  footer?: ReactNode;
}

export function Welcome({ children, footer }: WelcomeProps) {
  return (
    <section className={styles.welcome} aria-label="Başla">
      <h2 className={styles.question}>
        Bugün hangi rengi
        <br />
        öğrenelim?
      </h2>
      {children}
      <p className={styles.tip}>Gün ışığında çek.</p>
      {footer}
    </section>
  );
}
