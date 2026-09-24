import { channelToLinear, labToRgb, linearToChannel, rgbToLab } from './colorSpace';
import type { Lab } from './types';

export interface LightCorrection {
  corrected: Lab;
  /** Referans noktası gerçekten beyaz/açık gri bir yüzeye benziyorsa true; değilse düzeltme uygulanmaz. */
  isReliable: boolean;
}

/** Beyaz ofis kâğıdı, L* ≈ 95 civarında yansıtır; referans bu açıklığa getirilir. */
const PAPER_LIGHTNESS = 95;
const MAX_REFERENCE_CHROMA = 40;
const MIN_REFERENCE_LIGHTNESS = 55;
const MIN_CHANNEL = 0.02;

const paperLinear = ((PAPER_LIGHTNESS + 16) / 116) ** 3;

// Sarı ampul altında beyaz kâğıt bile belirgin renkli görünür (doygunluk ≈ 25–35); eşik bu yüzden geniş tutulur.
// Kırmızı, mavi gibi gerçekten renkli bir nokta yine de reddedilir.
const isPlausibleWhite = ({ l, a, b }: Lab): boolean =>
  l >= MIN_REFERENCE_LIGHTNESS && Math.hypot(a, b) <= MAX_REFERENCE_CHROMA;

/**
 * Fotoğraftaki beyaz bir kâğıda göre ışığı düzeltir (von Kries tarzı, doğrusal RGB'de).
 * Hem renk sapmasını (sarı ampul, gölge) hem de pozlamayı düzeltir: referans, beyaz kâğıt açıklığına çekilecek
 * şekilde her kanal ayrı ölçeklenir ve aynı ölçekler ürün rengine uygulanır.
 */
export function applyWhiteReference(color: Lab, reference: Lab): LightCorrection {
  if (!isPlausibleWhite(reference)) {
    return { corrected: color, isReliable: false };
  }

  const ref = labToRgb(reference);
  const source = labToRgb(color);
  const scale = (referenceChannel: number, colorChannel: number): number => {
    const gain = paperLinear / Math.max(MIN_CHANNEL, channelToLinear(referenceChannel));
    return linearToChannel(channelToLinear(colorChannel) * gain);
  };

  const corrected = rgbToLab({
    r: scale(ref.r, source.r),
    g: scale(ref.g, source.g),
    b: scale(ref.b, source.b),
  });
  return { corrected, isReliable: true };
}
