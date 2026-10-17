"use client";

import { useRef } from "react";
import { cursorRoot, INTERACTIVE, useCursor } from "@/hooks/use-cursor";

/** Filaments writhing round the spark at rest, and at full charge. */
const [FEW, MANY] = [6, 11];
/** How long, in seconds, the electric tail lasts behind the pointer. */
const TAIL = 0.28;
/** Strokes for a glowing filament or arc, widest and faintest first: on a dark page added up like light; on a light page laid on like ink. */
const GLOW = {
  dark: ["rgb(140 70 255 / 0.22)", "rgb(214 110 255 / 0.7)", "rgb(255 240 255 / 0.95)"],
  light: ["rgb(150 70 255 / 0.16)", "rgb(185 60 255 / 0.75)", "rgb(80 15 190 / 0.95)"],
};

/** A jagged bolt from (x0, y0) to (x1, y1) by midpoint displacement; `seed` fixes its kinks until the next crackle. */
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
  if (points.length < 2) return;
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

/** The point at `s` px round the box `r`, clockwise from its top-left corner, and the way out of the box there. */
function edge(r: DOMRect, s: number) {
  const [w, h] = [r.width, r.height];
  s = ((s % (2 * (w + h))) + 2 * (w + h)) % (2 * (w + h));
  if (s < w) return [r.left + s, r.top, 0, -1];
  if (s < w + h) return [r.right, r.top + s - w, 1, 0];
  if (s < 2 * w + h) return [r.right - (s - w - h), r.bottom, 0, 1];
  return [r.left, r.bottom - (s - 2 * w - h), -1, 0];
}

/** How far round the box `r`, clockwise from its top-left corner, is the point of its edge nearest to (x, y). */
function along(r: DOMRect, x: number, y: number) {
  const [nx, ny] = [Math.min(Math.max(x, r.left), r.right), Math.min(Math.max(y, r.top), r.bottom)];
  const least = Math.min(nx - r.left, r.right - nx, ny - r.top, r.bottom - ny);
  if (least === ny - r.top) return nx - r.left;
  if (least === r.right - nx) return r.width + ny - r.top;
  if (least === r.bottom - ny) return r.width + r.height + r.right - nx;
  return 2 * r.width + r.height + r.bottom - ny;
}

/**
 * Live current at the pointer: a white-hot spark wreathed in writhing plasma that leans back as you move and leaves a
 * jagged electric tail. Over anything clickable the current leaks onto the control and crawls round its edges, surging
 * where you are. Hold to charge, crackling; let go and it discharges, bolts striking every control within reach.
 */
