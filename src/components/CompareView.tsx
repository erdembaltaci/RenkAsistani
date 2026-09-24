import type { ColorDifference, DifferenceLevel } from '../domain/colorDifference';
import type { ComparedColor } from '../hooks/useCompareSelection';
import styles from './CompareView.module.css';

interface CompareViewProps {
  first: ComparedColor;
  second: ComparedColor;
  difference: ColorDifference;
}

/** Fark derecesi, sayı yerine herkesin anlayacağı sözcüklerle ve 5 kademeli bir ölçekle gösterilir. */
const LEVELS: readonly DifferenceLevel[] = ['imperceptible', 'slight', 'noticeable', 'clear', 'different'];

const LEVEL_TEXT: Record<DifferenceLevel, { title: string; detail: string }> = {
  imperceptible: { title: 'Aynı renk', detail: 'Gözle ayırt edilemez.' },
  slight: { title: 'Çok yakın', detail: 'Yan yana koyunca zor fark edilir.' },
  noticeable: { title: 'Biraz farklı', detail: 'Yan yana bakınca fark edilir.' },
  clear: { title: 'Belirgin farklı', detail: 'Ayrı renkler gibi görünüyor.' },
  different: { title: 'Farklı renkler', detail: 'Bunlar aynı renk değil.' },
};

const SIDE = { first: 'Soldaki', second: 'Sağdaki' } as const;

function Side({ color }: { color: ComparedColor }) {
  return (
    <div className={styles.side}>
      <div className={styles.swatch} style={{ background: color.hex }} role="img" aria-label={`Renk örneği ${color.hex}`} />
      {color.caption && <p className={styles.caption}>{color.caption}</p>}
      <p className={styles.name}>{color.name}</p>
    </div>
  );
}

export function CompareView({ first, second, difference }: CompareViewProps) {
  const text = LEVEL_TEXT[difference.level];
  const step = LEVELS.indexOf(difference.level) + 1;
  const facts = [
    difference.lighter === 'same' ? null : `${SIDE[difference.lighter]} daha açık`,
    difference.moreVivid === 'same' ? null : `${SIDE[difference.moreVivid]} daha canlı`,
  ].filter((fact): fact is string => fact !== null);

  return (
    <section className={styles.compare} aria-label="Renk karşılaştırma">
      <div className={styles.pair}>
        <Side color={first} />
        <Side color={second} />
      </div>

      <div className={styles.result}>
        <p className={styles.verdict}>{text.title}</p>
        <div className={styles.meter} role="img" aria-label={`Fark derecesi ${step} / ${LEVELS.length}`}>
          {LEVELS.map((level, index) => (
            <i key={level} className={index < step ? styles.on : undefined} />
          ))}
        </div>
        <p className={styles.detail}>{text.detail}</p>
        {facts.length > 0 && (
          <ul className={styles.facts}>
            {facts.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        )}
      </div>

      <details className={styles.tech}>
        <summary>Teknik</summary>
        <p>
          ΔE {difference.deltaE.toFixed(1).replace('.', ',')} (CIEDE2000). Telefon fotoğrafında 3’ün altındaki farklar
          ışığa göre değişebilir.
        </p>
      </details>
    </section>
  );
}
