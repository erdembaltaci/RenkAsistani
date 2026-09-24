import type { DeviationKind } from '../hooks/useColorSession';
import { Notice } from './Notice';

interface DeviationNoticeProps {
  kind: DeviationKind;
}

export function DeviationNotice({ kind }: DeviationNoticeProps) {
  if (kind === 'outliers') {
    return (
      <Notice variant="warning" title="Fotoğraflar farklı çıktı">
        Işık farkı olabilir. İşaretliyi kaldırıp yeniden çek.
      </Notice>
    );
  }
  if (kind === 'undecidable') {
    return (
      <Notice variant="warning" title="İki fotoğraf farklı çıktı">
        Bir fotoğraf daha ekle.
      </Notice>
    );
  }
  return null;
}
