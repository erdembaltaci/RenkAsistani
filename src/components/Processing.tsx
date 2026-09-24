import styles from './Processing.module.css';

/** Fotoğraf işlenirken sonuç ekranının iskeleti; bekleme boş ekran yerine yapıyı önceden gösterir. */
export function Processing() {
  return (
    <section className={styles.processing} aria-busy="true" aria-label="Fotoğraf işleniyor">
      <div className={`${styles.shimmer} ${styles.photo}`} />
      <div className={styles.card}>
        <div className={`${styles.shimmer} ${styles.block}`} />
        <div className={`${styles.shimmer} ${styles.line} ${styles.title}`} />
        <div className={`${styles.shimmer} ${styles.line} ${styles.sub}`} />
        <div className={`${styles.shimmer} ${styles.pill}`} />
      </div>
      <p className={styles.label} role="status">
        Renk okunuyor…
      </p>
    </section>
  );
}
