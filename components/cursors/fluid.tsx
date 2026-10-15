"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Every pass draws one quad over its target; each pixel also gets its neighbours one sim cell away. */
const VERTEX = `#version 300 es
in vec2 corner;
uniform vec2 texel;
out vec2 vUv, vL, vR, vT, vB;
void main() {
  vUv = corner * 0.5 + 0.5;
  vL = vUv - vec2(texel.x, 0.0);
  vR = vUv + vec2(texel.x, 0.0);
  vT = vUv + vec2(0.0, texel.y);
  vB = vUv - vec2(0.0, texel.y);
  gl_Position = vec4(corner, 0.0, 1.0);
}`;
const HEAD = `#version 300 es
precision highp float;
precision highp sampler2D;
in vec2 vUv, vL, vR, vT, vB;
out vec4 color;
`;
/** The passes: velocity is in sim cells a second, dye is plain color, and the canvas shows dye as see-through ink whose thin haze drops away. */
const SHADERS = {
  splat: `uniform sampler2D target; uniform vec2 point; uniform vec3 value; uniform float aspect, radius;
void main() {
  vec2 d = vUv - point;
  d.x *= aspect;
  color = vec4(texture(target, vUv).xyz + exp(-dot(d, d) / radius) * value, 1.0);
}`,
  advect: `uniform sampler2D velocity, source; uniform vec2 texel; uniform float dt, fade;
void main() {
  color = texture(source, vUv - dt * texture(velocity, vUv).xy * texel) / (1.0 + fade * dt);
}`,
  curl: `uniform sampler2D velocity;
void main() {
  color = vec4(0.5 * (texture(velocity, vR).y - texture(velocity, vL).y - texture(velocity, vT).x + texture(velocity, vB).x), 0.0, 0.0, 1.0);
}`,
  vorticity: `uniform sampler2D velocity, curl; uniform float dt;
void main() {
  vec2 force = 0.5 * vec2(abs(texture(curl, vT).x) - abs(texture(curl, vB).x), abs(texture(curl, vR).x) - abs(texture(curl, vL).x));
  force *= 30.0 * texture(curl, vUv).x / (length(force) + 0.0001) * vec2(1.0, -1.0);
  color = vec4(clamp(texture(velocity, vUv).xy + force * dt, -1000.0, 1000.0), 0.0, 1.0);
}`,
  divergence: `uniform sampler2D velocity;
void main() {
  vec2 c = texture(velocity, vUv).xy;
  float l = vL.x < 0.0 ? -c.x : texture(velocity, vL).x;
  float r = vR.x > 1.0 ? -c.x : texture(velocity, vR).x;
  float t = vT.y > 1.0 ? -c.y : texture(velocity, vT).y;
  float b = vB.y < 0.0 ? -c.y : texture(velocity, vB).y;
  color = vec4(0.5 * (r - l + t - b), 0.0, 0.0, 1.0);
}`,
  fade: `uniform sampler2D source; uniform float value;
void main() {
  color = value * texture(source, vUv);
}`,
  pressure: `uniform sampler2D pressure, divergence;
void main() {
  float sum = texture(pressure, vL).x + texture(pressure, vR).x + texture(pressure, vT).x + texture(pressure, vB).x;
  color = vec4(0.25 * (sum - texture(divergence, vUv).x), 0.0, 0.0, 1.0);
}`,
  gradient: `uniform sampler2D pressure, velocity;
void main() {
  vec2 g = vec2(texture(pressure, vR).x - texture(pressure, vL).x, texture(pressure, vT).x - texture(pressure, vB).x);
  color = vec4(texture(velocity, vUv).xy - g, 0.0, 1.0);
}`,
  display: `uniform sampler2D source;
void main() {
  vec3 c = min(texture(source, vUv).rgb, 1.0);
  float m = max(c.r, max(c.g, c.b));
  float a = pow(m, 1.6);
  color = vec4(c / max(m, 0.0001) * a, a);
}`,
};
type Pass = keyof typeof SHADERS;
type Target = { texture: WebGLTexture; fbo: WebGLFramebuffer; w: number; h: number };
type Uniforms = Record<string, number | number[] | Target>;

