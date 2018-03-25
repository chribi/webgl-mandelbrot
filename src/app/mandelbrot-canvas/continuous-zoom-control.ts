import { MandelbrotRenderer } from './mandelbrot-renderer';

export class ContinuousZoomControl {
    private renderer: MandelbrotRenderer;
    private zoomSpeed: number;
    private fps: number;
    private timer: any;
    private zoomCenter: any;

    constructor(renderer) {
        this.renderer = renderer;
        this.zoomSpeed = 2;
        this.fps = 20;
        this.timer = null;
        this.zoomCenter = null;
    }

    startZoom(position, zoomIn) {
        console.log('Start zoom ' + (zoomIn ? 'in' : 'out'));
        this.setZoomCenter(position);
        let zoomPerFrame = Math.exp(Math.log(this.zoomSpeed) / this.fps);
        if (!zoomIn) {
            zoomPerFrame = 1 / zoomPerFrame;
        }

        const that = this;
        this.timer = setInterval(function() {
            that.renderer.viewControl.zoomInto(that.zoomCenter, zoomPerFrame);
            that.renderer.render();
        }, 1000 / this.fps);
    }

    setZoomCenter(position) {
        console.log(position);
        this.zoomCenter = position;
    }

    stopZoom() {
        if (this.isZooming()) {
            console.log('Stop zoom');
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    isZooming() {
        return this.timer != null;
    }
}
