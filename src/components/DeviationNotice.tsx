import type { DeviationKind } from '../hooks/useColorSession';
import { Notice } from './Notice';

interface DeviationNoticeProps {
  kind: DeviationKind;
}

export function DeviationNotice({ kind }: DeviationNoticeProps) {
  if (kind === 'outliers') {
    return (
      <Notice variant="warning" title="Fotoğraflar birbirini tutmuyor">
        Bazı fotoğraflar diğerlerinden belirgin farklı renk verdi; ışık farkı olabilir. Bunlar “Farklı çıktı” diye
        işaretlendi. Kaldırıp aynı ışıkta yeniden çekebilirsin.
      </Notice>
    );
  }
  if (kind === 'undecidable') {
    return (
      <Notice variant="warning" title="İki fotoğraf birbirinden farklı çıktı">
        Hangisinin daha doğru olduğunu ayırt edemiyorum; ışık farkı olabilir. Aynı ışıkta bir fotoğraf daha ekle.
      </Notice>
    );
  }
  return null;
}