/** A fully saturated color at hue `h` (0 to 1, wrapping), scaled to `k`. */
const rgb = (h: number, k: number) =>
  [5, 3, 1].map((n) => {
    const at = (n + (h % 1) * 6) % 6;
    return (1 - Math.max(0, Math.min(at, 4 - at, 1))) * k;
  });

/**
 * Stable fluids on the GPU: Jos Stam's solver, run in float textures the way Pavel Dobryakov's WebGL fluid runs it.
 * Null where the browser can't draw into float textures.
 */
function fluid(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext("webgl2", { antialias: false, depth: false, stencil: false });
  if (!gl?.getExtension("EXT_color_buffer_float")) return null;
  const compile = (type: number, source: string) => {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    return shader;
  };
  const vertex = compile(gl.VERTEX_SHADER, VERTEX);
  const programs = {} as Record<Pass, WebGLProgram>;
  for (const [name, body] of Object.entries(SHADERS) as [Pass, string][]) {
    const program = gl.createProgram()!;
    gl.attachShader(program, vertex);
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, HEAD + body));
    gl.bindAttribLocation(program, 0, "corner");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;
    programs[name] = program;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

  const target = (w: number, h: number): Target => {
    const texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    const fbo = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { texture, fbo, w, h };
  };
  // Velocity, pressure and dye are pairs: a pass reads the first and writes the second, then they swap.
  let [w, h, scale] = [1, 1, 1];
  let [velocity, pressure, dye, curl, divergence] = [[], [], [], [], []] as Target[][];

  const located: Record<string, WebGLUniformLocation | null> = {};
  const pass = (name: Pass, out: Target | null, uniforms: Uniforms) => {
    gl.useProgram(programs[name]);
    let unit = 0;
    const all: Uniforms = { texel: [1 / velocity[0].w, 1 / velocity[0].h], ...uniforms };
    for (const [key, value] of Object.entries(all)) {
      const at = (located[`${name}.${key}`] ??= gl.getUniformLocation(programs[name], key));
      if (typeof value === "number") gl.uniform1f(at, value);
      else if (Array.isArray(value)) {
        if (value.length === 2) gl.uniform2fv(at, value);
        else gl.uniform3fv(at, value);
      } else {
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, value.texture);
        gl.uniform1i(at, unit++);
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, out?.fbo ?? null);
    gl.viewport(0, 0, out?.w ?? w, out?.h ?? h);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  const into = (pair: Target[], name: Pass, uniforms: Uniforms) => {
    pass(name, pair[1], uniforms);
    pair.reverse();
  };

  return {
    /** A still, empty tank `width` by `height` px: velocity on a grid about 128 cells across its short side, dye finer. */
    reset(width: number, height: number) {
      for (const t of [velocity, pressure, dye, curl, divergence].flat()) {
        gl.deleteTexture(t.texture);
        gl.deleteFramebuffer(t.fbo);
      }
      [canvas.width, canvas.height, w, h] = [width, height, width, height];
      scale = 128 / Math.min(w, h);
      const fine = Math.min(1, 512 / Math.min(w, h));
      const make = (k: number) => target(Math.max(1, Math.round(w * k)), Math.max(1, Math.round(h * k)));
      [velocity, pressure, dye, curl, divergence] = [[make(scale), make(scale)], [make(scale), make(scale)], [make(fine), make(fine)], [make(scale)], [make(scale)]];
    },
    /** Pushes the fluid at (`x`, `y`) px by (`vx`, `vy`) px a second and drops dye of `color` there, `radius` px across. */
    splat(x: number, y: number, vx: number, vy: number, color: number[], radius: number) {
      const at = { point: [x / w, 1 - y / h], aspect: w / h, radius: (radius / h) ** 2 };
      into(velocity, "splat", { ...at, target: velocity[0], value: [vx * scale, -vy * scale, 0] });
      into(dye, "splat", { ...at, target: dye[0], value: color });
    },
    /** One step of `dt` seconds: keep the swirls curling, make the flow incompressible, carry everything along it, draw. */
    step(dt: number) {
      pass("curl", curl[0], { velocity: velocity[0] });
      into(velocity, "vorticity", { velocity: velocity[0], curl: curl[0], dt });
      pass("divergence", divergence[0], { velocity: velocity[0] });
      into(pressure, "fade", { source: pressure[0], value: 0.8 });
      for (let i = 0; i < 20; i++) into(pressure, "pressure", { pressure: pressure[0], divergence: divergence[0] });
      into(velocity, "gradient", { pressure: pressure[0], velocity: velocity[0] });
      into(velocity, "advect", { velocity: velocity[0], source: velocity[0], dt, fade: 0.8 });
      into(dye, "advect", { velocity: velocity[0], source: dye[0], dt, fade: 1.6 });
      pass("display", null, { source: dye[0] });
    },
  };
}

