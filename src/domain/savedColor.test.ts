import { describe, expect, it } from 'vitest';
import {
  MAX_CODE_LENGTH,
  MAX_NOTE_LENGTH,
  filterSavedColors,
  formatColorText,
  formatSavedColorsAsCsv,
  formatSavedColorsAsText,
  normalizeCode,
  normalizeNote,
  parseSavedColor,
  type SavedColor,
} from './savedColor';

// Öğle saati: hangi saat diliminde çalışırsa çalışsın yerel tarih aynı kalır.
const NOON = new Date(2026, 8, 24, 12, 0, 0).getTime();

const sample: SavedColor = {
  id: 'a1',
  name: 'Gümüş gri',
  hex: '#CFCFD1',
  tone: 'Açık gri',
  code: '',
  note: 'mavi tişört',
  savedAt: NOON,
};

describe('parseSavedColor', () => {
  it('geçerli kaydı olduğu gibi döndürür', () => {
    expect(parseSavedColor({ ...sample, code: 'A15' })).toEqual({ ...sample, code: 'A15' });
  });

  it('kod alanı olmayan eski kaydı boş kodla kabul eder', () => {
    const legacy: Partial<SavedColor> = { ...sample };
    delete legacy.code;
    expect(parseSavedColor(legacy)).toEqual({ ...sample, code: '' });
  });

  it.each([null, undefined, 'metin', 42, [], {}, { ...sample, id: 5 }, { ...sample, savedAt: 'dün' }, { ...sample, savedAt: NaN }])(
    'geçersiz değeri reddeder (%j)',
    (value) => {
      expect(parseSavedColor(value)).toBeNull();
    },
  );

  it('eksik zorunlu alanı reddeder', () => {
    const withoutNote: Partial<SavedColor> = { ...sample };
    delete withoutNote.note;
    expect(parseSavedColor(withoutNote)).toBeNull();
  });
});

describe('normalizeNote / normalizeCode', () => {
  it('notu kırpar ve uzunluğu sınırlar', () => {
    expect(normalizeNote('  merhaba  ')).toBe('merhaba');
    expect(normalizeNote('a'.repeat(MAX_NOTE_LENGTH + 50))).toHaveLength(MAX_NOTE_LENGTH);
  });

  it('kodu tek satıra indirir, kırpar ve sınırlar', () => {
    expect(normalizeCode('  A15 \n üretim  ')).toBe('A15 üretim');
    expect(normalizeCode('x'.repeat(MAX_CODE_LENGTH + 10))).toHaveLength(MAX_CODE_LENGTH);
  });
});

describe('formatColorText', () => {
  it('notu ikinci satıra ekler, not yoksa tek satır yazar', () => {
    expect(formatColorText(sample)).toBe('Gümüş gri · #CFCFD1 · Açık gri\nNot: mavi tişört');
    expect(formatColorText({ ...sample, note: '' })).toBe('Gümüş gri · #CFCFD1 · Açık gri');
  });

  it('kod varsa başa ekler', () => {
    expect(formatColorText({ ...sample, code: 'A15', note: '' })).toBe('A15 · Gümüş gri · #CFCFD1 · Açık gri');
  });
});

describe('formatSavedColorsAsText', () => {
  it('kayıtları boş satırla ayırır', () => {
    const text = formatSavedColorsAsText([
      { ...sample, note: '' },
      { ...sample, id: 'b2', name: 'Nane yeşili', hex: '#BCE6CF', tone: 'Açık, soluk yeşil', note: '' },
    ]);
    expect(text).toBe('Gümüş gri · #CFCFD1 · Açık gri\n\nNane yeşili · #BCE6CF · Açık, soluk yeşil');
  });

  it('boş listede boş metin verir', () => {
    expect(formatSavedColorsAsText([])).toBe('');
  });
});

describe('filterSavedColors', () => {
  const list: SavedColor[] = [
    { ...sample, id: '1', name: 'Bordo', hex: '#6B0F1A', tone: 'Koyu kırmızı', code: 'A15', note: 'üretim ipi' },
    { ...sample, id: '2', name: 'Nane yeşili', hex: '#BCE6CF', tone: 'Açık, soluk yeşil', code: '', note: '' },
    { ...sample, id: '3', name: 'Lacivert', hex: '#1F2A4D', tone: 'Koyu mavi', code: 'B7', note: 'astar' },
  ];

  it('boş aramada hepsini verir', () => {
    expect(filterSavedColors(list, '  ')).toHaveLength(3);
  });

  it('kodda ve notta büyük/küçük harf fark etmeden arar', () => {
    expect(filterSavedColors(list, 'a15').map((c) => c.id)).toEqual(['1']);
    expect(filterSavedColors(list, 'ÜRETİM').map((c) => c.id)).toEqual(['1']);
    expect(filterSavedColors(list, 'b7').map((c) => c.id)).toEqual(['3']);
  });

  it('ad, hex ve tonda da arar', () => {
    expect(filterSavedColors(list, 'nane').map((c) => c.id)).toEqual(['2']);
    expect(filterSavedColors(list, '1f2a4d').map((c) => c.id)).toEqual(['3']);
    expect(filterSavedColors(list, 'soluk').map((c) => c.id)).toEqual(['2']);
  });

  it('eşleşme yoksa boş liste verir ve girdiyi değiştirmez', () => {
    expect(filterSavedColors(list, 'yok böyle bir şey')).toEqual([]);
    expect(list).toHaveLength(3);
  });
});

describe('formatSavedColorsAsCsv', () => {
  const rows = (csv: string): string[] => csv.replace('﻿', '').split('\r\n').filter(Boolean);

  it('BOM, başlık ve noktalı virgül ayırıcıyla yazar', () => {
    const csv = formatSavedColorsAsCsv([{ ...sample, code: 'A15', note: 'ip' }]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(rows(csv)[0]).toBe('Tarih;Kod;Renk adı;Hex;Ton;Not');
    expect(rows(csv)[1]).toBe('24.09.2026;A15;Gümüş gri;#CFCFD1;Açık gri;ip');
  });

  it('noktalı virgül, tırnak ve satır sonu içeren alanları tırnaklar', () => {
    const csv = formatSavedColorsAsCsv([{ ...sample, note: 'a;b "c"\nd' }]);
    expect(csv).toContain('"a;b ""c""\nd"');
  });

  it('Excel formülü gibi başlayan metni etkisizleştirir, düz sayıya dokunmaz', () => {
    const csv = formatSavedColorsAsCsv([{ ...sample, note: '=1+1' }, { ...sample, id: 'x', note: '-5' }]);
    const lines = rows(csv);
    expect(lines[1]).toContain(";'=1+1");
    expect(lines[2]).toMatch(/;-5$/);
  });

  it('boş listede yalnızca başlık verir', () => {
    expect(rows(formatSavedColorsAsCsv([]))).toEqual(['Tarih;Kod;Renk adı;Hex;Ton;Not']);
  });
});
