import type { NewSavedColor, SavedColor, SavedColorChanges } from '../domain/savedColor';

export interface ColorStore {
  /** Kayıtlar kalıcı mı (yeniden açılınca duruyor mu)? Depolama kapalıysa false. */
  readonly isPersistent: boolean;
  /** En yeni kayıt başta. */
  list(): SavedColor[];
  add(entry: NewSavedColor): SavedColor;
  /** Yalnızca verilen alanları günceller. */
  update(id: string, changes: SavedColorChanges): void;
  remove(id: string): void;
}
