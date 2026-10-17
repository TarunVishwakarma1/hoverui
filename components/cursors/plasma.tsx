"use client";

import { useRef } from "react";
import { cursorRoot, INTERACTIVE, useCursor } from "@/hooks/use-cursor";

/** Filaments writhing in the globe at rest, and at full charge. */
const [FEW, MANY] = [6, 11];
/** Strokes for a glowing filament or arc, widest and faintest first: on a dark page added up like light; on a light page laid on like ink. */
const GLOW = {
  dark: ["rgb(140 70 255 / 0.22)", "rgb(214 110 255 / 0.65)", "rgb(255 236 255 / 0.95)"],
  light: ["rgb(150 70 255 / 0.18)", "rgb(190 60 255 / 0.75)", "rgb(90 20 200 / 0.95)"],
};

/** A jagged bolt from (x0, y0) to (x1, y1) by midpoint displacement; `seed` fixes its kinks so it holds until the next crackle. */
function bolt(x0: number, y0: number, x1: number, y1: number, seed: number, rough: number) {
  let points: [number, number][] = [
    [x0, y0],
    [x1, y1],
  ];
  let amp = Math.hypot(x1 - x0, y1 - y0) * rough;
  let s = seed;
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647 - 0.5;
  for (let level = 0; level < 4; level++) {
    const next: [number, number][] = [points[0]];
    for (let i = 1; i < points.length; i++) {
      const [[ax, ay], [bx, by]] = [points[i - 1], points[i]];
      const length = Math.hypot(bx - ax, by - ay) || 1;
      const off = rand() * amp;
      next.push([(ax + bx) / 2 - ((by - ay) / length) * off, (ay + by) / 2 + ((bx - ax) / length) * off], points[i]);
    }
    points = next;
    amp *= 0.5;
  }
  return points;
}

/** Strokes `points` three times over, wide and faint to thin and bright, `width` times the usual; `smooth` curves through them instead of kinking. */
function glow(ctx: CanvasRenderingContext2D, points: [number, number][], width: number, colors: string[], smooth = false) {
  ctx.beginPath();
  ctx.moveTo(...points[0]);
  for (let i = 1; i < points.length; i++) {
    const [[x, y], after] = [points[i], points[i + 1]];
    if (smooth && after) ctx.quadraticCurveTo(x, y, (x + after[0]) / 2, (y + after[1]) / 2);
    else ctx.lineTo(x, y);
  }
  [5, 2.2, 0.9].forEach((w, i) => {
    ctx.lineWidth = w * width;
    ctx.strokeStyle = colors[i];
    ctx.stroke();
  });
}

