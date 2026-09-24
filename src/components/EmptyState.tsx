import styles from './EmptyState.module.css';

const TIPS = [
  'Gün ışığında ve gölgesiz çek.',
  'Ürünü veya kumaşı kadrajın ortasına al.',
  'Aynı ürün için birkaç fotoğraf ekleyebilirsin; sonuç daha güvenilir olur.',
];

export function EmptyState() {
  return (
    <section className={styles.empty}>
      <div className={styles.swatches} aria-hidden="true">
        <span style={{ background: '#e9d3d8' }} />
        <span style={{ background: '#cfe0d2' }} />
        <span style={{ background: '#d4dbe3' }} />
        <span style={{ background: '#e6dfcf' }} />
      </div>
      <h2 className={styles.heading}>Bir fotoğrafla başla</h2>
      <p className={styles.lead}>Aşağıdan fotoğraf çek ya da galeriden seç. Rengin adını ve hex kodunu yazıyla söyleyeceğim.</p>
      <ul className={styles.tips}>
        {TIPS.map((tip) => (
          <li key={tip}>{tip}</li>
        ))}
      </ul>
    </section>
  );
}
