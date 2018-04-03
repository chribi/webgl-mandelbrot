import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MandelbrotCanvasComponent } from './mandelbrot-canvas.component';
import { ColorSchemeService } from '../color-schemes/color-scheme.service';
import { WebglCompileService } from '../webgl/webgl-compile.service';

describe('MandelbrotCanvasComponent', () => {
  let component: MandelbrotCanvasComponent;
  let fixture: ComponentFixture<MandelbrotCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MandelbrotCanvasComponent ],
      providers: [ ColorSchemeService, WebglCompileService ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MandelbrotCanvasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
