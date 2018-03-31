import { Injectable } from '@angular/core';
import { ShaderSource } from './shader-source';

@Injectable()
export class WebglCompileService {

  constructor() { }

  public compileProgram(gl: WebGLRenderingContext, vertex: ShaderSource,
      fragment: ShaderSource): WebGLProgram {
    const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vertex);
    const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fragment);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const msg = gl.getProgramInfoLog(program);
      throw new Error(msg);
    } else {
      return program;
    }
  }

  private compileShader(gl: WebGLRenderingContext, type: number,
      source: ShaderSource): WebGLShader {
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
