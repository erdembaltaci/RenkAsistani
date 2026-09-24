import { analyzeTone, type ChromaLevel, type LightnessLevel, type Tone } from '../domain/tone';
import type { Lab } from '../domain/types';
import type { ToneDescriber } from './ToneDescriber';

interface HueSector {
  /** Sektörün başladığı Lab ton açısı (derece); bir sonrakinin başına kadar sürer. */
  from: number;
  label: string;
  /** "hafif ... gri" gibi çok düşük doygunlukta kullanılan sıfat. */
  tint: string;
}

// Sınırlar, bilinen renklerin gerçek Lab ton açılarına bakılarak ayarlandı (örn. saf mavi ≈306°, mor ≈328°).
const HUE_SECTORS: readonly HueSector[] = [
  { from: 20, label: 'kırmızı', tint: 'kırmızımsı' },
  { from: 46, label: 'kırmızımsı turuncu', tint: 'turuncumsu' },
  { from: 60, label: 'turuncu', tint: 'turuncumsu' },
  { from: 78, label: 'turuncumsu sarı', tint: 'sarımsı' },
  { from: 92, label: 'sarı', tint: 'sarımsı' },
  { from: 108, label: 'sarımsı yeşil', tint: 'yeşilimsi' },
  { from: 124, label: 'yeşil', tint: 'yeşilimsi' },
  { from: 158, label: 'mavimsi yeşil', tint: 'yeşilimsi' },
  { from: 182, label: 'turkuaz', tint: 'mavimsi' },
  { from: 212, label: 'yeşilimsi mavi', tint: 'mavimsi' },
  { from: 232, label: 'mavi', tint: 'mavimsi' },
  { from: 296, label: 'morumsu mavi', tint: 'morumsu' },
  { from: 318, label: 'mor', tint: 'morumsu' },
  { from: 338, label: 'kırmızımsı mor', tint: 'morumsu' },
  { from: 356, label: 'morumsu kırmızı', tint: 'pembemsi' },
];

const LIGHTNESS_PREFIX: Record<LightnessLevel, string> = {
  veryDark: 'Çok koyu',
  dark: 'Koyu',
  medium: 'Orta koyulukta',
  light: 'Açık',
  veryLight: 'Çok açık',
};

const GRAY_NAME: Record<LightnessLevel, string> = {
  veryDark: 'Çok koyu gri',
  dark: 'Koyu gri',
  medium: 'Orta gri',
  light: 'Açık gri',
  veryLight: 'Çok açık gri',
};

const NEAR_WHITE_L = 94;
const NEAR_BLACK_L = 12;

const isLight = (level: LightnessLevel): boolean => level === 'light' || level === 'veryLight';
const isDark = (level: LightnessLevel): boolean => level === 'veryDark' || level === 'dark' || level === 'medium';

const isReddish = (hue: number): boolean => hue >= 338 || hue < 46;
const isOrangeToYellow = (hue: number, upTo: number): boolean => hue >= 46 && hue < upTo;

const sectorFor = (hue: number): HueSector => {
  const found = [...HUE_SECTORS].reverse().find((sector) => hue >= sector.from);
  return found ?? (HUE_SECTORS[HUE_SECTORS.length - 1] as HueSector);
};

const chromaAdjective = (chroma: ChromaLevel, lightness: LightnessLevel): string => {
  if (chroma === 'vivid') return 'canlı';
  if (chroma === 'muted') return isLight(lightness) ? 'soluk' : 'donuk';
  return '';
};

export class TurkishToneDescriber implements ToneDescriber {
  describe(color: Lab): string {
    const tone = analyzeTone(color);
    if (tone.chroma === 'neutral') return this.neutral(tone);
    if (tone.chroma === 'tinted') return this.tintedGray(tone);
    return this.colored(tone);
  }

  private neutral({ lightness, l }: Tone): string {
    if (l >= NEAR_WHITE_L) return 'Beyaza yakın';
    if (l < NEAR_BLACK_L) return 'Siyaha yakın';
    return GRAY_NAME[lightness];
  }

  private tintedGray({ lightness, hue, l }: Tone): string {
    const tint = `hafif ${sectorFor(hue).tint}`;
    if (l >= NEAR_WHITE_L) return `Beyaza yakın, ${tint}`;
    if (l < NEAR_BLACK_L) return `Siyaha yakın, ${tint}`;
    return `${LIGHTNESS_PREFIX[lightness]}, ${tint} gri`;
  }

  private colored({ lightness, chroma, hue }: Tone): string {
    const prefix = LIGHTNESS_PREFIX[lightness];

    // Açık kırmızı "pembe", koyu turuncu "kahverengi", soluk açık turuncu-sarı "bej" olarak bilinir.
    if (isReddish(hue) && isLight(lightness)) {
      return this.withAdjective(prefix, chromaAdjective(chroma, lightness), 'pembe');
    }
    if (isOrangeToYellow(hue, 92) && isDark(lightness) && chroma !== 'vivid') {
      return `${prefix} ${hue < 60 ? 'kırmızımsı ' : ''}kahverengi`;
    }
    if (isOrangeToYellow(hue, 100) && isLight(lightness) && chroma === 'muted') {
      return `${prefix} bej`;
    }

    return this.withAdjective(prefix, chromaAdjective(chroma, lightness), sectorFor(hue).label);
  }

  private withAdjective(prefix: string, adjective: string, label: string): string {
    return adjective ? `${prefix}, ${adjective} ${label}` : `${prefix}, ${label}`;
  }
}
