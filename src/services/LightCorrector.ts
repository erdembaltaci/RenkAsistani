import type { Lab } from '../domain/types';
import type { LightCorrection } from '../domain/whiteReference';

export type { LightCorrection };

export interface LightCorrector {
  /** `reference`, fotoğraftaki beyaz bir yüzeyin ölçülen rengidir. */
  correct(color: Lab, reference: Lab): LightCorrection;
}
