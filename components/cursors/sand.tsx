"use client";

import { useRef } from "react";
import { cursorRoot, INTERACTIVE, useCursor } from "@/hooks/use-cursor";

/** One grain is a cell this many px across. */
const CELL = 3;
/** Sand-art colors, poured in bands: coral, marigold, natural sand, teal, blue, violet, pink. */
const BANDS = ["#f26b5b", "#f6b24a", "#e5cf94", "#3fae9f", "#5b8def", "#9f7ae0", "#ec86b0"];
/** Each grain is one of a few shades of its band, so the sand has a grain to it. */
const SHADES = [1.08, 1, 0.93, 0.86];
/** A cell holding part of a control: sand rests on it, and it is never drawn. */
const SOLID = 255;
/** Cell value to pixel, ABGR as canvas pixels sit in memory: 0 and SOLID are clear, 1 on is a band in a shade. */
const PALETTE = new Uint32Array(256);
BANDS.forEach((hex, band) =>
  SHADES.forEach((k, shade) => {
    const [r, g, b] = [1, 3, 5].map((i) => Math.min(255, Math.round(parseInt(hex.slice(i, i + 2), 16) * k)));
    PALETTE[1 + band * SHADES.length + shade] = 0xff000000 | (b << 16) | (g << 8) | r;
  }),
);

/**
 * Sand that pours from the pointer as you move, streams while you hold, and comes out in a handful on a click. Every
 * grain falls, slides off the grains below it and comes to rest, so it piles into dunes along the bottom of the area
 * and on top of every control in it; over a control it pours onto the control's top. The color changes every few
 * seconds, so the dunes come out in layers, like sand art, and the bottom of the pile slowly drains away.
 */
export function SandCursor({ className = "" }: { className?: string }) {
  const s = useRef({ cols: 0, rows: 0, ox: 0, oy: 0, grid: new Uint8Array(0), image: null as ImageData | null, t: 0, steps: 0, solids: 0, lx: 0, ly: 0, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const area = el.parentElement!;
    const [canvas, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    const ctx = (canvas as HTMLCanvasElement).getContext("2d");
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
    if (!ctx) return;
    const r = area.getBoundingClientRect();
    // A fresh box of sand over the visible part of the area each time the pointer arrives, kept on the area as the page scrolls.
    if (!p.dt) {
      [st.ox, st.oy] = [Math.max(0, -r.left), Math.max(0, -r.top)];
      st.cols = Math.max(0, Math.floor((Math.min(r.right, innerWidth) - r.left - st.ox) / CELL));
      st.rows = Math.max(0, Math.floor((Math.min(r.bottom, innerHeight) - r.top - st.oy) / CELL));
      st.grid = new Uint8Array(st.cols * st.rows);
      Object.assign(canvas, { width: st.cols, height: st.rows });
      Object.assign(canvas.style, { width: `${st.cols * CELL}px`, height: `${st.rows * CELL}px` });
      st.image = st.cols && st.rows ? ctx.createImageData(st.cols, st.rows) : null;
      [st.lx, st.ly, st.solids, st.steps] = [p.x, p.y, 0, 0];
    }
    const { cols, rows, grid, image } = st;
    if (!image || p.reduced) return;
    const [left, top] = [r.left + st.ox, r.top + st.oy];
    canvas.style.transform = `translate(${left}px, ${top}px)`;
    st.t += p.dt;

    // The controls are the ground the sand piles on, found again twice a second in case they move.
    st.solids -= p.dt;
    if (st.solids <= 0) {
      st.solids = 0.5;
      for (let i = 0; i < grid.length; i++) if (grid[i] === SOLID) grid[i] = 0;
      for (const control of area.querySelectorAll(INTERACTIVE)) {
        const b = control.getBoundingClientRect();
        const [x0, x1] = [Math.max(0, Math.floor((b.left - left) / CELL)), Math.min(cols, Math.ceil((b.right - left) / CELL))];
        const [y0, y1] = [Math.max(0, Math.floor((b.top - top) / CELL)), Math.min(rows, Math.ceil((b.bottom - top) / CELL))];
        for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (!grid[y * cols + x]) grid[y * cols + x] = SOLID;
      }
    }

    // Pour: a trail as you move, a stream while you hold, a handful on a click. Inside a control it comes out on top.
    const band = Math.floor(st.t / 1.5) % BANDS.length;
    const pour = (count: number, spread: number) => {
      for (let n = 0; n < count; n++) {
        const x = Math.floor((p.x - left) / CELL + (Math.random() - 0.5) * spread);
        let y = Math.floor((p.y - top) / CELL + (Math.random() - 0.5) * spread);
        if (x < 0 || x >= cols) continue;
        while (y > 0 && grid[y * cols + x] === SOLID) y--;
        if (y >= 0 && y < rows && !grid[y * cols + x]) grid[y * cols + x] = 1 + band * SHADES.length + Math.floor(Math.random() * SHADES.length);
      }
    };
    pour(Math.min(Math.round(Math.hypot(p.x - st.lx, p.y - st.ly) / 3), 12), 3);
    if (p.down) pour(Math.floor(p.dt * 360 + Math.random()), 2);
    if (p.down && !st.wasDown) pour(70, 16);
    [st.lx, st.ly, st.wasDown] = [p.x, p.y, p.down];

    // Fall, 120 steps a second: bottom row up, each grain drops if it can, else slides down one side or the other.
    st.steps = Math.min(st.steps + p.dt * 120, 4);
    for (; st.steps >= 1; st.steps--) {
      const flip = Math.random() < 0.5;
      for (let y = rows - 2; y >= 0; y--)
        for (let k = 0; k < cols; k++) {
          const x = flip ? k : cols - 1 - k;
          const i = y * cols + x;
          const grain = grid[i];
          if (!grain || grain === SOLID) continue;
          const below = i + cols;
          const side = Math.random() < 0.5 ? -1 : 1;
          if (!grid[below]) [grid[below], grid[i]] = [grain, 0];
          else if (x + side >= 0 && x + side < cols && !grid[below + side]) [grid[below + side], grid[i]] = [grain, 0];
          else if (x - side >= 0 && x - side < cols && !grid[below - side]) [grid[below - side], grid[i]] = [grain, 0];
        }
    }
    // The bottom of the pile drains slowly away, so it never fills the area.
    for (let i = (rows - 1) * cols; i < grid.length; i++) if (grid[i] !== SOLID && Math.random() < p.dt * 1.5) grid[i] = 0;

    const pixels = new Uint32Array(image.data.buffer);
    for (let i = 0; i < grid.length; i++) pixels[i] = PALETTE[grid[i]];
    ctx.putImageData(image, 0, 0);
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <canvas className="absolute top-0 left-0 [image-rendering:pixelated]" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
