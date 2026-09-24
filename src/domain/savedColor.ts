export const MAX_NOTE_LENGTH = 300;

export interface SavedColor {
  id: string;
  name: string;
  hex: string;
  tone: string;
  note: string;
  /** Kayıt anı, epoch milisaniye. */
  savedAt: number;
}

export type NewSavedColor = Omit<SavedColor, 'id' | 'savedAt'>;

const isString = (value: unknown): value is string => typeof value === 'string';

export function isSavedColor(value: unknown): value is SavedColor {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    isString(candidate.id) &&
    isString(candidate.name) &&
    isString(candidate.hex) &&
    isString(candidate.tone) &&
    isString(candidate.note) &&
    typeof candidate.savedAt === 'number' &&
    Number.isFinite(candidate.savedAt)
  );
}

export function normalizeNote(note: string): string {
  return note.trim().slice(0, MAX_NOTE_LENGTH);
}

/** Notlar uygulamasına yapıştırılabilecek sade metin; kayıtlar silinirse yedek olarak işe yarar. */
export function formatSavedColorsAsText(colors: readonly SavedColor[]): string {
  return colors
    .map(({ name, hex, tone, note }) => [`${name} · ${hex} · ${tone}`, note ? `Not: ${note}` : null].filter(Boolean).join('\n'))
    .join('\n\n');
}

/** Ad, hex, ton ve notun içinde arar; Türkçe büyük/küçük harf kurallarına göre (I/ı, İ/i) karşılaştırır. */
export function filterSavedColors(colors: readonly SavedColor[], query: string): SavedColor[] {
  const needle = query.trim().toLocaleLowerCase('tr');
  if (!needle) return [...colors];
  return colors.filter(({ name, hex, tone, note }) =>
    [name, hex, tone, note].some((field) => field.toLocaleLowerCase('tr').includes(needle)),
  );
}
