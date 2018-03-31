import { TestBed, inject } from '@angular/core/testing';

import { WebglCompileService } from './webgl-compile.service';

describe('WebglCompileService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [WebglCompileService]
    });
  });

  it('should be created', inject([WebglCompileService], (service: WebglCompileService) => {
    expect(service).toBeTruthy();
  }));
});
