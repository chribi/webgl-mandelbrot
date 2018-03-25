import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MandelbrotCanvasComponent } from './mandelbrot-canvas.component';

describe('MandelbrotCanvasComponent', () => {
  let component: MandelbrotCanvasComponent;
  let fixture: ComponentFixture<MandelbrotCanvasComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MandelbrotCanvasComponent ]
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
