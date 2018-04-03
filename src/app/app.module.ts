import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { MandelbrotCanvasComponent } from './mandelbrot-canvas/mandelbrot-canvas.component';
import { RenderSettingsComponent } from './render-settings/render-settings.component';

import { ColorSchemeService } from './color-schemes/color-scheme.service';
import { WebglCompileService } from './webgl/webgl-compile.service';


@NgModule({
  declarations: [
    AppComponent,
    MandelbrotCanvasComponent,
    RenderSettingsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [ ColorSchemeService, WebglCompileService ],
  bootstrap: [AppComponent]
})
export class AppModule { }
