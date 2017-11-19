function main() {
    var canvas = document.getElementById("glcanvas");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    var vertexSrc = document.getElementById("vertex-src").text;
    var fragmentSrc = document.getElementById("fragment-src").text;
    var p = compile(gl, vertexSrc, fragmentSrc);

    var posAttrib = gl.getAttribLocation(p, "aScreenPosition");
    var coordAttrib = gl.getAttribLocation(p, "aCoordinate");
    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    var posData = [
        -1.0, -1.0,
        -1.0, 1.0,
        1.0, -1.0,
        1.0, 1.0
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(posData), gl.STATIC_DRAW);

    var coordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
    var coordData = [
        -1.6, -0.9,
        -1.6, 0.9,
        0.8, -0.9,
        0.8, 0.9
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coordData), gl.STATIC_DRAW);

    gl.viewport(0, 0, gl.canvas.width,  gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(p);

    gl.enableVertexAttribArray(posAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(coordAttrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, coordBuffer);
    gl.vertexAttribPointer(coordAttrib, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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
