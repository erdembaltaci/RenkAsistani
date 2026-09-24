/** sRGB, her kanal 0–255. */
export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** CIELAB, D65 beyaz noktası. */
export interface Lab {
  l: number;
  a: number;
  b: number;
}

/** Görselin sol üstüne göre 0–1 aralığında konum; çözünürlükten bağımsızdır. */
export interface Point {
  x: number;
  y: number;
}

/** `ImageData` bu şekle yapısal olarak uyar; domain tarayıcıyı bilmek zorunda kalmaz. */
export interface PixelBuffer {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface WeightedLab {
  lab: Lab;
  weight: number;
}

export interface NamedColor {
  name: string;
  hex: string;
}
