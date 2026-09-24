import type { Rgb } from './types';

const HEX_PATTERN = /^#[0-9a-f]{6}$/i;

const toHexByte = (channel: number): string =>
  Math.round(Math.min(255, Math.max(0, channel)))
    .toString(16)
    .padStart(2, '0');

export function isValidHex(value: string): boolean {
  return HEX_PATTERN.test(value);
}

export function rgbToHex({ r, g, b }: Rgb): string {
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): Rgb {
  if (!isValidHex(hex)) {
    throw new Error(`Geçersiz hex renk: ${hex}`);
  }
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}
