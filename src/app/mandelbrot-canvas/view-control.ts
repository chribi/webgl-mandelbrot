import { Point2d } from '../webgl/point2d';

export class ViewControl {
    private canvasWidth: number;
    private canvasHeight: number;
    private aspectRatio: number;
    center: Point2d;
    zoom: number;

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.aspectRatio = width / height;
        this.center = new Point2d(0, 0);
        this.zoom = 1;
    }

    zoomInto(canvasPoint: Point2d, zoomFactor: number): void {
        const { x, y } = this.canvasToComplex(canvasPoint);
        const { x: cx, y: cy } = this.center;
        this.zoom = this.zoom * zoomFactor;
        this.center = new Point2d(
            x + (cx - x) / zoomFactor,
            y + (cy - y) / zoomFactor
        );
    }

    // convert canvas coordinates to complex coordinates
    canvasToComplex(canvasPoint: Point2d): Point2d {
        const {x: dx, y: dy} = this.canvasToDevice(canvasPoint);
        const [fx, fy] = this.getScaling();
        return new Point2d(dx * fx + this.center.x, dy * fy + this.center.y);
    }

    // convert canvas coordinates to device coordinates
    canvasToDevice(canvasPoint: Point2d): Point2d {
        const {x: cx, y: cy} = canvasPoint;
        const [ex, ey] = [ this.canvasWidth / 2, this.canvasHeight / 2 ];
        return new Point2d((cx - ex) / ex, (ey - cy) / ey);
    }

    getScaling() {
        const f = 1 / this.zoom;
        return [ f * this.aspectRatio, f ];
    }

    // returns matrix that transforms device coordinates to
    // complex coordinates.  The matrix is in column-major order.
    getViewMatrix() {
        const [fx, fy] = this.getScaling();
        const { x: cx, y: cy } = this.center;
        return [
            fx, 0, 0,
            0, fy, 0,
            cx, cy, 1
        ];
    }
}
