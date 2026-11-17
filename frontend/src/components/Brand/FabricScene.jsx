import { useEffect, useRef } from 'react';

// Tejido técnico de punto (rib knit) que ondea como una camiseta al viento.
// WebGL2 directo (sin three.js): la misma geometría, cámara y shader, sin ~130 KB de librería.
// Ondas en el vértice, costillas de punto y una franja tartán en el fragmento.

const VERTEX = `#version 300 es
in vec3 position;
in vec2 uv;
uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform vec2 uPointer;
uniform float uPull;
out vec2 vUv;
out float vH;
out vec3 vPos;

void main() {
  vUv = uv;
  vec3 p = position;
  float w = sin(p.x * 0.85 + uTime * 0.9) * 0.32
          + sin(p.y * 1.25 - uTime * 0.65 + p.x * 0.45) * 0.24
          + sin((p.x + p.y) * 2.2 + uTime * 1.35) * 0.07;
  // El cursor levanta la tela como un dedo bajo el jersey
  float d = distance(uv, uPointer);
  float bump = exp(-d * d * 26.0) * uPull;
  p.z += w + bump * 0.85;
  vH = p.z;
  vec4 world = modelMatrix * vec4(p, 1.0);
  vPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}`;

const FRAGMENT = `#version 300 es
precision highp float;
uniform vec3 uDeep;
uniform vec3 uBlue;
uniform vec3 uElectric;
uniform vec3 uTartan;
in vec2 vUv;
in float vH;
in vec3 vPos;
out vec4 outColor;

void main() {
  vec3 n = normalize(cross(dFdx(vPos), dFdy(vPos)));
  float light = clamp(dot(n, normalize(vec3(-0.35, 0.55, 0.85))) * 0.5 + 0.5, 0.0, 1.0);

  // Costillas del punto: columnas finas en relieve
  float rib = abs(fract(vUv.x * 96.0) - 0.5) * 2.0;
  float ribShade = smoothstep(0.55, 1.0, rib);

  vec3 col = mix(uDeep * 1.6, uBlue * 1.15, pow(light, 1.15));
  col = mix(col, col * 0.7, ribShade * 0.55);

  // Brillo eléctrico en las crestas de la ola
  float crest = smoothstep(0.25, 0.75, vH);
  col = mix(col, uElectric, crest * 0.5 * light);

  // Franja tartán, como la línea de una pista o el vivo de una prenda
  float band = abs(vUv.y - 0.34 - sin(vUv.x * 3.1) * 0.018);
  float stripe = 1.0 - smoothstep(0.010, 0.016, band);
  col = mix(col, uTartan, stripe * 0.92);

  // Bordes que se funden con el fondo del encabezado
  float alpha = smoothstep(0.0, 0.22, vUv.x) * smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.82, vUv.y);
  outColor = vec4(col, alpha);
}`;

// ---- Matrices 4×4 (orden por columnas, como las espera WebGL) ----
const mul = (a, b) => {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
};
const translate = (x, y, z) => new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
const rotX = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); };
const rotY = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); };
const rotZ = (a) => { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); };
const perspective = (fovDeg, aspect, near, far) => {
    const f = 1 / Math.tan((fovDeg * Math.PI) / 360);
    return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0]);
};
// Misma pose que tenía la malla: posición (1.4, -0.1, 0) y rotación de Euler XYZ (-0.9, 0.18, -0.36)
const MODEL = mul(translate(1.4, -0.1, 0), mul(rotX(-0.9), mul(rotY(0.18), rotZ(-0.36))));
const VIEW = translate(0, 0, -5);

// Colores de marca en espacio lineal (el shader escribe el valor tal cual, como antes)
const linear = (hex) => [1, 3, 5].map(i => { const c = parseInt(hex.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });

// Plano subdividido de 9 × 5.6 con 160 × 100 segmentos (mismo trazado de uv que un PlaneGeometry)
const buildPlane = (width = 9, height = 5.6, gx = 160, gy = 100) => {
    const pos = new Float32Array((gx + 1) * (gy + 1) * 3);
    const uv = new Float32Array((gx + 1) * (gy + 1) * 2);
    let p = 0, u = 0;
    for (let iy = 0; iy <= gy; iy++) {
        const y = iy * (height / gy) - height / 2;
        for (let ix = 0; ix <= gx; ix++) {
            pos[p++] = ix * (width / gx) - width / 2; pos[p++] = -y; pos[p++] = 0;
            uv[u++] = ix / gx; uv[u++] = 1 - iy / gy;
        }
    }
    const idx = new Uint16Array(gx * gy * 6);
    let k = 0;
    for (let iy = 0; iy < gy; iy++) for (let ix = 0; ix < gx; ix++) {
        const a = ix + (gx + 1) * iy, b = ix + (gx + 1) * (iy + 1), c = ix + 1 + (gx + 1) * (iy + 1), d = ix + 1 + (gx + 1) * iy;
        idx[k++] = a; idx[k++] = b; idx[k++] = d; idx[k++] = b; idx[k++] = c; idx[k++] = d;
    }
    return { pos, uv, idx };
};

const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) || 'shader');
    return shader;
};

