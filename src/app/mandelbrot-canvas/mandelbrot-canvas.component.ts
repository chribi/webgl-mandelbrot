import { Component, OnInit } from '@angular/core';
import { MandelbrotRenderer } from './mandelbrot-renderer';
import { ViewControl } from './view-control';
import { ContinuousZoomControl } from './continuous-zoom-control';

@Component({
  selector: 'app-mandelbrot-canvas',
  templateUrl: './mandelbrot-canvas.component.html',
  styleUrls: ['./mandelbrot-canvas.component.css']
})
export class MandelbrotCanvasComponent implements OnInit {

  private renderer: MandelbrotRenderer;
  private zoomControl: ContinuousZoomControl;
  constructor() { }

  ngOnInit() {
    try {
      const canvas = <HTMLCanvasElement> document.getElementById('glcanvas');
      const gl = canvas.getContext('webgl');
      if (!gl) {
          throw new Error('WebGL not supported');
      }
      this.renderer = new MandelbrotRenderer(gl);
      this.zoomControl = new ContinuousZoomControl(this.renderer);
      this.renderer.render();
    } catch (error) {
      console.log(error); // TODO show error in UI
    }
  }

  zoomIn(event: MouseEvent): void {
    if (!this.zoomControl.isZooming()) {
      let zoomIn: boolean;
      switch (event.button) {
        case 0: // left button
          zoomIn = true;
          break;
        case 2: // right button
          zoomIn = false;
          break;
        default: // other button
          return;
      }
      this.zoomControl.startZoom([event.clientX, event.clientY], zoomIn);
    }
  }

  moveZoomCenter(event: MouseEvent) {
    if (this.zoomControl.isZooming()) {
      this.zoomControl.setZoomCenter([event.clientX, event.clientY]);
    }
  }

  stopZoom(): void {
    this.zoomControl.stopZoom();
  }
}
