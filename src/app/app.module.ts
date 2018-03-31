import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';


import { AppComponent } from './app.component';
import { MandelbrotCanvasComponent } from './mandelbrot-canvas/mandelbrot-canvas.component';
import { RenderSettingsComponent } from './render-settings/render-settings.component';


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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
