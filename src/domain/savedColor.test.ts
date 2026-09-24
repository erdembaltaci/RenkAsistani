import { describe, expect, it } from 'vitest';
import { MAX_NOTE_LENGTH, formatSavedColorsAsText, isSavedColor, normalizeNote, type SavedColor } from './savedColor';

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
