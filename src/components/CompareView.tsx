import type { ColorDifference, Comparison, DifferenceLevel } from '../domain/colorDifference';
import type { ComparedColor } from '../hooks/useCompareSelection';
import styles from './CompareView.module.css';

interface CompareViewProps {
  first: ComparedColor;
  second: ComparedColor;
  difference: ColorDifference;
}

const LEVEL_TEXT: Record<DifferenceLevel, { title: string; detail: string }> = {
  imperceptible: { title: 'Neredeyse aynı', detail: 'Gözle ayırt edilemeyecek kadar yakın (ΔE 1’in altında).' },
  slight: { title: 'Çok küçük fark', detail: 'Yan yana koyunca deneyimli göz fark eder (ΔE 1–2).' },
  noticeable: { title: 'Fark edilir', detail: 'Çoğu kişi yan yana bakınca farkı görür (ΔE 2–3,5).' },
  clear: { title: 'Belirgin fark', detail: 'Ayrı renkler gibi algılanır (ΔE 3,5–6).' },
  different: { title: 'Farklı renkler', detail: 'Bunlar aynı renk değil (ΔE 6’nın üzerinde).' },
};

const SIDE: Record<Exclude<Comparison, 'same'>, string> = { first: 'Soldaki', second: 'Sağdaki' };

const describe = (which: Comparison, same: string, differs: (side: string) => string): string =>
  which === 'same' ? same : differs(SIDE[which]);

function Side({ color }: { color: ComparedColor }) {
  return (
    <div className={styles.side}>
      <div className={styles.swatch} style={{ background: color.hex }} role="img" aria-label={`Renk örneği ${color.hex}`} />
      {color.caption && <p className={styles.caption}>{color.caption}</p>}
      <p className={styles.name}>{color.name}</p>
      <p className={styles.hex}>{color.hex}</p>
    </div>
  );
}

export function CompareView({ first, second, difference }: CompareViewProps) {
  const text = LEVEL_TEXT[difference.level];

  return (
    <section className={styles.compare} aria-label="Renk karşılaştırma">
      <div className={styles.pair}>
        <Side color={first} />
        <Side color={second} />
      </div>

      <div className={styles.result}>
        <p className={styles.delta}>
          ΔE <strong>{difference.deltaE.toFixed(1).replace('.', ',')}</strong>
        </p>
        <p className={styles.verdict}>{text.title}</p>
        <p className={styles.detail}>{text.detail}</p>
        <ul className={styles.facts}>
          <li>{describe(difference.lighter, 'Açıklıkları benzer.', (side) => `${side} renk daha açık.`)}</li>
          <li>{describe(difference.moreVivid, 'Canlılıkları benzer.', (side) => `${side} renk daha canlı, diğeri daha soluk.`)}</li>
        </ul>
      </div>

      <p className={styles.caveat}>
        Telefon fotoğrafında ΔE 3’ün altındaki farklar ışığa göre değişebilir. Resmî onay için spektrofotometre ölçümü gerekir.
      </p>
    </section>
  );
}
