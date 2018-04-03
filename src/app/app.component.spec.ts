import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MandelbrotCanvasComponent } from './mandelbrot-canvas/mandelbrot-canvas.component';
import { RenderSettingsComponent } from './render-settings/render-settings.component';
import { FormsModule } from '@angular/forms';
import { ColorSchemeService } from './color-schemes/color-scheme.service';
import { WebglCompileService } from './webgl/webgl-compile.service';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent,
        MandelbrotCanvasComponent,
        RenderSettingsComponent
      ],
      imports: [
        FormsModule
      ],
      providers: [ ColorSchemeService, WebglCompileService ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
