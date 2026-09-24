export const MAX_NOTE_LENGTH = 300;
export const MAX_CODE_LENGTH = 40;

export interface SavedColor {
  id: string;
  name: string;
  hex: string;
  tone: string;
  /** Kısa etiket veya üretim kodu, ör. "A15". Boş olabilir. */
  code: string;
  note: string;
  /** Kayıt anı, epoch milisaniye. */
  savedAt: number;
}

export type NewSavedColor = Omit<SavedColor, 'id' | 'savedAt'>;

export interface SavedColorChanges {
  code?: string;
  note?: string;
}

const isString = (value: unknown): value is string => typeof value === 'string';

/**
 * Depodan okunan değeri doğrular. `code` alanından önce kaydedilmiş eski kayıtlar da geçerlidir; boş kod atanır.
 * Geçersizse null döner.
 */
export function parseSavedColor(value: unknown): SavedColor | null {
  if (typeof value !== 'object' || value === null) return null;
  const candidate = value as Record<string, unknown>;
  const { id, name, hex, tone, note, savedAt } = candidate;
  if (
    !isString(id) ||
    !isString(name) ||
    !isString(hex) ||
    !isString(tone) ||
    !isString(note) ||
    typeof savedAt !== 'number' ||
    !Number.isFinite(savedAt)
  ) {
    return null;
  }
  return { id, name, hex, tone, note, savedAt, code: isString(candidate.code) ? candidate.code : '' };
}

export function normalizeNote(note: string): string {
  return note.trim().slice(0, MAX_NOTE_LENGTH);
}

/** Kod tek satırdır: satır sonları ve art arda boşluklar tek boşluğa iner. */
export function normalizeCode(code: string): string {
  return code.replace(/\s+/g, ' ').trim().slice(0, MAX_CODE_LENGTH);
}

type Printable = Pick<SavedColor, 'name' | 'hex' | 'tone' | 'code' | 'note'>;

/** Paylaşılan veya kopyalanan tek bir rengin sade metni. */
export function formatColorText({ name, hex, tone, code, note }: Printable): string {
  const title = [code, name, hex, tone].filter(Boolean).join(' · ');
  return [title, note ? `Not: ${note}` : null].filter(Boolean).join('\n');
}

/** Notlar uygulamasına yapıştırılabilecek sade metin; kayıtlar silinirse yedek olarak işe yarar. */
export function formatSavedColorsAsText(colors: readonly SavedColor[]): string {
  return colors.map(formatColorText).join('\n\n');
}

/** Ad, kod, hex, ton ve notun içinde arar; Türkçe büyük/küçük harf kurallarına göre (I/ı, İ/i) karşılaştırır. */
export function filterSavedColors(colors: readonly SavedColor[], query: string): SavedColor[] {
  const needle = query.trim().toLocaleLowerCase('tr');
  if (!needle) return [...colors];
  return colors.filter(({ name, hex, tone, code, note }) =>
    [name, hex, tone, code, note].some((field) => field.toLocaleLowerCase('tr').includes(needle)),
  );
}

/** Excel'in dosyayı UTF-8 olarak tanıması için gereken bayt sırası işareti (U+FEFF). */
const BOM = String.fromCharCode(0xfeff);
const CSV_HEADER = ['Tarih', 'Kod', 'Renk adı', 'Hex', 'Ton', 'Not'];
const FORMULA_START = /^[=+\-@]/;
const PLAIN_NUMBER = /^-?\d+([.,]\d+)?$/;

const pad = (value: number): string => String(value).padStart(2, '0');

function formatCsvDate(timestamp: number): string {
  const date = new Date(timestamp);
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
}

function csvField(value: string): string {
  // Excel, "=" ile başlayan hücreleri formül sayar; kullanıcının yazdığı metin formüle dönüşmesin.
  const safe = FORMULA_START.test(value) && !PLAIN_NUMBER.test(value) ? `'${value}` : value;
  return /[;"\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/**
 * Türkçe Excel'in açabileceği CSV: ayırıcı noktalı virgül, başında UTF-8 BOM (Türkçe harfler bozulmasın).
 */
export function formatSavedColorsAsCsv(colors: readonly SavedColor[]): string {
  const rows = colors.map((color) =>
    [formatCsvDate(color.savedAt), color.code, color.name, color.hex, color.tone, color.note].map(csvField).join(';'),
  );
  return `${BOM}${[CSV_HEADER.join(';'), ...rows].join('\r\n')}\r\n`;
}
