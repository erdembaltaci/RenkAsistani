import type { Lab } from '../domain/types';

export interface ToneDescriber {
  /** Renk adını bilmeyen biri için tonu sade sözcüklerle anlatır, ör. "Koyu, kırmızımsı mor". */
  describe(color: Lab): string;
}