export function PlasmaCursor({
  className = "",
  size = 16,
  reach = 140,
}: {
  className?: string;
  /** How far, in px, the plasma reaches round the spark at rest. */
  size?: number;
  /** How far, in px, a discharge can strike. */
  reach?: number;
}) {
  const s = useRef({
    ox: 0,
    oy: 0,
    w: 0,
    h: 0,
    ratio: 1,
    dark: false,
    clock: 0,
    seed: 1,
    crackle: 0,
    vx: 0,
    vy: 0,
    lx: 0,
    ly: 0,
    charge: 0,
    flash: 0,
    spark: 0,
    trail: [] as { x: number; y: number; t: number }[],
    bolts: [] as { x: number; y: number; age: number; life: number; width: number }[],
    dirty: null as number[] | null,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const canvas = el.firstElementChild as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const area = el.parentElement!.getBoundingClientRect();
    // A sheet over the visible part of the area, sized each time the pointer arrives and kept on the area as it scrolls.
    if (!p.dt) {
      [st.ox, st.oy] = [Math.max(0, -area.left), Math.max(0, -area.top)];
      st.w = Math.max(0, Math.floor(Math.min(area.right, innerWidth) - area.left - st.ox));
      st.h = Math.max(0, Math.floor(Math.min(area.bottom, innerHeight) - area.top - st.oy));
      st.ratio = Math.min(devicePixelRatio || 1, 2);
      Object.assign(canvas, { width: st.w * st.ratio, height: st.h * st.ratio });
      Object.assign(canvas.style, { width: `${st.w}px`, height: `${st.h}px` });
      // A dark page has light text, and the cursor's color is the page's text color.
      const [r, g, b] = (getComputedStyle(el).color.match(/[\d.]+/g) ?? ["0", "0", "0"]).map(Number);
      st.dark = 0.299 * r + 0.587 * g + 0.114 * b > 140;
      [st.trail, st.bolts, st.charge, st.flash, st.dirty, st.lx, st.ly, st.vx, st.vy] = [[], [], 0, 0, null, p.x, p.y, 0, 0];
    }
    if (!st.w || !st.h) return;
    const [left, top] = [area.left + st.ox, area.top + st.oy];
    canvas.style.transform = `translate(${left}px, ${top}px)`;
    if (!p.reduced) st.clock += p.dt;

    // Crackle: every arc takes new kinks twenty times a second.
    st.crackle -= p.dt;
    if (!p.reduced && st.crackle <= 0) {
      st.crackle = 0.05;
      st.seed = 1 + Math.floor(Math.random() * 2147483000);
    }
    // The pointer's speed, smoothed, and the tail it leaves.
    if (p.dt) {
      const k = Math.min(1, p.dt * 12);
      st.vx += ((p.x - st.lx) / p.dt - st.vx) * k;
      st.vy += ((p.y - st.ly) / p.dt - st.vy) * k;
    }
    if (!p.reduced && (p.x !== st.lx || p.y !== st.ly)) st.trail.push({ x: p.x, y: p.y, t: st.clock });
    [st.lx, st.ly] = [p.x, p.y];
    st.trail = st.trail.filter((point) => st.clock - point.t < TAIL);
    const speed = Math.hypot(st.vx, st.vy);

    // Hold to charge, crackling; let go to discharge, harder the longer you held.
    const release = !p.down && st.wasDown;
    st.wasDown = p.down;
    if (!p.reduced) {
      if (p.down) {
        st.charge = Math.min(1, st.charge + p.dt / 1.2);
        st.spark -= p.dt;
        if (st.spark <= 0) {
          st.spark = 0.06;
          const a = Math.random() * Math.PI * 2;
          const d = size * (1.3 + Math.random() * (1 + st.charge * 1.5));
          st.bolts.push({ x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d, age: 0, life: 0.08, width: 0.55 });
        }
      }
      if (release) {
        const power = Math.max(0.35, st.charge);
        const targets = [...el.parentElement!.querySelectorAll(INTERACTIVE)]
          .filter((control) => control !== p.hover)
          .map((control) => {
            const r = control.getBoundingClientRect();
            const [nx, ny] = [Math.min(Math.max(p.x, r.left), r.right), Math.min(Math.max(p.y, r.top), r.bottom)];
            return { x: nx, y: ny, d: Math.hypot(nx - p.x, ny - p.y) };
          })
          .filter(({ d }) => d > size && d < reach * (0.6 + power * 0.4))
          .sort((a, b) => a.d - b.d)
          .slice(0, 6);
        // Nothing to strike: the bolts fork out into the air.
        const strikes = targets.length
          ? targets
          : Array.from({ length: 5 }, (_, i) => {
              const a = (i / 5) * Math.PI * 2 + Math.random();
              const d = reach * (0.3 + Math.random() * 0.25) * (0.6 + power * 0.4);
              return { x: p.x + Math.cos(a) * d, y: p.y + Math.sin(a) * d };
            });
        for (const { x, y } of strikes) st.bolts.push({ x, y, age: 0, life: 0.16 + power * 0.22, width: 0.8 + power * 0.6 });
        [st.flash, st.charge] = [power, 0];
      }
    }
    st.flash = Math.max(0, st.flash - p.dt * 3);
    for (const b of st.bolts) b.age += p.dt;
    st.bolts = st.bolts.filter((b) => b.age < b.life);

    // Wipe only what was drawn last frame (kept relative to the sheet, so a scroll can't strand it), then draw in page coordinates.
    ctx.setTransform(st.ratio, 0, 0, st.ratio, -left * st.ratio, -top * st.ratio);
    if (st.dirty) ctx.clearRect(st.dirty[0] + left - 24, st.dirty[1] + top - 24, st.dirty[2] - st.dirty[0] + 48, st.dirty[3] - st.dirty[1] + 48);
    const dirty = [p.x - size * 3, p.y - size * 3, p.x + size * 3, p.y + size * 3];
    const cover = (x: number, y: number) => {
      [dirty[0], dirty[1], dirty[2], dirty[3]] = [Math.min(dirty[0], x), Math.min(dirty[1], y), Math.max(dirty[2], x), Math.max(dirty[3], y)];
    };
    ctx.lineCap = ctx.lineJoin = "round";
    ctx.globalCompositeOperation = st.dark ? "lighter" : "source-over";
    const page = st.dark ? GLOW.dark : GLOW.light;
    const flare = (x: number, y: number, radius: number, alpha: number) => {
      const light = ctx.createRadialGradient(x, y, 0, x, y, radius);
      light.addColorStop(0, page[2]);
      light.addColorStop(0.3, page[1]);
      light.addColorStop(1, "rgb(170 90 255 / 0)");
      ctx.globalAlpha = alpha;
      ctx.fillStyle = light;
      ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
      ctx.globalAlpha = 1;
    };

    // The hovered control: current leaking onto it and crawling round its edges, surging nearest the pointer, a pulse
    // racing round.
    const box = p.hover?.getBoundingClientRect();
    if (box) {
      cover(box.left - 8, box.top - 8);
      cover(box.right + 8, box.bottom + 8);
      const around = 2 * (box.width + box.height);
      const count = Math.max(24, Math.round(around / 7));
      const near = along(box, p.x, p.y);
      for (let strand = 0; strand < 2; strand++) {
        let seed = st.seed + strand * 7919;
        const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5;
        const points = Array.from({ length: count + 1 }, (_, i) => {
          const [x, y, nx, ny] = edge(box, (i / count) * around);
          const off = i % count ? rand() * 4.4 : 0;
          return [x + nx * off, y + ny * off] as [number, number];
        });
        // A run of the strand from `from` px round, `length` px long.
        const run = (from: number, length: number) =>
          Array.from({ length: Math.ceil((length / around) * count) + 1 }, (_, i) => points[(((Math.floor((from / around) * count) + i) % count) + count) % count]);
        ctx.globalAlpha = 0.45;
        glow(ctx, points, 0.55, page);
        ctx.globalAlpha = 1;
        glow(ctx, run(near - 36, 72), 0.8, page);
        if (!p.reduced) glow(ctx, run(st.clock * 260 + strand * (around / 2), 34), 0.75, page);
      }
      // Where the current leaves the spark for the edge.
      const [ex, ey] = edge(box, near);
      if (Math.hypot(ex - p.x, ey - p.y) > 3) glow(ctx, bolt(p.x, p.y, ex, ey, st.seed + 31, 0.2), 0.6, page);
      flare(ex, ey, 9, 0.9);
    }

    // The tail: a jagged run of current along the path you just took, fading toward its end.
    if (st.trail.length > 1) {
      let seed = st.seed + 101;
      const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5;
      const points = st.trail.map(({ x, y, t }, i, all) => {
        const prev = all[Math.max(0, i - 1)];
        const next = all[Math.min(all.length - 1, i + 1)];
        const [dx, dy] = [next.x - prev.x, next.y - prev.y];
        const length = Math.hypot(dx, dy) || 1;
        const off = rand() * 7 * (1 - (st.clock - t) / TAIL) ** 0.5;
        cover(x, y);
        return [x - (dy / length) * off, y + (dx / length) * off] as [number, number];
      });
      points.push([p.x, p.y]);
      const chunks = 4;
      for (let c = 0; c < chunks; c++) {
        const [from, to] = [Math.floor((c * (points.length - 1)) / chunks), Math.ceil(((c + 1) * (points.length - 1)) / chunks)];
        ctx.globalAlpha = (c + 1) / chunks;
        glow(ctx, points.slice(from, to + 1), 0.35 + (c / chunks) * 0.5, page);
      }
      ctx.globalAlpha = 1;
      // Now and then a fork flicks off the tail.
      if (points.length > 6 && !p.reduced) {
        const [fx, fy] = points[Math.floor(points.length * 0.4 + rand() * points.length * 0.3)];
        const a = rand() * Math.PI * 2;
        glow(ctx, bolt(fx, fy, fx + Math.cos(a) * 12, fy + Math.sin(a) * 12, st.seed + 7, 0.3), 0.4, page);
      }
    }

    // Sparks while charging, and the bolts of a discharge.
    for (const b of st.bolts) {
      cover(b.x, b.y);
      ctx.globalAlpha = 1 - (b.age / b.life) ** 2;
      glow(ctx, bolt(p.x, p.y, b.x, b.y, st.seed + Math.round(b.x * 31 + b.y), 0.24), b.width, page);
      if (b.width > 0.6) flare(b.x, b.y, 8 * b.width, 1 - b.age / b.life);
    }
    ctx.globalAlpha = 1;
    if (st.flash) flare(p.x, p.y, size * 4, st.flash * 0.5);

    // The plasma round the spark: filaments writhing out, leaning back the faster you go, more and longer as it charges.
    const lean = Math.min(1, speed / 900);
    const count = FEW + Math.round((MANY - FEW) * st.charge);
    flare(p.x, p.y, size * 1.2, 0.3 + st.charge * 0.3);
    for (let i = 0; i < count; i++) {
      const a = i * 2.39 + Math.sin(st.clock * 0.9 + i * 1.7) * 0.7 + st.clock * 0.6;
      let [dx, dy] = [Math.cos(a), Math.sin(a)];
      if (speed > 1) [dx, dy] = [dx - (st.vx / speed) * lean * 1.4, dy - (st.vy / speed) * lean * 1.4];
      const d = Math.hypot(dx, dy) || 1;
      [dx, dy] = [dx / d, dy / d];
      const length = size * (0.55 + 0.45 * Math.abs(Math.sin(st.clock * 3.1 + i * 2.3))) * (1 + st.charge * 0.8) * (1 + lean * 0.6);
      const points: [number, number][] = [];
      for (let k = 0; k <= 6; k++) {
        const f = k / 6;
        const bend = Math.sin(Math.PI * f) * length * (0.2 * Math.sin(st.clock * 5.3 + k * 1.4 + i * 2.1) + 0.06 * Math.sin(st.clock * 11 + k * 2.9 + i));
        points.push([p.x + dx * length * f - dy * bend, p.y + dy * length * f + dx * bend]);
      }
      // Tapering out: full strength near the spark, thinner and fainter toward the tip, like a tendril of plasma.
      glow(ctx, points.slice(0, 5), 0.42 + st.charge * 0.25, page, true);
      ctx.globalAlpha = 0.5;
      glow(ctx, points.slice(3), 0.26 + st.charge * 0.2, page, true);
      ctx.globalAlpha = 1;
    }
    // The spark itself: white-hot where you point.
    flare(p.x, p.y, 7 + st.charge * 5, 1);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = page[2];
    ctx.beginPath();
    ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
    st.dirty = [dirty[0] - left, dirty[1] - top, dirty[2] - left, dirty[3] - top];
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <canvas className="absolute top-0 left-0" />
    </div>
  );
}
