import {
  normalizeCode,
  normalizeNote,
  parseSavedColor,
  type NewSavedColor,
  type SavedColor,
  type SavedColorChanges,
} from '../domain/savedColor';
import type { ColorStore } from './ColorStore';
import type { KeyValueStorage } from './KeyValueStorage';

const DEFAULT_KEY = 'renk-asistani.kaydedilenler.v1';
const DEFAULT_MAX_ITEMS = 200;

interface StoreOptions {
  key?: string;
  maxItems?: number;
  isPersistent?: boolean;
  now?: () => number;
  createId?: () => string;
}

const randomId = (): string => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export class LocalStorageColorStore implements ColorStore {
  readonly isPersistent: boolean;
  private readonly key: string;
  private readonly maxItems: number;
  private readonly now: () => number;
  private readonly createId: () => string;

  constructor(
    private readonly storage: KeyValueStorage,
    options: StoreOptions = {},
  ) {
    this.key = options.key ?? DEFAULT_KEY;
    this.maxItems = options.maxItems ?? DEFAULT_MAX_ITEMS;
    this.isPersistent = options.isPersistent ?? true;
    this.now = options.now ?? Date.now;
    this.createId = options.createId ?? randomId;
  }

  list(): SavedColor[] {
    return this.read();
  }

  add(entry: NewSavedColor): SavedColor {
    const saved: SavedColor = {
      ...entry,
      code: normalizeCode(entry.code),
      note: normalizeNote(entry.note),
      id: this.createId(),
      savedAt: this.now(),
    };
    // En eski kayıtlar sınırı aşınca düşer; depolama şişip yazma hatasına dönüşmesin.
    this.write([saved, ...this.read()].slice(0, this.maxItems));
    return saved;
  }

  update(id: string, changes: SavedColorChanges): void {
    this.write(
      this.read().map((item) =>
        item.id === id
          ? {
              ...item,
              ...(changes.code === undefined ? {} : { code: normalizeCode(changes.code) }),
              ...(changes.note === undefined ? {} : { note: normalizeNote(changes.note) }),
            }
          : item,
      ),
    );
  }

  remove(id: string): void {
    this.write(this.read().filter((item) => item.id !== id));
  }

  // Bozuk veya elle değiştirilmiş veri uygulamayı çökertmesin: geçersiz kayıtlar sessizce atlanır.
  private read(): SavedColor[] {
    try {
      const parsed: unknown = JSON.parse(this.storage.getItem(this.key) ?? '[]');
      if (!Array.isArray(parsed)) return [];
      return parsed.flatMap((value) => {
        const color = parseSavedColor(value);
        return color ? [color] : [];
      });
    } catch {
      return [];
    }
  }

  private write(items: readonly SavedColor[]): void {
    this.storage.setItem(this.key, JSON.stringify(items));
  }
}
