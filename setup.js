const vertexSrc = `
attribute vec2 aScreenPosition;

// matrix specifying the part of the
// mandelbrot set rendered
uniform mat3 uViewMatrix;

// position of pixel in the mandelbrot set
varying vec2 c;

void main(void) {
    gl_Position = vec4(aScreenPosition, 0, 1);
    // homogenous c
    vec3 ch = uViewMatrix * vec3(aScreenPosition, 1);
    c = ch.xy / ch.z;
}
`

const fragmentSrc = `
precision mediump float;

varying vec2 c;

void main(void) {
    vec2 z = vec2(0.0, 0.0);
    vec2 zn = vec2(0.0, 0.0);

    const int maxIter = 200;
    int breakAt = -1;

    for (int iteration = 0; iteration < maxIter; iteration++) {
        zn.x = z.x * z.x - z.y * z.y + c.x;
        zn.y = 2.0 * z.x * z.y + c.y;
        if (length(zn) > 2.0) {
            breakAt = iteration;
            break;
        }
        z = zn;
    }
    if (breakAt == -1) {
        gl_FragColor = vec4(0, 0, 0, 1.0);
    } else {
        float r = float(breakAt) / float(maxIter);
        gl_FragColor = vec4(1.0 - r, 1.0 - r, 1, 1);
    }
}
`

class MandelbrotRenderer {
    constructor(glContext) {
        this.gl = glContext;
        this.glProgram = compile(this.gl, vertexSrc, fragmentSrc);
        this.canvasWidth = glContext.canvas.width;
        this.canvasHeight = glContext.canvas.height;
        this.viewMatrixLoc = this.gl.getUniformLocation(this.glProgram, "uViewMatrix");

        this.viewControl = new ViewControl(this.canvasWidth, this.canvasHeight);

        var gl = this.gl;
        var posAttrib = gl.getAttribLocation(this.glProgram, "aScreenPosition");
        var posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        // position data defining a rectangle filling the whole canvas
        var posData = [
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ]
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData), gl.STATIC_DRAW);

        gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.glProgram);

        gl.enableVertexAttribArray(posAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
    }

    render() {
        var viewMat = this.viewControl.getViewMatrix();
        this.gl.uniformMatrix3fv(this.viewMatrixLoc, false, viewMat);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    renderView(center, zoom) {
        this.viewControl.center = center;
        this.viewControl.zoom = zoom;
        this.render();
    }
}

class ViewControl {
    constructor(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
        this.aspectRatio = width / height;
        this.center = [0, 0];
        this.zoom = 1;
    }

    zoomInto(canvasPoint, zoomFactor) {
        let [x, y] = this.canvasToComplex(canvasPoint);
        let [cx, cy] = this.center;
        this.zoom = this.zoom * zoomFactor;
        this.center = [
            x + (cx - x) / zoomFactor,
            y + (cy - y) / zoomFactor
        ];
    }

    // convert canvas coordinates to complex coordinates
    canvasToComplex(canvasPoint) {
        let [dx, dy] = this.canvasToDevice(canvasPoint);
        let [fx, fy] = this.getScaling();
        return [dx * fx + this.center[0], dy * fy + this.center[1]];
    }

    // convert canvas coordinates to device coordinates
    canvasToDevice(canvasPoint) {
        let [cx, cy] = canvasPoint;
        let [ex, ey] = [ this.canvasWidth / 2, this.canvasHeight / 2 ];
        return [ (cx - ex) / ex, (ey - cy) / ey ];
    }

    getScaling() {
        let f = 1 / this.zoom;
        return [ f * this.aspectRatio, f ]
    }

    // returns matrix that transforms device coordinates to
    // complex coordinates.  The matrix is in column-major order.
    getViewMatrix() {
        let [fx, fy] = this.getScaling();
        let [cx, cy] = this.center;
        return [
            fx, 0, 0,
            0, fy, 0,
            cx, cy, 1
        ];
    }
}

class ContinousZoomControl {
    constructor(renderer) {
        this.renderer = renderer;
        this.zoomSpeed = 2;
        this.fps = 20;
        this.timer = null;
        this.zoomCenter = null;
    }

    startZoom(position) {
        console.log("Start zoom");
        this.setZoomCenter(position);
        var zoomPerFrame = Math.exp(Math.log(this.zoomSpeed) / this.fps);
        var this_ = this;
        this.timer = setInterval(function() {
            renderer.viewControl.zoomInto(this_.zoomCenter, zoomPerFrame);
            renderer.render();
        }, 1000 / this.fps);
    }

    setZoomCenter(position) {
        console.log(position);
        this.zoomCenter = position;
    }

    stopZoom() {
        if (this.isZooming()) {
            console.log("Stop zoom");
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    isZooming() {
        return this.timer != null;
    }
}

var renderer = null;
var zoomControl = null;

$(document).ready(function() {
    main();
    $("#glcanvas").on({
        mousedown: function(event) {
            zoomControl.startZoom([event.clientX, event.clientY]);
        },
        mouseout: function(event) {
            zoomControl.stopZoom();
        },
        mousemove: function(event) {
            if (zoomControl.isZooming()) {
                zoomControl.setZoomCenter([event.clientX, event.clientY]);
            }
        },
        mouseup: function(event) {
            zoomControl.stopZoom();
        }
    });
});

function main() {
    var canvas = document.getElementById("glcanvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }
    renderer = new MandelbrotRenderer(gl);
    zoomControl = new ContinousZoomControl(renderer);
    renderer.render();
}

function compile(gl, vertexSrc, fragmentSrc) {
    var vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc);
    var fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);

    var program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return null;
    } else {
        return program;
    }
}

function compileShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return null;
    } else {
        return shader;
    }
}
