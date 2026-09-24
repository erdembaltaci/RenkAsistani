/** `window.localStorage`'ın kullandığımız alt kümesi; testte ve depolama kapalıyken yerine bellek kullanılabilir. */
export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}