/**
 * Dye in a real fluid: the pointer stirs it as it moves, its color turning slowly through the rainbow, and the swirls
 * keep curling after you stop. Hold to pour, and the strokes come out thicker and brighter; click for a splash, a ring
 * of every color thrown out from the pointer. Over anything clickable, a plume of dye rises off the control's top edge.
 * Needs WebGL2; without it, and under reduced motion, it is a plain dot.
 */
export function FluidCursor({ className = "" }: { className?: string }) {
  const s = useRef({ sim: undefined as ReturnType<typeof fluid> | undefined, ox: 0, oy: 0, w: 0, h: 0, t: 0, lx: 0, ly: 0, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [canvas, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
    if (p.reduced) return;
    const r = el.parentElement!.getBoundingClientRect();
    // A fresh tank over the visible part of the area each time the pointer arrives, kept on the area as the page scrolls.
    if (!p.dt) {
      if (st.sim === undefined) st.sim = fluid(canvas as HTMLCanvasElement);
      [st.ox, st.oy] = [Math.max(0, -r.left), Math.max(0, -r.top)];
      st.w = Math.floor(Math.min(r.right, innerWidth) - r.left - st.ox);
      st.h = Math.floor(Math.min(r.bottom, innerHeight) - r.top - st.oy);
      if (st.w > 0 && st.h > 0) st.sim?.reset(st.w, st.h);
      [st.lx, st.ly] = [p.x, p.y];
      return;
    }
    const sim = st.sim;
    if (!sim || st.w <= 0 || st.h <= 0) return;
    const [left, top] = [r.left + st.ox, r.top + st.oy];
    canvas.style.transform = `translate(${left}px, ${top}px)`;
    st.t += p.dt;
    const hue = st.t * 0.12;
    const [x, y, dx, dy] = [p.x - left, p.y - top, p.x - st.lx, p.y - st.ly];
    // Stir: the dye goes with the pointer, a third as fast so it doesn't flood the page; held down, it pours out thicker and brighter.
    const speed = Math.min(1, 1500 / Math.hypot(dx / p.dt, dy / p.dt)) * 0.35;
    if (dx || dy) sim.splat(x, y, (dx / p.dt) * speed, (dy / p.dt) * speed, rgb(hue, p.down ? 0.4 : 0.2), p.down ? 22 : 14);
    // A splash: a ring of every color thrown out from the click.
    if (p.down && !st.wasDown)
      for (let i = 0; i < 10; i++) {
        const a = (i / 10) * Math.PI * 2;
        sim.splat(x + Math.cos(a) * 6, y + Math.sin(a) * 6, Math.cos(a) * 900, Math.sin(a) * 900, rgb(hue + i / 10, 0.5), 14);
      }
    // Over a control, a plume of dye rises off its top edge, in the color opposite the pointer's.
    const box = p.hover?.getBoundingClientRect();
    if (box) sim.splat(box.left - left + Math.random() * box.width, box.top - top - 4, 0, -240, rgb(hue + 0.5, 0.3), 12);
    [st.lx, st.ly, st.wasDown] = [p.x, p.y, p.down];
    sim.step(Math.min(p.dt, 1 / 60));
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <canvas className="absolute top-0 left-0" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
