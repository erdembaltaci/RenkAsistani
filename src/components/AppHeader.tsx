import styles from './AppHeader.module.css';

export function AppHeader() {
  return (
    <header className={styles.header}>
      <span className={styles.mark} aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      <div>
        <h1 className={styles.title}>Renk Asistanı</h1>
        <p className={styles.tagline}>Ürün ve kumaşın rengini adıyla öğren</p>
      </div>
    </header>
  );
}
