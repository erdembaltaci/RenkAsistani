import type { ReactNode } from 'react';
import type { ReportView } from '../hooks/useColorSession';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { CheckIcon, CopyIcon, ShareIcon } from './icons';
import styles from './ResultCard.module.css';

interface ResultCardProps {
  report: ReportView;
  onShare: () => void;
  /** Paylaşım başarısız olduğunda kısa süre gösterilen mesaj. */
  shareMessage: string | null;
  /** Sonucun altına konacak eylemler (ör. notlara ekle paneli). */
  actions?: ReactNode;
}

const COPY_LABEL = { idle: 'Kopyala', copied: 'Kopyalandı', failed: 'Kopyalanamadı' } as const;

export function ResultCard({ report, onShare, shareMessage, actions }: ResultCardProps) {
  const { status, copy } = useCopyToClipboard();
  const { lab, rgb } = report;

  return (
    <section className={styles.chip} aria-labelledby="result-name">
      {/* Renk bloğu düz ve gerçek renktedir; üstüne parlaklık/gradyan konmaz, aksi hâlde algıyı yanıltır. */}
      <div
        className={styles.block}
        style={{ background: report.hex, boxShadow: `0 26px 40px -22px ${report.hex}b3` }}
        role="img"
        aria-label={`Renk örneği ${report.hex}`}
      />

      <div className={styles.body}>
        <div className={styles.head}>
          <p className={styles.eyebrow}>
            Tahmini renk{report.photoCount > 1 ? ` · ${report.photoCount} fotoğraftan` : ''}
          </p>
          <h2 id="result-name" className={styles.name} aria-live="polite">
            {report.name}
          </h2>
          <p className={styles.tone}>{report.tone}</p>
        </div>

        <div className={styles.hexRow}>
          <button type="button" className={styles.hex} onClick={() => copy(report.hex)} aria-live="polite">
            <span className={styles.hexCode}>{report.hex}</span>
            <span className={styles.hexAction}>
              {status === 'copied' ? <CheckIcon width={18} height={18} /> : <CopyIcon width={18} height={18} />}
              {COPY_LABEL[status]}
            </span>
          </button>
          <button type="button" className={styles.share} onClick={onShare} aria-label="Rengi paylaş">
            <ShareIcon width={22} height={22} />
          </button>
        </div>
        {shareMessage && (
          <p className={styles.shareMessage} role="status">
            {shareMessage}
          </p>
        )}

        <p className={styles.alternative}>
          {report.isAmbiguous ? (
            <>
              <strong>{report.name}</strong> ile <strong>{report.secondName}</strong> arasında kalıyor.
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
      </div>
    </section>
  );
}
