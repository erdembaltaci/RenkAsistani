import { describe, expect, it } from 'vitest';
import { MAX_NOTE_LENGTH, filterSavedColors, formatColorText, formatSavedColorsAsText, isSavedColor, normalizeNote, type SavedColor } from './savedColor';

const sample: SavedColor = {
  id: 'a1',
  name: 'Gümüş gri',
  hex: '#CFCFD1',
  tone: 'Açık gri',
  note: 'mavi tişört',
  savedAt: 1_700_000_000_000,
};

describe('isSavedColor', () => {
  it('geçerli kaydı kabul eder', () => {
    expect(isSavedColor(sample)).toBe(true);
  });

  it.each([null, undefined, 'metin', 42, [], {}, { ...sample, id: 5 }, { ...sample, savedAt: 'dün' }, { ...sample, savedAt: NaN }])(
    'geçersiz değeri reddeder (%j)',
    (value) => {
      expect(isSavedColor(value)).toBe(false);
    },
  );

  it('eksik alanı reddeder', () => {
    const withoutNote: Partial<SavedColor> = { ...sample };
    delete withoutNote.note;
    expect(isSavedColor(withoutNote)).toBe(false);
  });
});

describe('normalizeNote', () => {
  it('boşlukları kırpar ve uzunluğu sınırlar', () => {
    expect(normalizeNote('  merhaba  ')).toBe('merhaba');
    expect(normalizeNote('a'.repeat(MAX_NOTE_LENGTH + 50))).toHaveLength(MAX_NOTE_LENGTH);
  });
});

describe('formatSavedColorsAsText', () => {
  it('her kaydı ad, hex ve ton ile yazar; not varsa ekler', () => {
    const text = formatSavedColorsAsText([sample, { ...sample, id: 'b2', name: 'Nane yeşili', hex: '#BCE6CF', tone: 'Açık, soluk yeşil', note: '' }]);
    expect(text).toBe('Gümüş gri · #CFCFD1 · Açık gri\nNot: mavi tişört\n\nNane yeşili · #BCE6CF · Açık, soluk yeşil');
  });

  it('boş listede boş metin verir', () => {
    expect(formatSavedColorsAsText([])).toBe('');
  });
});

describe('filterSavedColors', () => {
  const list: SavedColor[] = [
    { ...sample, id: '1', name: 'Bordo', hex: '#6B0F1A', tone: 'Koyu kırmızı', note: 'A15 nolu üretim ipi' },
    { ...sample, id: '2', name: 'Nane yeşili', hex: '#BCE6CF', tone: 'Açık, soluk yeşil', note: '' },
    { ...sample, id: '3', name: 'Lacivert', hex: '#1F2A4D', tone: 'Koyu mavi', note: 'B7 astar' },
  ];

  it('boş aramada hepsini verir', () => {
    expect(filterSavedColors(list, '  ')).toHaveLength(3);
  });

  it('notun içinde büyük/küçük harf fark etmeden arar', () => {
    expect(filterSavedColors(list, 'a15').map((c) => c.id)).toEqual(['1']);
    expect(filterSavedColors(list, 'ÜRETİM').map((c) => c.id)).toEqual(['1']);
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

describe('formatColorText', () => {
  it('notsuz rengi tek satırda yazar', () => {
    expect(formatColorText({ ...sample, note: '' })).toBe('Gümüş gri · #CFCFD1 · Açık gri');
  });

  it('notu ikinci satıra ekler', () => {
    expect(formatColorText(sample)).toBe('Gümüş gri · #CFCFD1 · Açık gri\nNot: mavi tişört');
  });
});
