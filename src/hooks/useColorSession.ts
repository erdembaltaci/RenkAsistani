import { useCallback, useMemo, useRef, useState } from 'react';
import { labToRgb } from '../domain/colorSpace';
import { rgbToHex } from '../domain/hex';
import type { Lab, PixelBuffer, Point, Rgb } from '../domain/types';
import { useServices } from './servicesContext';

export const MAX_PHOTOS = 6;

/** none: düzeltme yok; applied: beyaz referansa göre düzeltildi; unreliable: seçilen nokta beyaza benzemiyor. */
export type LightStatus = 'none' | 'applied' | 'unreliable';

interface PhotoState {
  id: string;
  previewUrl: string;
  pixels: PixelBuffer;
  focus: Point | null;
  reference: Point | null;
  lab: Lab;
  lightStatus: LightStatus;
}

export interface PhotoView {
  id: string;
  previewUrl: string;
  focus: Point | null;
  reference: Point | null;
  lightStatus: LightStatus;
  hex: string;
  colorName: string;
  isDeviating: boolean;
}

export type DeviationKind = 'none' | 'outliers' | 'undecidable';

export interface ReportView {
  hex: string;
  rgb: Rgb;
  lab: Lab;
  name: string;
  secondName: string;
  isAmbiguous: boolean;
  /** Sözlükteki en yakın rengin hex kodu. */
  dictionaryHex: string;
  tone: string;
  photoCount: number;
  deviation: DeviationKind;
  /** En az bir fotoğrafta beyaz referansla ışık düzeltmesi uygulandı. */
  isLightCorrected: boolean;
}

const LOAD_ERROR = 'Bu fotoğraf açılamadı. Başka bir fotoğraf dene.';
const PARTIAL_ERROR = 'Bazı fotoğraflar açılamadı, diğerleri eklendi.';

export function useColorSession() {
  const { imageLoader, sampler, namer, aggregator, toneDescriber, lightCorrector } = useServices();
  const [photos, setPhotos] = useState<PhotoState[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextId = useRef(0);

  const measure = useCallback(
    (pixels: PixelBuffer, focus: Point | null, reference: Point | null): Pick<PhotoState, 'lab' | 'lightStatus'> => {
      const measured = sampler.sample(pixels, focus ?? undefined);
      if (!reference) return { lab: measured, lightStatus: 'none' };

      const correction = lightCorrector.correct(measured, sampler.sample(pixels, reference));
      return { lab: correction.corrected, lightStatus: correction.isReliable ? 'applied' : 'unreliable' };
    },
    [sampler, lightCorrector],
  );

  const addFiles = useCallback(
    async (files: readonly File[]) => {
      const room = MAX_PHOTOS - photos.length;
      const accepted = files.slice(0, Math.max(0, room));
      if (accepted.length === 0) return;

      setIsLoading(true);
      setError(null);
      const added: PhotoState[] = [];
      let failed = 0;

      for (const file of accepted) {
        try {
          const { pixels, previewUrl } = await imageLoader.load(file);
          added.push({
            id: `photo-${nextId.current++}`,
            previewUrl,
            pixels,
            focus: null,
            reference: null,
            ...measure(pixels, null, null),
          });
        } catch {
          failed += 1;
        }
      }

      if (added.length > 0) {
        setPhotos((current) => [...current, ...added]);
        setActiveId((added[added.length - 1] as PhotoState).id);
      }
      if (failed > 0) setError(added.length === 0 ? LOAD_ERROR : PARTIAL_ERROR);
      setIsLoading(false);
    },
    [imageLoader, measure, photos.length],
  );

  const remeasure = useCallback(
    (id: string, change: Partial<Pick<PhotoState, 'focus' | 'reference'>>) => {
      setPhotos((current) =>
        current.map((photo) => {
          if (photo.id !== id) return photo;
          const next = { ...photo, ...change };
          return { ...next, ...measure(next.pixels, next.focus, next.reference) };
        }),
      );
    },
    [measure],
  );

  const setFocus = useCallback((id: string, focus: Point | null) => remeasure(id, { focus }), [remeasure]);
  const setReference = useCallback((id: string, reference: Point | null) => remeasure(id, { reference }), [remeasure]);

  const removePhoto = useCallback(
    (id: string) => {
      const remaining = photos.filter((photo) => photo.id !== id);
      setPhotos(remaining);
      if (activeId === id) setActiveId(remaining[remaining.length - 1]?.id ?? null);
    },
    [photos, activeId],
  );

  const reset = useCallback(() => {
    setPhotos([]);
    setActiveId(null);
    setError(null);
  }, []);

  const analysis = useMemo(() => {
    if (photos.length === 0) return null;

    const aggregation = aggregator.aggregate(photos.map((photo) => photo.lab));
    const rgb = labToRgb(aggregation.color);
    const match = namer.name(aggregation.color);

    const deviation: DeviationKind =
      aggregation.deviatingIndexes.length === 0
        ? 'none'
        : photos.length === 2
          ? 'undecidable'
          : 'outliers';

    const report: ReportView = {
      hex: rgbToHex(rgb),
      rgb: { r: Math.round(rgb.r), g: Math.round(rgb.g), b: Math.round(rgb.b) },
      lab: aggregation.color,
      name: match.primary.name,
      secondName: match.secondary.name,
      isAmbiguous: match.isAmbiguous,
      dictionaryHex: match.primary.hex,
      tone: toneDescriber.describe(aggregation.color),
      photoCount: photos.length,
      deviation,
      isLightCorrected: photos.some((photo) => photo.lightStatus === 'applied'),
    };

    const views: PhotoView[] = photos.map((photo, index) => ({
      id: photo.id,
      previewUrl: photo.previewUrl,
      focus: photo.focus,
      reference: photo.reference,
      lightStatus: photo.lightStatus,
      hex: rgbToHex(labToRgb(photo.lab)),
      colorName: namer.name(photo.lab).primary.name,
      isDeviating: aggregation.deviatingIndexes.includes(index),
    }));

    return { report, views };
  }, [photos, aggregator, namer, toneDescriber]);

  const views = analysis?.views ?? [];
  const activePhoto = views.find((view) => view.id === activeId) ?? views[views.length - 1] ?? null;

  return {
    photos: views,
    activePhoto,
    report: analysis?.report ?? null,
    isLoading,
    error,
    canAddMore: photos.length < MAX_PHOTOS,
    addFiles,
    selectPhoto: setActiveId,
    setFocus,
    setReference,
    removePhoto,
    reset,
  };
}
