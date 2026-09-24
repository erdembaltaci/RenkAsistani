import { useCallback, useMemo, useState } from 'react';
import { compareHexColors, type ColorDifference } from '../domain/colorDifference';
import type { SavedColor } from '../domain/savedColor';

export interface ComparedColor {
  name: string;
  hex: string;
  /** Renk kartında gösterilen kısa başlık (ör. üretim kodu ya da "Şu anki renk"). */
  caption: string;
}

const toCompared = (color: SavedColor | undefined): ComparedColor | null =>
  color ? { name: color.name, hex: color.hex, caption: color.code } : null;

/**
 * Notlar arasında karşılaştırma seçimi. `base` verilirse (ör. şu anki fotoğraftaki renk) o birinci renktir
 * ve yalnızca bir not seçmek yeter; verilmezse iki not seçilir (üçüncüde en eski seçim düşer).
 */
export function useCompareSelection(colors: readonly SavedColor[], base: ComparedColor | null) {
  const [isActive, setIsActive] = useState(base !== null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const capacity = base ? 1 : 2;

  const toggle = useCallback(
    (id: string) => {
      setSelectedIds((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id].slice(-capacity)));
    },
    [capacity],
  );

  const start = useCallback(() => setIsActive(true), []);
  const stop = useCallback(() => {
    setIsActive(false);
    setSelectedIds([]);
  }, []);

  const byId = (id: string | undefined) => colors.find((color) => color.id === id);
  const picked = selectedIds.map((id) => toCompared(byId(id)));
  const first = base ?? picked[0] ?? null;
  const second = base ? (picked[0] ?? null) : (picked[1] ?? null);

  const firstHex = first?.hex ?? null;
  const secondHex = second?.hex ?? null;
  const difference: ColorDifference | null = useMemo(
    () => (firstHex && secondHex ? compareHexColors(firstHex, secondHex) : null),
    [firstHex, secondHex],
  );

  return { isActive, start, stop, selectedIds, toggle, first, second, difference };
}
