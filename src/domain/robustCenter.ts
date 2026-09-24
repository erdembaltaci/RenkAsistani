import { deltaE76 } from './deltaE';
import { weightedMedianLab } from './statistics';
import type { Lab, WeightedLab } from './types';

const BIN_SIZE = 8;
const INLIER_RADIUS = 12;
const MAX_ITERATIONS = 6;
const CONVERGENCE = 0.25;

type BinCoords = readonly [number, number, number];

const binOf = ({ l, a, b }: Lab): BinCoords => [
  Math.max(0, Math.floor(l / BIN_SIZE)),
  Math.max(0, Math.floor((a + 128) / BIN_SIZE)),
  Math.max(0, Math.floor((b + 128) / BIN_SIZE)),
];

const binKey = ([l, a, b]: BinCoords): number => (l << 12) | (a << 6) | b;

function heaviestBin(samples: readonly WeightedLab[]): BinCoords {
  const weightByBin = new Map<number, number>();
  for (const { lab, weight } of samples) {
    const key = binKey(binOf(lab));
    weightByBin.set(key, (weightByBin.get(key) ?? 0) + weight);
  }

  // Komşu kutuları da say: doku/gürültü yüzünden aynı renk iki kutuya bölünebilir.
  const neighbourhoodWeight = ([l, a, b]: BinCoords): number => {
    let total = 0;
    for (let dl = -1; dl <= 1; dl++) {
      for (let da = -1; da <= 1; da++) {
        for (let db = -1; db <= 1; db++) {
          if (l + dl < 0 || a + da < 0 || b + db < 0) continue;
          total += weightByBin.get(binKey([l + dl, a + da, b + db])) ?? 0;
        }
      }
    }
    return total;
  };

  let best: BinCoords = binOf((samples[0] as WeightedLab).lab);
  let bestWeight = -1;
  for (const key of weightByBin.keys()) {
    const coords: BinCoords = [(key >> 12) & 63, (key >> 6) & 63, key & 63];
    const weight = neighbourhoodWeight(coords);
    if (weight > bestWeight) {
      best = coords;
      bestWeight = weight;
    }
  }
  return best;
}

function seedFrom(samples: readonly WeightedLab[]): Lab {
  const [bl, ba, bb] = heaviestBin(samples);
  const nearby = samples.filter(({ lab }) => {
    const [l, a, b] = binOf(lab);
    return Math.abs(l - bl) <= 1 && Math.abs(a - ba) <= 1 && Math.abs(b - bb) <= 1;
  });
  return weightedMedianLab(nearby);
}

/**
 * Örneklerin en yoğun renk kümesinin merkezini bulur. Düz ortalama arka plan, gölge ve parlama
 * piksellerinden etkilenir; burada önce baskın küme bulunup yalnızca ona yakın pikseller medyanlanır.
 */
export function robustCenter(samples: readonly WeightedLab[]): Lab {
  if (samples.length === 0) {
    throw new Error('Renk merkezi için en az bir örnek gerekir');
  }

  let center = seedFrom(samples);
  for (let iteration = 0; iteration < MAX_ITERATIONS; iteration++) {
    const inliers = samples.filter(({ lab }) => deltaE76(lab, center) <= INLIER_RADIUS);
    if (inliers.length === 0) break;

    const next = weightedMedianLab(inliers);
    const moved = deltaE76(next, center);
    center = next;
    if (moved < CONVERGENCE) break;
  }
  return center;
}
