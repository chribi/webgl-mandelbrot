import { Component, OnInit, OnChanges, Input } from '@angular/core';
import { MandelbrotRenderer } from './mandelbrot-renderer';
import { ViewControl } from './view-control';
import { ContinuousZoomControl } from './continuous-zoom-control';
import { Point2d } from '../webgl/point2d';

@Component({
  selector: 'app-mandelbrot-canvas',
  templateUrl: './mandelbrot-canvas.component.html',
  styleUrls: ['./mandelbrot-canvas.component.css']
})
export class MandelbrotCanvasComponent implements OnInit, OnChanges {
  @Input() maxIterations: number;

  private renderer: MandelbrotRenderer;
  private zoomControl: ContinuousZoomControl;
  private canvas: HTMLCanvasElement;
  constructor() { }

  ngOnInit() {
    try {
      this.canvas = <HTMLCanvasElement> document.getElementById('glcanvas');
      const gl = this.canvas.getContext('webgl');
      if (!gl) {
          throw new Error('WebGL not supported');
      }
      this.renderer = new MandelbrotRenderer(gl);
      this.zoomControl = new ContinuousZoomControl(this.renderer);
      this.ngOnChanges();
    } catch (error) {
      console.log(error); // TODO show error in UI
    }
  }

  ngOnChanges() {
    if (this.renderer !== undefined) {
      this.renderer.initGlProgram(this.maxIterations);
      this.renderer.render();
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
      this.zoomControl.startZoom(this.getCanvasCoordinates(event), zoomIn);
    }
  }

  moveZoomCenter(event: MouseEvent): void {
    if (this.zoomControl.isZooming()) {
      this.zoomControl.setZoomCenter(this.getCanvasCoordinates(event));
    }
  }

  stopZoom(): void {
    this.zoomControl.stopZoom();
  }

  private getCanvasCoordinates(event: MouseEvent): Point2d {
    // https://stackoverflow.com/a/18053642
    const rect = this.canvas.getBoundingClientRect();
    return new Point2d(event.clientX - rect.left, event.clientY - rect.top);
  }
}
