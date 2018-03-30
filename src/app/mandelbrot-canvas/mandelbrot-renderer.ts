import { ViewControl } from './view-control';
import { ShaderSource } from './shader-source';

const vertexSrc = new ShaderSource(`
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
`);

const fragmentSrc = new ShaderSource(`
precision highp float;

varying vec2 c;

void main(void) {
    vec2 z = c;
    // next z
    vec2 zn = vec2(0.0, 0.0);
    // derivative of P_c^n, see
    // https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Interior_detection_methods
    vec2 deriv = vec2(1.0, 0.0);
    // next derivative
    vec2 derivn = vec2(0.0, 0.0);

    const int maxIter = 500;
    const float epsilon = 1e-9;
    int breakAt = -1;

    for (int iteration = 1; iteration < maxIter; iteration++) {
        // zn = z*z + c
        zn.x = z.x * z.x - z.y * z.y + c.x;
        zn.y = 2.0 * z.x * z.y + c.y;

        // derivn = 2 * deriv * z
        derivn.x = 2.0 * (deriv.x * z.x - deriv.y * z.y);
        derivn.y = 2.0 * (deriv.x * z.y + deriv.y * z.x);

        if (length(zn) > 2.0) {
            breakAt = iteration;
            break;
        }
        if (length(derivn) < epsilon) {
            // we are in the interior
            break;
        }
        z = zn;
        deriv = derivn;
    }
    if (breakAt == -1) {
        gl_FragColor = vec4(0, 0, 0, 1.0);
    } else {
        float r = float(breakAt) / float(maxIter);
        gl_FragColor = vec4(1.0 - r, 1.0 - r, 1, 1);
    }
}
`);

export class MandelbrotRenderer {
    private gl: WebGLRenderingContext;
    private glProgram: WebGLProgram;
    private canvasWidth: number;
    private canvasHeight: number;
    viewControl: ViewControl;
    private viewMatrixLoc: WebGLUniformLocation;

    constructor(glContext: WebGLRenderingContext) {
        this.gl = glContext;
        this.glProgram = this.compile(this.gl, vertexSrc, fragmentSrc);
        this.canvasWidth = glContext.canvas.width;
        this.canvasHeight = glContext.canvas.height;
        this.viewMatrixLoc = this.gl.getUniformLocation(this.glProgram, 'uViewMatrix');

        this.viewControl = new ViewControl(this.canvasWidth, this.canvasHeight);

        const gl = this.gl;
        const posAttrib = gl.getAttribLocation(this.glProgram, 'aScreenPosition');
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        // position data defining a rectangle filling the whole canvas
        const posData = [
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData), gl.STATIC_DRAW);

        gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(this.glProgram);

        gl.enableVertexAttribArray(posAttrib);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
    }

    render() {
        const viewMat = this.viewControl.getViewMatrix();
        this.gl.uniformMatrix3fv(this.viewMatrixLoc, false, viewMat);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    renderView(center, zoom) {
        this.viewControl.center = center;
        this.viewControl.zoom = zoom;
        this.render();
    }

    compile(gl: WebGLRenderingContext, vertexSource: ShaderSource, fragmentSource: ShaderSource): WebGLProgram {
        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertexSource);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);

        const program = gl.createProgram();

        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            return null;
        } else {
            return program;
        }
    }
    compileShader(gl: WebGLRenderingContext, type: number, source: ShaderSource): WebGLShader {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source.source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const msg = gl.getShaderInfoLog(shader);
            throw new Error(msg);
        } else {
            return shader;
        }
    }
}
