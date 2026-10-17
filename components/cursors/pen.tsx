"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The nib's broad edge, held at 40°: strokes across it come out full width, strokes along it hairline thin. */
const EDGE = [Math.cos((-40 * Math.PI) / 180), Math.sin((-40 * Math.PI) / 180)];
/** Seconds the ink takes to fade, and a blot. */
const LIFE = 1.4;
const BLOT = 2.2;

/** A fountain pen's nib, its tip at (6, 21.6) of the art; exported so a page can draw one at rest. */
export function NibArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 12 22" className={`overflow-visible ${className}`} aria-hidden>
      <path
        d="M6 21.6 1.6 11.2C.9 9.4 1.6 7.4 3 6.4V.6h6v5.8c1.4 1 2.1 3 1.4 4.8Z"
        fill="currentColor"
        fillOpacity="0.14"
        stroke="currentColor"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path d="M6 21.2v-8.6M3 6.4h6" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" />
      <circle cx="6" cy="11.4" r="1.1" fill="none" stroke="currentColor" strokeWidth="0.8" />
    </svg>
  );
}

type Point = { x: number; y: number; w: number; age: number; lift?: boolean };

/** One stroke of a broad nib through `points`: each step a band as wide as the nib's edge, turned the way the edge is held. */
function stroke(ctx: CanvasRenderingContext2D, points: Point[], alpha: (point: Point) => number) {
  for (let i = 1; i < points.length; i++) {
    const [a, b] = [points[i - 1], points[i]];
    if (b.lift) continue;
    ctx.globalAlpha = alpha(b);
    const [ax, ay, bx, by] = [EDGE[0] * a.w, EDGE[1] * a.w, EDGE[0] * b.w, EDGE[1] * b.w].map((v) => v / 2);
    ctx.beginPath();
    ctx.moveTo(a.x - ax, a.y - ay);
    ctx.lineTo(a.x + ax, a.y + ay);
    ctx.lineTo(b.x + bx, b.y + by);
    ctx.lineTo(b.x - bx, b.y - by);
    ctx.fill();
    // A hairline down the middle, so a stroke along the edge thins out but never breaks.
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }
}

/**
 * A fountain pen that writes your path in ink: thick and thin as a broad nib turns, wider when you go slowly or press
 * harder, fading as it dries. Over anything clickable it underlines the control with a flourish that stays while you
 * hover; a click leaves a blot.
 */
