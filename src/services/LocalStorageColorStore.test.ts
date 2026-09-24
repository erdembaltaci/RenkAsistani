import { describe, expect, it } from 'vitest';
import { MAX_CODE_LENGTH, MAX_NOTE_LENGTH } from '../domain/savedColor';
import type { KeyValueStorage } from './KeyValueStorage';
import { LocalStorageColorStore } from './LocalStorageColorStore';
import { MemoryStorage } from './MemoryStorage';

const entry = { name: 'Nane yeşili', hex: '#BCE6CF', tone: 'Açık, soluk yeşil', code: '', note: '' };
const KEY = 'renk-asistani.kaydedilenler.v1';

function makeStore(storage: KeyValueStorage = new MemoryStorage(), maxItems?: number) {
  let tick = 1000;
  let counter = 0;
  return new LocalStorageColorStore(storage, {
    now: () => (tick += 10),
    createId: () => `id-${++counter}`,
    ...(maxItems === undefined ? {} : { maxItems }),
  });
}

describe('LocalStorageColorStore', () => {
  it('boşken boş liste verir', () => {
    expect(makeStore().list()).toEqual([]);
  });

  it('kaydı ekler ve en yeni başta olacak şekilde listeler', () => {
    const store = makeStore();
    store.add({ ...entry, name: 'Birinci' });
    store.add({ ...entry, name: 'İkinci' });
    expect(store.list().map((item) => item.name)).toEqual(['İkinci', 'Birinci']);
  });

  it('id ve zaman damgası atar', () => {
    const saved = makeStore().add(entry);
    expect(saved.id).toBe('id-1');
    expect(saved.savedAt).toBe(1010);
  });

  it('kayıtları aynı depolamayı kullanan yeni bir örnekte de geri getirir', () => {
    const storage = new MemoryStorage();
    makeStore(storage).add(entry);
    expect(makeStore(storage).list()).toHaveLength(1);
  });

  it('notu ve kodu kırpar, uzunluklarını sınırlar', () => {
    const store = makeStore();
    const saved = store.add({ ...entry, code: '  A15  ', note: '  mavi tişört  ' });
    expect(saved.code).toBe('A15');
    expect(saved.note).toBe('mavi tişört');
    expect(store.add({ ...entry, note: 'x'.repeat(MAX_NOTE_LENGTH + 20) }).note).toHaveLength(MAX_NOTE_LENGTH);
    expect(store.add({ ...entry, code: 'y'.repeat(MAX_CODE_LENGTH + 20) }).code).toHaveLength(MAX_CODE_LENGTH);
  });

  it('yalnızca verilen alanı günceller, diğer alan ve kayıtlara dokunmaz', () => {
    const store = makeStore();
    const first = store.add({ ...entry, name: 'Birinci', code: 'A1', note: 'eski' });
    store.add({ ...entry, name: 'İkinci' });

    store.update(first.id, { note: 'yeni not' });
    expect(store.list().find((item) => item.id === first.id)).toMatchObject({ code: 'A1', note: 'yeni not' });

    store.update(first.id, { code: ' B2 ' });
    expect(store.list().find((item) => item.id === first.id)).toMatchObject({ code: 'B2', note: 'yeni not' });
    expect(store.list().find((item) => item.name === 'İkinci')).toMatchObject({ code: '', note: '' });
  });

  it('kaydı siler', () => {
    const store = makeStore();
    const first = store.add({ ...entry, name: 'Birinci' });
    store.add({ ...entry, name: 'İkinci' });
    store.remove(first.id);
    expect(store.list().map((item) => item.name)).toEqual(['İkinci']);
  });

  it('sınırı aşınca en eski kaydı düşürür', () => {
    const store = makeStore(new MemoryStorage(), 2);
    store.add({ ...entry, name: 'A' });
    store.add({ ...entry, name: 'B' });
    store.add({ ...entry, name: 'C' });
    expect(store.list().map((item) => item.name)).toEqual(['C', 'B']);
  });

  it('bozuk JSON içeren depolamada çökmez, boş liste verir', () => {
    const storage = new MemoryStorage();
    storage.setItem(KEY, '{bozuk');
    expect(makeStore(storage).list()).toEqual([]);
  });

  it('geçersiz kayıtları atlar, geçerli olanları korur', () => {
    const storage = new MemoryStorage();
    const valid = { id: 'ok', name: 'Bej', hex: '#D8C3A5', tone: 'Açık bej', code: '', note: '', savedAt: 5 };
    storage.setItem(KEY, JSON.stringify([valid, { id: 1 }, 'x', null]));
    expect(makeStore(storage).list()).toEqual([valid]);
  });

  it('kod alanından önce kaydedilmiş eski kayıtları boş kodla okur (geriye uyumluluk)', () => {
    const storage = new MemoryStorage();
    const legacy = { id: 'old', name: 'Bej', hex: '#D8C3A5', tone: 'Açık bej', note: 'eski not', savedAt: 5 };
    storage.setItem(KEY, JSON.stringify([legacy]));

    const [item] = makeStore(storage).list();
    expect(item).toEqual({ ...legacy, code: '' });
  });

  it('depolama yazmayı reddederse hata fırlatır ve mevcut kayıtlar bozulmaz', () => {
    const backing = new MemoryStorage();
    const store = makeStore(backing);
    store.add(entry);

    const readOnly: KeyValueStorage = {
      getItem: (key) => backing.getItem(key),
      setItem: () => {
        throw new Error('QuotaExceededError');
      },
    };
    expect(() => makeStore(readOnly).add(entry)).toThrow();
    expect(makeStore(backing).list()).toHaveLength(1);
  });

  it('kalıcılık bayrağını yansıtır', () => {
    expect(makeStore().isPersistent).toBe(true);
    expect(new LocalStorageColorStore(new MemoryStorage(), { isPersistent: false }).isPersistent).toBe(false);
  });
});
