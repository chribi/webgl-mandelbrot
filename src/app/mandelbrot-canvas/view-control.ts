export class ViewControl {
    private canvasWidth: number;
    private canvasHeight: number;
    private aspectRatio: number;
    center: number[];
    zoom: number;

    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.aspectRatio = width / height;
        this.center = [0, 0];
        this.zoom = 1;
    }

    zoomInto(canvasPoint, zoomFactor) {
        const [x, y] = this.canvasToComplex(canvasPoint);
        const [cx, cy] = this.center;
        this.zoom = this.zoom * zoomFactor;
        this.center = [
            x + (cx - x) / zoomFactor,
            y + (cy - y) / zoomFactor
        ];
    }

    // convert canvas coordinates to complex coordinates
    canvasToComplex(canvasPoint) {
        const [dx, dy] = this.canvasToDevice(canvasPoint);
        const [fx, fy] = this.getScaling();
        return [dx * fx + this.center[0], dy * fy + this.center[1]];
    }

    // convert canvas coordinates to device coordinates
    canvasToDevice(canvasPoint) {
        const [cx, cy] = canvasPoint;
        const [ex, ey] = [ this.canvasWidth / 2, this.canvasHeight / 2 ];
        return [ (cx - ex) / ex, (ey - cy) / ey ];
    }

    getScaling() {
        const f = 1 / this.zoom;
        return [ f * this.aspectRatio, f ];
    }

    // returns matrix that transforms device coordinates to
    // complex coordinates.  The matrix is in column-major order.
    getViewMatrix() {
        const [fx, fy] = this.getScaling();
        const [cx, cy] = this.center;
        return [
            fx, 0, 0,
            0, fy, 0,
            cx, cy, 1
        ];
    }
}
