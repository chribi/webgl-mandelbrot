import { TestBed, inject } from '@angular/core/testing';

import { ColorSchemeService } from './color-scheme.service';

describe('ColorSchemeService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ColorSchemeService]
    });
  });

  it('should be created', inject([ColorSchemeService], (service: ColorSchemeService) => {
    expect(service).toBeTruthy();
  }));

  const isPowerOf2 = n => {
    let k = 1;
    while (k < n) {
      k = k * 2;
    }
    return n === k;
  };

  it('should define textureHeight, textureWidth to be a power of 2', inject([ColorSchemeService], service => {
    expect(isPowerOf2(service.textureHeight)).toBeTruthy();
    expect(isPowerOf2(service.textureWidth)).toBeTruthy();
  }));
});
