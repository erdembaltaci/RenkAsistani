import type { Lab } from '../domain/types';
import { applyWhiteReference } from '../domain/whiteReference';
import type { LightCorrection, LightCorrector } from './LightCorrector';

export class WhiteReferenceCorrector implements LightCorrector {
  correct(color: Lab, reference: Lab): LightCorrection {
    return applyWhiteReference(color, reference);
  }
}
