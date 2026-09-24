import type { NewSavedColor, SavedColor } from '../domain/savedColor';

export interface ColorStore {
  /** Kayıtlar kalıcı mı (yeniden açılınca duruyor mu)? Depolama kapalıysa false. */
  readonly isPersistent: boolean;
  /** En yeni kayıt başta. */
  list(): SavedColor[];
  add(entry: NewSavedColor): SavedColor;
  updateNote(id: string, note: string): void;
  remove(id: string): void;
}