export function PenCursor({
  className = "",
  size = 6,
}: {
  className?: string;
  /** The nib's broad edge, in px: the widest stroke it writes. */
  size?: number;
}) {
  const s = useRef({
    ox: 0,
    oy: 0,
    w: 0,
    h: 0,
    ratio: 1,
    ink: "",
    width: 1,
    tilt: 35,
    press: 1,
    points: [] as Point[],
    blots: [] as { x: number; y: number; age: number }[],
    unders: [] as { el: Element; drawn: number; alpha: number }[],
    lx: 0,
    ly: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [canvas, nib] = el.children as HTMLCollectionOf<HTMLElement>;
    const ctx = (canvas as HTMLCanvasElement).getContext("2d");
    if (!ctx) return;
    const r = el.parentElement!.getBoundingClientRect();
    // A fresh sheet over the visible part of the area each time the pointer arrives, kept on the area as the page
    // scrolls; the ink is held in the area's own coordinates, so it scrolls with the page.
    if (!p.dt) {
      [st.ox, st.oy] = [Math.max(0, -r.left), Math.max(0, -r.top)];
      st.w = Math.max(0, Math.floor(Math.min(r.right, innerWidth) - r.left - st.ox));
      st.h = Math.max(0, Math.floor(Math.min(r.bottom, innerHeight) - r.top - st.oy));
      st.ratio = Math.min(devicePixelRatio || 1, 2);
      Object.assign(canvas, { width: st.w * st.ratio, height: st.h * st.ratio });
      Object.assign(canvas.style, { width: `${st.w}px`, height: `${st.h}px` });
      st.ink = getComputedStyle(el).color;
      [st.points, st.blots, st.unders] = [[], [], []];
      [st.lx, st.ly] = [p.x, p.y];
    }
    const [x, y] = [p.x - r.left, p.y - r.top];

    // The nib dips over a control and gives a little under pressure.
    st.tilt += ((p.hover ? 46 : 35) - st.tilt) * p.ease(10);
    st.press += ((p.down ? 0.9 : 1) - st.press) * p.ease(18);
    nib.style.transform = `translate(${p.x - 6}px, ${p.y - 21.6}px) rotate(${st.tilt}deg) scale(${st.press})`;
    if (!st.w || !st.h) return;

    // Ink, a trail that collapses under reduced motion: slow strokes run wide, fast ones thin, and pressing lays more
    // down. A jump (the pointer leaving and coming back) lifts the pen.
    const moved = Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    const speed = p.dt ? moved / p.dt : 0;
    st.width += (size * Math.min(1.15, Math.max(0.4, 1.3 - speed / 1600)) * (p.down ? 1.35 : 1) - st.width) * p.ease(10);
    if (!p.reduced && (moved >= 1 || !st.points.length)) st.points.push({ x, y, w: st.width, age: 0, lift: moved > 140 });
    if (!p.reduced && p.down && !st.wasDown) st.blots.push({ x, y, age: 0 });
    st.wasDown = p.down;
    for (const point of st.points) point.age += p.dt;
    for (const blot of st.blots) blot.age += p.dt;
    st.points = st.points.filter((point) => point.age < LIFE);
    st.blots = st.blots.filter((blot) => blot.age < BLOT);

    // The hovered control's underline draws itself in; one you have left fades away. Under reduced motion they just appear and go.
    if (p.hover && !st.unders.some((under) => under.el === p.hover)) st.unders.push({ el: p.hover, drawn: 0, alpha: 1 });
    for (const under of st.unders) {
      const here = under.el === p.hover;
      under.drawn = p.reduced ? 1 : Math.min(1, under.drawn + p.dt / 0.35);
      under.alpha = here ? 1 : p.reduced ? 0 : under.alpha - p.dt / 0.4;
    }
    st.unders = st.unders.filter((under) => under.alpha > 0 && under.el.isConnected);

    canvas.style.transform = `translate(${r.left + st.ox}px, ${r.top + st.oy}px)`;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, st.w * st.ratio, st.h * st.ratio);
    ctx.setTransform(st.ratio, 0, 0, st.ratio, -st.ox * st.ratio, -st.oy * st.ratio);
    ctx.fillStyle = ctx.strokeStyle = st.ink;
    ctx.lineWidth = 0.9;
    ctx.lineCap = "round";
    stroke(ctx, st.points, (point) => (1 - point.age / LIFE) ** 1.4);
    for (const under of st.unders) {
      // A swash just under the control, wobbling a little and flicking up at the end.
      const box = under.el.getBoundingClientRect();
      const [x0, x1, base] = [box.left - r.left - 3, box.right - r.left + 6, box.bottom - r.top + 5];
      const steps = Math.max(2, Math.round(24 * under.drawn));
      const points = Array.from({ length: steps }, (_, i) => {
        const u = (i / (steps - 1)) * under.drawn;
        const flick = u > 0.86 ? ((u - 0.86) / 0.14) ** 2 * 6 : 0;
        return { x: x0 + (x1 - x0) * u, y: base + Math.sin(u * Math.PI * 1.5) * 1.3 - flick, w: size * (0.95 - u * 0.25), age: 0 };
      });
      stroke(ctx, points, () => under.alpha);
    }
    for (const blot of st.blots) {
      // A blot spreads into the paper, a little uneven, and dries lighter.
      ctx.globalAlpha = 0.9 * (1 - blot.age / BLOT);
      const spread = size * (0.5 + Math.min(blot.age / 0.2, 1) * 0.8);
      for (const [dx, dy, k] of [
        [0, 0, 1],
        [0.5, -0.3, 0.6],
        [-0.4, 0.45, 0.55],
      ]) {
        ctx.beginPath();
        ctx.arc(blot.x + dx * spread, blot.y + dy * spread, spread * k, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <canvas className="absolute top-0 left-0" />
      <div className="absolute top-0 left-0 h-[22px] w-3 origin-[6px_21.6px]">
        <NibArt className="size-full" />
      </div>
    </div>
  );
}
