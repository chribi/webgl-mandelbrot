import { Component, OnInit, OnChanges, Input, SimpleChange } from '@angular/core';
import { MandelbrotRenderer } from './mandelbrot-renderer';
import { ViewControl } from './view-control';
import { ContinuousZoomControl } from './continuous-zoom-control';
import { Point2d } from '../webgl/point2d';
import { ColorSchemeService } from '../color-schemes/color-scheme.service';
import { WebglCompileService } from '../webgl/webgl-compile.service';

@Component({
  selector: 'app-mandelbrot-canvas',
  templateUrl: './mandelbrot-canvas.component.html',
  styleUrls: ['./mandelbrot-canvas.component.css']
})
export class MandelbrotCanvasComponent implements OnInit, OnChanges {
  @Input() maxIterations: number;
  @Input() continuousColoring: boolean;
  @Input() colorSchemeIndex: number;

  private renderer: MandelbrotRenderer;
  private zoomControl: ContinuousZoomControl;
  private canvas: HTMLCanvasElement;
  constructor(
    private colorSchemeService: ColorSchemeService,
    private compileService: WebglCompileService
  ) { }

  ngOnInit() {
    try {
      this.canvas = <HTMLCanvasElement> document.getElementById('glcanvas');
      const gl = this.canvas.getContext('webgl');
      if (!gl) {
          throw new Error('WebGL not supported');
      }
      this.renderer = new MandelbrotRenderer(gl, this.compileService, this.colorSchemeService);
      this.zoomControl = new ContinuousZoomControl(this.renderer);
      this.renderer.initGlProgram(this.maxIterations, this.continuousColoring, this.colorSchemeIndex);
      this.renderer.render();
    } catch (error) {
      console.log(error); // TODO show error in UI
    }
  }

  ngOnChanges(changes: { [prop: string]: SimpleChange }) {
    if (this.renderer !== undefined) {
      const needToRecompile = this.changed('maxIterations', changes) || this.changed('continuousColoring', changes);
      if (needToRecompile) {
        this.renderer.initGlProgram(this.maxIterations, this.continuousColoring, this.colorSchemeIndex);
      } else {
        this.renderer.setColorSchemeIndex(this.colorSchemeIndex);
      }
      this.renderer.render();
    }
  }

  // helper method to detect if some property has changed
  private changed(prop: string, changes: { [prop: string]: SimpleChange }): boolean {
    return changes[prop] && changes[prop].previousValue !== changes[prop].currentValue;
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
