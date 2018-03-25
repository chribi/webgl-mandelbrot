import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { MandelbrotCanvasComponent } from './mandelbrot-canvas/mandelbrot-canvas.component';


@NgModule({
  declarations: [
    AppComponent,
    MandelbrotCanvasComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
