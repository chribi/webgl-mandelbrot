import { Injectable } from '@angular/core';
import { Color } from './color';
import { ColorScheme } from './color-scheme';

@Injectable()
export class ColorSchemeService {
  private readonly colorSchemes: ColorScheme[] = [
    ColorScheme.cubicInterpolation('blue', [
      { position: 0, color: new Color(255, 255, 255) },
      { position: 1, color: new Color(0, 0, 255) }
    ]),
    ColorScheme.cubicInterpolation('red', [
      { position: 0, color: new Color(255, 255, 255) },
      { position: 1, color: new Color(255, 0, 0) }
    ]),
    // https://stackoverflow.com/questions/16500656/which-color-gradient-is-used-to-color-mandelbrot-in-wikipedia
    ColorScheme.cubicInterpolation('wiki', [
      { position: 0.0,    color: new Color(0,   7,   100) },
      { position: 0.16,   color: new Color(32,  107, 203) },
      { position: 0.42,   color: new Color(237, 255, 255) },
      { position: 0.6425, color: new Color(255, 170, 0) },
      { position: 0.8575, color: new Color(0,   2,   0) },
      { position: 0.8575, color: new Color(0,   2,   0) },
      { position: 1.0,    color: new Color(0,   7,   100) },
    ])
  ];
  readonly textureData: Uint8Array;
  readonly textureHeight;
  readonly textureWidth = 32;

  constructor() {
    let n = 1;
    // find power of two large enough to hold all color schemes
    while (n < this.colorSchemes.length) {
      n = n * 2;
    }
    this.textureHeight = n;
    this.textureData = ColorSchemeService.buildTextureData(this.colorSchemes, this.textureHeight, this.textureWidth);
  }

  private static buildTextureData(colorSchemes: ColorScheme[], width: number, height: number): Uint8Array {
    const data = Array(width * height * 3).fill(0);
    const dx = 1.0 / width;
    for (let schemeIndex = 0; schemeIndex < colorSchemes.length; schemeIndex++) {
      const colorScheme = colorSchemes[schemeIndex];
      for (let col = 0; col < width; col++) {
        const i = (schemeIndex * width + col) * 3;
        const x = (i + 0.5) * dx;
        const color = colorScheme.coloring(x);
        data[i + 0] = color.r;
        data[i + 1] = color.g;
        data[i + 2] = color.b;
      }
    }
    return new Uint8Array(data);
  }

}
