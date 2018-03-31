import { ViewControl } from './view-control';
import { ShaderSource } from '../webgl/shader-source';
import { WebglCompileService } from '../webgl/webgl-compile.service';

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

function fragmentSrc(maxIterations: number): ShaderSource {
    return new ShaderSource(`
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

            const int maxIter = ${maxIterations};
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
}

export class MandelbrotRenderer {
    private gl: WebGLRenderingContext;
    private glProgram: WebGLProgram;
    private canvasWidth: number;
    private canvasHeight: number;
    viewControl: ViewControl;
    private viewMatrixLoc: WebGLUniformLocation;

    constructor(glContext: WebGLRenderingContext) {
        this.gl = glContext;
        this.canvasWidth = glContext.canvas.width;
        this.canvasHeight = glContext.canvas.height;
        this.viewControl = new ViewControl(this.canvasWidth, this.canvasHeight);
    }

    initGlProgram(maxIterations: number): void {
        if (this.glProgram !== undefined) {
            this.gl.deleteProgram(this.glProgram);
        }

        this.glProgram = new WebglCompileService().compileProgram(this.gl, vertexSrc, fragmentSrc(maxIterations));
        this.viewMatrixLoc = this.gl.getUniformLocation(this.glProgram, 'uViewMatrix');

        const posAttrib = this.gl.getAttribLocation(this.glProgram, 'aScreenPosition');
        const posBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        // position data defining a rectangle filling the whole canvas
        const posData = [
            -1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0
        ];
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(posData), this.gl.STATIC_DRAW);

        this.gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.glProgram);

        this.gl.enableVertexAttribArray(posAttrib);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.vertexAttribPointer(posAttrib, 2, this.gl.FLOAT, false, 0, 0);
    }

    render() {
        const viewMat = this.viewControl.getViewMatrix();
        this.gl.uniformMatrix3fv(this.viewMatrixLoc, false, viewMat);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }
}
