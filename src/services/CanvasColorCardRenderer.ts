import type { ColorCard, ColorCardRenderer } from './ColorCardRenderer';

const WIDTH = 1080;
const HEIGHT = 1350;
const MARGIN = 60;
const INNER = 36;
const FONT = '"Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif';

const INK = '#111113';
const SOFT = '#6a6a70';
const PAPER = '#f4f4f5';

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function fitFontSize(ctx: CanvasRenderingContext2D, text: string, weight: number, start: number, maxWidth: number, min: number): number {
  let size = start;
  ctx.font = `${weight} ${size}px ${FONT}`;
  while (size > min && ctx.measureText(text).width > maxWidth) {
    size -= 4;
    ctx.font = `${weight} ${size}px ${FONT}`;
  }
  return size;
}

/** Sözcük sınırlarında satırlara böler; satır sonları ve çok uzun sözcükler korunur. */
function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    let current = '';
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    lines.push(current);
  }
  const visible = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    visible[maxLines - 1] = `${visible[maxLines - 1] ?? ''}…`;
  }
  return visible;
}

function dataUrlToFile(dataUrl: string, name: string): File {
  const binary = atob(dataUrl.split(',')[1] ?? '');
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return new File([bytes], name, { type: 'image/png' });
}

export class CanvasColorCardRenderer implements ColorCardRenderer {
  render({ name, hex, tone, note }: ColorCard): File | null {
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const cardX = MARGIN;
    const cardW = WIDTH - MARGIN * 2;
    const contentX = cardX + INNER;
    const contentW = cardW - INNER * 2;

    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.shadowColor = 'rgba(17, 17, 19, 0.10)';
    ctx.shadowBlur = 48;
    ctx.shadowOffsetY = 16;
    ctx.fillStyle = '#ffffff';
    roundedRect(ctx, cardX, MARGIN, cardW, HEIGHT - MARGIN * 2, 56);
    ctx.fill();
    ctx.restore();

    const blockY = MARGIN + INNER;
    const blockH = 560;
    ctx.fillStyle = hex;
    roundedRect(ctx, contentX, blockY, contentW, blockH, 40);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = INK;
    const nameSize = fitFontSize(ctx, name, 700, 92, contentW, 48);
    const nameY = blockY + blockH + 112;
    ctx.fillText(name, contentX, nameY);

    ctx.font = `500 42px ${FONT}`;
    ctx.fillStyle = SOFT;
    ctx.fillText(tone, contentX, nameY + Math.max(72, nameSize * 0.78));

    const pillY = nameY + 128;
    ctx.fillStyle = PAPER;
    roundedRect(ctx, contentX, pillY, contentW, 104, 32);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.font = `700 52px ${FONT}`;
    ctx.textBaseline = 'middle';
    ctx.fillText(hex, contentX + 36, pillY + 54);
    ctx.textBaseline = 'alphabetic';

    if (note) {
      ctx.font = `500 40px ${FONT}`;
      ctx.fillStyle = INK;
      wrapLines(ctx, note, contentW, 3).forEach((line, index) => {
        ctx.fillText(line, contentX, pillY + 104 + 76 + index * 54);
      });
    }

    ctx.font = `500 26px ${FONT}`;
    ctx.fillStyle = '#9a9aa0';
    ctx.textAlign = 'center';
    ctx.fillText('Renk Asistanı · tahmini renk', WIDTH / 2, HEIGHT - MARGIN - 28);

    return dataUrlToFile(canvas.toDataURL('image/png'), `renk-${hex.replace('#', '').toLowerCase()}.png`);
  }
}