/** The point at `s` px round the box `r`, clockwise from its top-left corner. */
function edge(r: DOMRect, s: number): [number, number] {
  const [w, h] = [r.width, r.height];
  s = ((s % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
  if (s < w) return [r.left + s, r.top];
  if (s < w + h) return [r.right, r.top + s - w];
  if (s < 2 * w + h) return [r.right - (s - w - h), r.bottom];
  return [r.left, r.bottom - (s - 2 * w - h)];
}

/** How far round the box `r`, clockwise from its top-left corner, is the point of it nearest to (x, y). */
function along(r: DOMRect, x: number, y: number) {
  const [nx, ny] = [Math.min(Math.max(x, r.left), r.right), Math.min(Math.max(y, r.top), r.bottom)];
  const [dl, dr, dt, db] = [nx - r.left, r.right - nx, ny - r.top, r.bottom - ny];
  const least = Math.min(dl, dr, dt, db);
  if (least === dt) return nx - r.left;
  if (least === dr) return r.width + ny - r.top;
  if (least === db) return r.width + r.height + r.right - nx;
  return 2 * r.width + r.height + r.bottom - ny;
}

/**
 * A plasma globe floating at the pointer's shoulder: filaments of light writhe from its core to the glass, and one always
 * reaches out to touch the pointer, the way a plasma ball reaches for a finger. Over anything clickable the arcs leap
 * out onto the control's edges and it glows with the charge. Hold to charge the globe, crackling; let go and it
 * discharges, bolts striking every control within reach.
 */
export function PlasmaCursor({
  className = "",
  size = 30,
  reach = 140,
}: {
  className?: string;
  /** The globe's diameter, in px. */
  size?: number;
  /** How far, in px, a discharge can strike. */
  reach?: number;
}) {
  const s = useRef({
    gx: 0,
    gy: 0,
    vx: 0,
    vy: 0,
    t: 0,
    charge: 0,
    flash: 0,
    crackle: 0,
    seed: 1,
    spark: 0,
    bolts: [] as { x: number; y: number; age: number; life: number; width: number }[],
    drift: Array.from({ length: MANY }, (_, i) => i * 2.39),
    dark: false,
    ratio: 1,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [canvas, aura] = el.children as HTMLCollectionOf<HTMLElement>;
    const ctx = (canvas as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;
    const R = size / 2;
    const BOX = 2 * (reach + R + 24);
    if (!p.dt) {
      st.ratio = Math.min(devicePixelRatio || 1, 2);
      Object.assign(canvas, { width: BOX * st.ratio, height: BOX * st.ratio });
      Object.assign(canvas.style, { width: `${BOX}px`, height: `${BOX}px` });
      // A dark page has light text, and the cursor's color is the page's text color.
      const [r, g, b] = (getComputedStyle(el).color.match(/[\d.]+/g) ?? ["0", "0", "0"]).map(Number);
      st.dark = 0.299 * r + 0.587 * g + 0.114 * b > 140;
      [st.bolts, st.charge, st.flash] = [[], 0, 0];
    }
    if (!p.reduced) st.t += p.dt;
    // The globe floats up and to the left of the pointer on a soft spring, lagging as you move, never far.
    const [tx, ty] = [p.x - R - 14, p.y - R - 14];
    if (p.reduced || !p.dt) [st.gx, st.gy, st.vx, st.vy] = [tx, ty, 0, 0];
    else {
      st.vx += ((tx - st.gx) * 110 - st.vx * 13) * p.dt;
      st.vy += ((ty - st.gy) * 110 - st.vy * 13) * p.dt;
      st.gx += st.vx * p.dt;
      st.gy += st.vy * p.dt;
      const lag = Math.hypot(st.gx - tx, st.gy - ty);
      if (lag > 60) [st.gx, st.gy] = [tx + ((st.gx - tx) * 60) / lag, ty + ((st.gy - ty) * 60) / lag];
    }
    const [gx, gy] = [st.gx, st.gy];
    // Crackle: every arc takes new kinks twenty times a second.
    st.crackle -= p.dt;
    if (!p.reduced && st.crackle <= 0) {
      st.crackle = 0.05;
      st.seed = 1 + Math.floor(Math.random() * 2147483000);
    }

    // Hold to charge, crackling; let go to discharge, harder the longer you held.
    const release = !p.down && st.wasDown;
    st.wasDown = p.down;
    if (!p.reduced) {
      if (p.down) {
        st.charge = Math.min(1, st.charge + p.dt / 1.2);
        st.spark -= p.dt;
        if (st.spark <= 0) {
          st.spark = 0.07;
          const a = Math.random() * Math.PI * 2;
          const d = R + 14 + Math.random() * 30 * (0.5 + st.charge);
          st.bolts.push({ x: gx + Math.cos(a) * d, y: gy + Math.sin(a) * d, age: 0, life: 0.08, width: 0.6 });
        }
      }
      if (release) {
        const power = Math.max(0.35, st.charge);
        const targets = [...el.parentElement!.querySelectorAll(INTERACTIVE)]
          .map((control) => {
            const r = control.getBoundingClientRect();
            const [nx, ny] = [Math.min(Math.max(gx, r.left), r.right), Math.min(Math.max(gy, r.top), r.bottom)];
            return { x: nx, y: ny, d: Math.hypot(nx - gx, ny - gy) };
          })
          .filter(({ d }) => d > R && d < reach * (0.6 + power * 0.4))
          .sort((a, b) => a.d - b.d)
          .slice(0, 6);
        // Nothing to strike: the bolts fork out into the air.
        const strikes = targets.length
          ? targets
          : Array.from({ length: 5 }, (_, i) => {
              const a = (i / 5) * Math.PI * 2 + Math.random();
              const d = reach * (0.35 + Math.random() * 0.3) * (0.6 + power * 0.4);
              return { x: gx + Math.cos(a) * d, y: gy + Math.sin(a) * d };
            });
        for (const { x, y } of strikes) st.bolts.push({ x, y, age: 0, life: 0.16 + power * 0.22, width: 0.8 + power * 0.6 });
        [st.flash, st.charge] = [power, 0];
      }
    }
    st.flash = Math.max(0, st.flash - p.dt * 3);
    for (const b of st.bolts) b.age += p.dt;
    st.bolts = st.bolts.filter((b) => b.age < b.life);

    // The hovered control glows with the charge, flickering, drawn over it and never touching it.
    const box = p.hover?.getBoundingClientRect();
    aura.style.opacity = box ? String(0.75 + (p.reduced ? 0 : Math.sin(st.t * 37) * 0.15 + Math.sin(st.t * 23) * 0.1)) : "0";
    if (box) Object.assign(aura.style, { transform: `translate(${box.left}px, ${box.top}px)`, width: `${box.width}px`, height: `${box.height}px` });

    // Draw in page coordinates: the canvas is a window round the globe that moves with it.
    const [left, top] = [gx - BOX / 2, gy - BOX / 2];
    canvas.style.transform = `translate(${left}px, ${top}px)`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, BOX * st.ratio, BOX * st.ratio);
    ctx.setTransform(st.ratio, 0, 0, st.ratio, -left * st.ratio, -top * st.ratio);
    ctx.lineCap = ctx.lineJoin = "round";
    const page = st.dark ? GLOW.dark : GLOW.light;
    // Where an arc leaves the glass on its way to (x, y).
    const from = (x: number, y: number): [number, number] => {
      const a = Math.atan2(y - gy, x - gx);
      return [gx + Math.cos(a) * R * 0.92, gy + Math.sin(a) * R * 0.92];
    };

    // Outside the glass: the touch on the pointer, the arcs onto a hovered control, sparks and discharges.
    ctx.globalCompositeOperation = st.dark ? "lighter" : "source-over";
    if (st.flash) {
      const halo = ctx.createRadialGradient(gx, gy, R, gx, gy, R * 4);
      halo.addColorStop(0, `rgb(170 90 255 / ${st.flash * 0.35})`);
      halo.addColorStop(1, "rgb(170 90 255 / 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(gx - R * 4, gy - R * 4, R * 8, R * 8);
    }
    glow(ctx, bolt(...from(p.x, p.y), p.x, p.y, st.seed, 0.16), 0.75 + st.charge * 0.4, page);
    if (box) {
      // Three arcs onto the edge nearest the globe, crawling to and fro along it.
      const at = along(box, gx, gy);
      for (const [k, shift] of [0, -1, 1].entries()) {
        const [ex, ey] = edge(box, at + shift * (16 + Math.sin(st.t * 3 + k) * 8));
        if (Math.hypot(ex - gx, ey - gy) < reach) glow(ctx, bolt(...from(ex, ey), ex, ey, st.seed + k * 977, 0.2), 0.7, page);
      }
    }
    for (const b of st.bolts) {
      ctx.globalAlpha = 1 - (b.age / b.life) ** 2;
      glow(ctx, bolt(...from(b.x, b.y), b.x, b.y, st.seed + Math.round(b.x * 31 + b.y), 0.24), b.width, page);
      // A flare where it strikes.
      const strike = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, 7 * b.width);
      strike.addColorStop(0, page[2]);
      strike.addColorStop(1, "rgb(170 90 255 / 0)");
      ctx.fillStyle = strike;
      ctx.fillRect(b.x - 8 * b.width, b.y - 8 * b.width, 16 * b.width, 16 * b.width);
    }
    ctx.globalAlpha = 1;
    // The touch: a hot point at the pointer itself, the exact spot you are pointing at.
    const touch = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 6);
    touch.addColorStop(0, page[2]);
    touch.addColorStop(0.35, page[1]);
    touch.addColorStop(1, "rgb(170 90 255 / 0)");
    ctx.fillStyle = touch;
    ctx.fillRect(p.x - 6, p.y - 6, 12, 12);

    // The globe: smoky dark glass, so the plasma glows on any page.
    ctx.globalCompositeOperation = "source-over";
    const glass = ctx.createRadialGradient(gx - R * 0.3, gy - R * 0.35, R * 0.1, gx, gy, R);
    glass.addColorStop(0, "#2b1350");
    glass.addColorStop(1, "#0b0618");
    ctx.fillStyle = glass;
    ctx.beginPath();
    ctx.arc(gx, gy, R, 0, Math.PI * 2);
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.globalCompositeOperation = "lighter";
    // The plasma's haze, lighting the glass from the core out.
    const haze = ctx.createRadialGradient(gx, gy, 0, gx, gy, R);
    haze.addColorStop(0, `rgb(150 60 255 / ${0.3 + st.charge * 0.2})`);
    haze.addColorStop(0.6, "rgb(120 40 220 / 0.12)");
    haze.addColorStop(1, "rgb(120 40 220 / 0)");
    ctx.fillStyle = haze;
    ctx.fillRect(gx - R, gy - R, R * 2, R * 2);
    // Filaments from the core to the glass, writhing; one always runs toward the pointer, and more come as it charges.
    const toward = Math.atan2(p.y - gy, p.x - gx);
    const count = FEW + Math.round((MANY - FEW) * st.charge);
    for (let i = 0; i < count; i++) {
      const a = i ? st.drift[i] + Math.sin(st.t * 0.55 + i * 1.7) * 0.9 + st.t * 0.25 : toward;
      const [ex, ey] = [gx + Math.cos(a) * R, gy + Math.sin(a) * R];
      const points: [number, number][] = [];
      for (let k = 0; k <= 8; k++) {
        const f = k / 8;
        const bend = Math.sin(Math.PI * f) * R * (0.11 * Math.sin(st.t * 4.1 + k * 1.3 + i * 2.1) + 0.025 * Math.sin(st.t * 9.3 + k * 2.7 + i));
        points.push([gx + (ex - gx) * f - Math.sin(a) * bend, gy + (ey - gy) * f + Math.cos(a) * bend]);
      }
      glow(ctx, points, (0.45 + st.charge * 0.4) * (size / 30), GLOW.dark, true);
      // A bright spot where the filament meets the glass.
      const spot = ctx.createRadialGradient(ex, ey, 0, ex, ey, 4.5);
      spot.addColorStop(0, "rgb(255 220 255 / 0.9)");
      spot.addColorStop(1, "rgb(180 90 255 / 0)");
      ctx.fillStyle = spot;
      ctx.fillRect(ex - 5, ey - 5, 10, 10);
    }
    // The electrode at the heart, brighter with charge.
    const core = ctx.createRadialGradient(gx, gy, 0, gx, gy, R * (0.32 + st.charge * 0.15 + st.flash * 0.2));
    core.addColorStop(0, "rgb(255 255 255 / 1)");
    core.addColorStop(0.4, "rgb(255 150 255 / 0.85)");
    core.addColorStop(1, "rgb(160 70 255 / 0)");
    ctx.fillStyle = core;
    ctx.fillRect(gx - R, gy - R, R * 2, R * 2);
    ctx.restore();
    // The glass's edge and its highlight.
    ctx.globalCompositeOperation = "source-over";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgb(220 190 255 / 0.4)";
    ctx.beginPath();
    ctx.arc(gx, gy, R - 0.5, 0, Math.PI * 2);
    ctx.stroke();
    const shine = ctx.createRadialGradient(gx - R * 0.42, gy - R * 0.48, 0, gx - R * 0.42, gy - R * 0.48, R * 0.45);
    shine.addColorStop(0, "rgb(255 255 255 / 0.55)");
    shine.addColorStop(1, "rgb(255 255 255 / 0)");
    ctx.fillStyle = shine;
    ctx.fillRect(gx - R, gy - R, R, R);
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <canvas className="absolute top-0 left-0" />
      <div
        className="absolute top-0 left-0 opacity-0"
        style={{ boxShadow: "0 0 0 1px rgb(200 120 255 / 0.8), 0 0 12px 2px rgb(150 80 255 / 0.5), inset 0 0 10px rgb(180 100 255 / 0.3)" }}
      />
    </div>
  );
}
