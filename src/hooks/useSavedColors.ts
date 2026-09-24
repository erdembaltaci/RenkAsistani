import { useCallback, useMemo, useState } from 'react';
import { formatSavedColorsAsText, type NewSavedColor, type SavedColorChanges } from '../domain/savedColor';
import { useServices } from './servicesContext';

const SAVE_ERROR = 'Kaydedilemedi. Tarayıcı bu site için depolamayı engelliyor olabilir.';

export function useSavedColors() {
  const { colorStore } = useServices();
  const [saved, setSaved] = useState(() => colorStore.list());
  const [error, setError] = useState<string | null>(null);

  const attempt = useCallback(
    (action: () => void): boolean => {
      try {
        action();
        setSaved(colorStore.list());
        setError(null);
        return true;
      } catch {
        setError(SAVE_ERROR);
        return false;
      }
    },
    [colorStore],
  );

  const save = useCallback((entry: NewSavedColor) => attempt(() => colorStore.add(entry)), [attempt, colorStore]);
  const update = useCallback(
    (id: string, changes: SavedColorChanges) => attempt(() => colorStore.update(id, changes)),
    [attempt, colorStore],
  );
  const remove = useCallback((id: string) => attempt(() => colorStore.remove(id)), [attempt, colorStore]);
  const listText = useMemo(() => formatSavedColorsAsText(saved), [saved]);

  return { saved, listText, isPersistent: colorStore.isPersistent, error, save, update, remove };
}