/**
 * Escena 3D del encabezado. `pointer` es una ref { x, y, active } en coordenadas de la tela (0–1).
 * `still`: un solo cuadro sin animación (reducir movimiento o pausa). `paused`: fuera de pantalla.
 * Sin animación activa no hay ciclo de requestAnimationFrame; al desmontar se libera el contexto WebGL.
 */
export default function FabricScene({ pointer, still = false, paused = false }) {
    const host = useRef(null);
    const api = useRef(null);

    useEffect(() => {
        const el = host.current;
        if (!el) return undefined;
        const canvas = document.createElement('canvas');
        canvas.setAttribute('aria-hidden', 'true');
        Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%' });
        const gl = canvas.getContext('webgl2', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' });
        if (!gl) return undefined;
        el.appendChild(canvas);

        const program = gl.createProgram();
        const vs = compile(gl, gl.VERTEX_SHADER, VERTEX);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        gl.useProgram(program);

        const { pos, uv, idx } = buildPlane();
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        const buffers = [pos, uv].map((data, i) => {
            const buf = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, buf);
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
            const at = gl.getAttribLocation(program, i === 0 ? 'position' : 'uv');
            gl.enableVertexAttribArray(at);
            gl.vertexAttribPointer(at, i === 0 ? 3 : 2, gl.FLOAT, false, 0, 0);
            return buf;
        });
        const ibo = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);

        const U = (name) => gl.getUniformLocation(program, name);
        const loc = { proj: U('projectionMatrix'), time: U('uTime'), pointer: U('uPointer'), pull: U('uPull') };
        gl.uniformMatrix4fv(U('modelMatrix'), false, MODEL);
        gl.uniformMatrix4fv(U('viewMatrix'), false, VIEW);
        gl.uniform3fv(U('uDeep'), linear('#0a1630'));
        gl.uniform3fv(U('uBlue'), linear('#0e71af'));
        gl.uniform3fv(U('uElectric'), linear('#2ec5ff'));
        gl.uniform3fv(U('uTartan'), linear('#e4572e'));
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.BLEND);
        gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);

        const state = { time: 2.4, px: 0.7, py: 0.55, pull: 0, frame: 0, last: 0 };
        const draw = () => {
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.uniform1f(loc.time, state.time);
            gl.uniform2f(loc.pointer, state.px, state.py);
            gl.uniform1f(loc.pull, state.pull);
            gl.drawElements(gl.TRIANGLES, idx.length, gl.UNSIGNED_SHORT, 0);
        };
        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
            const w = Math.round(el.clientWidth * dpr), h = Math.round(el.clientHeight * dpr);
            if (!w || !h) return;
            canvas.width = w; canvas.height = h;
            gl.viewport(0, 0, w, h);
            gl.uniformMatrix4fv(loc.proj, false, perspective(38, w / h, 0.1, 50));
            draw();
        };
        const tick = (now) => {
            state.frame = requestAnimationFrame(tick);
            const delta = Math.min((now - (state.last || now)) / 1000, 0.05);
            state.last = now;
            state.time += delta;
            // El cursor se sigue con suavidad (sin saltos)
            const target = pointer.current;
            state.px += (target.x - state.px) * 0.08;
            state.py += (target.y - state.py) * 0.08;
            state.pull += ((target.active ? 1 : 0) - state.pull) * 0.06;
            draw();
        };
        const start = () => { if (!state.frame) { state.last = 0; state.frame = requestAnimationFrame(tick); } };
        const stop = () => { cancelAnimationFrame(state.frame); state.frame = 0; };
        api.current = { start, stop, draw };

        const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null;
        ro?.observe(el);
        resize();

        return () => {
            stop();
            api.current = null;
            ro?.disconnect();
            buffers.forEach(b => gl.deleteBuffer(b));
            gl.deleteBuffer(ibo);
            gl.deleteVertexArray(vao);
            gl.deleteShader(vs);
            gl.deleteShader(fs);
            gl.deleteProgram(program);
            gl.getExtension('WEBGL_lose_context')?.loseContext();
            canvas.remove();
        };
    }, [pointer]);

    // Animar solo cuando se ve y está permitido; si no, el ciclo se detiene por completo
    useEffect(() => {
        const a = api.current;
        if (!a) return;
        if (still || paused) { a.stop(); a.draw(); } else a.start();
    }, [still, paused]);

    return <div ref={host} aria-hidden="true" style={{ position: 'absolute', inset: 0 }} />;
}
