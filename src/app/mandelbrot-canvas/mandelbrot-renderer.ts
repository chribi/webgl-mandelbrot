import { ViewControl } from './view-control';
import { ShaderSource } from '../webgl/shader-source';
import { WebglCompileService } from '../webgl/webgl-compile.service';
import { ColorSchemeService } from '../color-schemes/color-scheme.service';

export class MandelbrotRenderer {
    private glProgram: WebGLProgram;
    private canvasWidth: number;
    private canvasHeight: number;
    viewControl: ViewControl;
    private viewMatrixLoc: WebGLUniformLocation;
    private colorSchemeIndexLoc: WebGLUniformLocation;

    private readonly vertexShaderSource = new ShaderSource(`
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

    constructor(
        private gl: WebGLRenderingContext,
        private compileService: WebglCompileService,
        private colorSchemeService: ColorSchemeService
    ) {
        this.canvasWidth = gl.canvas.width;
        this.canvasHeight = gl.canvas.height;
        this.viewControl = new ViewControl(this.canvasWidth, this.canvasHeight);
    }

    initGlProgram(maxIterations: number, continuousColoring: boolean, colorSchemeIndex: number): void {
        if (this.glProgram !== undefined) {
            this.gl.deleteProgram(this.glProgram);
        }
        const startTime = Date.now();

        this.glProgram = this.compileService.compileProgram(this.gl, this.vertexShaderSource,
            this.fragmentShaderSource(maxIterations, continuousColoring));

        this.viewMatrixLoc = this.gl.getUniformLocation(this.glProgram, 'uViewMatrix');
        this.colorSchemeIndexLoc = this.gl.getUniformLocation(this.glProgram, 'colorSchemeIndex');
        const posAttribLoc = this.gl.getAttribLocation(this.glProgram, 'aScreenPosition');
        const textureLoc = this.gl.getUniformLocation(this.glProgram, 'texture');

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

        this.createAndLoadTexture();

        this.gl.viewport(0, 0, this.canvasWidth, this.canvasHeight);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.useProgram(this.glProgram);

        this.gl.enableVertexAttribArray(posAttribLoc);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, posBuffer);
        this.gl.vertexAttribPointer(posAttribLoc, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.uniform1i(textureLoc, 0);
        this.setColorSchemeIndex(colorSchemeIndex);

        const stopTime = Date.now();
        console.log('Reinitializing GLProgram: ' + (stopTime - startTime) + ' ms');
    }

    setColorSchemeIndex(index: number) {
        this.gl.uniform1f(this.colorSchemeIndexLoc, index);
    }

    render() {
        const viewMat = this.viewControl.getViewMatrix();
        this.gl.uniformMatrix3fv(this.viewMatrixLoc, false, viewMat);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    private createAndLoadTexture(): void {
        const texture = this.gl.createTexture();
        const textureData = this.colorSchemeService.textureData;
        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA,
            this.colorSchemeService.textureWidth, this.colorSchemeService.textureHeight, 0,
            this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureData);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
        this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT);
    }

    private fragmentShaderSource(maxIterations: number, continuousColoring: boolean): ShaderSource {
        const escapeRadius = continuousColoring ? 256 : 2;
        return new ShaderSource(`
            precision highp float;

            varying vec2 c;
            uniform sampler2D texture;

            uniform float colorSchemeIndex;

            const int maxIter = ${maxIterations};
            const float escapeRadius = float(${escapeRadius});

            vec4 pixelColor(int iterations) {
                if (iterations == -1) {
                    return vec4(0, 0, 0, 1.0);
                } else {
                    float r = float(iterations) / 64.0;
                    return texture2D(texture, vec2(r, colorSchemeIndex));
                }
            }

            vec4 pixelColorContinuous(int iterations, vec2 z) {
                if (iterations == -1) {
                    return vec4(0, 0, 0, 1.0);
                } else {
                    float nu = log2(log2(length(z)));
                    float contIterations = float(iterations) + 1.0 - nu;
                    float r = contIterations / 64.0;
                    return texture2D(texture, vec2(r, colorSchemeIndex));
                }
            }

            void main(void) {
                vec2 z = c;
                // next z
                vec2 zn = vec2(0.0, 0.0);
                // derivative of P_c^n, see
                // https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Interior_detection_methods
                vec2 deriv = vec2(1.0, 0.0);
                // next derivative
                vec2 derivn = vec2(0.0, 0.0);

                const float epsilon = 1e-9;
                int breakAt = -1;

                for (int iteration = 1; iteration < maxIter; iteration++) {
                    // zn = z*z + c
                    zn.x = z.x * z.x - z.y * z.y + c.x;
                    zn.y = 2.0 * z.x * z.y + c.y;

                    // derivn = 2 * deriv * z
                    derivn.x = 2.0 * (deriv.x * z.x - deriv.y * z.y);
                    derivn.y = 2.0 * (deriv.x * z.y + deriv.y * z.x);

                    if (length(zn) > escapeRadius) {
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
                gl_FragColor = ${continuousColoring ? 'pixelColorContinuous(breakAt, z)' : 'pixelColor(breakAt)'};
            }
        `);
    }
}
