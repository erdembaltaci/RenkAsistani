import type { Lab } from '../domain/types';

export interface ColorMatch {
  name: string;
  /** Ölçülen rengin değil, sözlükteki rengin hex kodu. */
  hex: string;
  /** CIEDE2000 mesafesi. */
  distance: number;
}

export interface NameResult {
  primary: ColorMatch;
  secondary: ColorMatch;
  /** İki aday, ölçülen renge neredeyse eşit uzaklıktaysa true. */
  isAmbiguous: boolean;
}

export interface ColorNamer {
  name(color: Lab): NameResult;
}
