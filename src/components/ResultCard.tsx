import type { ReactNode } from 'react';
import type { ReportView } from '../hooks/useColorSession';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { CheckIcon, CopyIcon, ResetIcon } from './icons';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  report: ReportView;
  onReset: () => void;
  /** Sonucun altına konacak eylemler (ör. kaydet paneli). */
  actions?: ReactNode;
}

const COPY_LABEL = { idle: 'Kopyala', copied: 'Kopyalandı', failed: 'Kopyalanamadı' } as const;

export function ResultCard({ report, onReset, actions }: ResultCardProps) {
  const { status, copy } = useCopyToClipboard();
  const { lab, rgb } = report;

  return (
    <section className={styles.card} aria-labelledby="result-name">
      <p className={styles.eyebrow}>
        Tahmini renk{report.photoCount > 1 ? ` · ${report.photoCount} fotoğraftan` : ''}
      </p>
      <h2 id="result-name" className={styles.name} aria-live="polite">
        {report.name}
      </h2>
      <p className={styles.tone}>Kısaca: {report.tone}</p>

      <div className={styles.swatchRow}>
        <div className={styles.swatch} style={{ background: report.hex }} role="img" aria-label={`Renk örneği ${report.hex}`} />
        <div className={styles.hexBlock}>
          <p className={styles.hexLabel}>Hex kodu</p>
          <p className={styles.hex}>{report.hex}</p>
          <button type="button" className={styles.copy} onClick={() => copy(report.hex)} aria-live="polite">
            {status === 'copied' ? <CheckIcon width={20} height={20} /> : <CopyIcon width={20} height={20} />}
            {COPY_LABEL[status]}
          </button>
        </div>
      </div>

      <p className={styles.alternative}>
        {report.isAmbiguous ? (
          <>
            Bu renk <strong>{report.name}</strong> ile <strong>{report.secondName}</strong> arasında kalıyor.
          </>
        ) : (
          <>
            En yakın ikinci ad: <strong>{report.secondName}</strong>
          </>
        )}
      </p>

      {actions}

      <details className={styles.details}>
        <summary>Teknik ayrıntılar</summary>
        <dl>
          <dt>RGB</dt>
          <dd>
            {rgb.r}, {rgb.g}, {rgb.b}
          </dd>
          <dt>LAB</dt>
          <dd>
            L {lab.l.toFixed(1)} · a {lab.a.toFixed(1)} · b {lab.b.toFixed(1)}
          </dd>
          <dt>Sözlükteki en yakın renk</dt>
          <dd>
            {report.name} ({report.dictionaryHex})
          </dd>
        </dl>
      </details>

      <button type="button" className={styles.reset} onClick={onReset}>
        <ResetIcon width={20} height={20} />
        Yeni ürün
      </button>
    </section>
  );
}
