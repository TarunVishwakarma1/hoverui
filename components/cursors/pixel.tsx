"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const CELL = 8;
const COUNT = 40;

/** A pixel cursor on an 8px grid that leaves a stepped, fading trail like an old LCD; over anything clickable it draws a blinking selection, and a click lights a cross. */
export function PixelCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    trail: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, age: Infinity })),
    next: 0,
    gx: 0,
    gy: 0,
    t: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [gx, gy] = [Math.floor(p.x / CELL), Math.floor(p.y / CELL)];
    const light = (x: number, y: number) => {
      Object.assign(st.trail[st.next], { x, y, age: 0 });
      st.next = (st.next + 1) % COUNT;
    };
    if (!p.dt) {
      [st.gx, st.gy] = [gx, gy];
      for (const c of st.trail) c.age = Infinity;
    }
    // Every cell the pointer crossed since the last frame, so a fast move leaves no gaps.
    if ((gx !== st.gx || gy !== st.gy) && !p.reduced) {
      const n = Math.min(Math.max(Math.abs(gx - st.gx), Math.abs(gy - st.gy)), 12);
      for (let k = 0; k < n; k++) light(Math.round(st.gx + ((gx - st.gx) * k) / n), Math.round(st.gy + ((gy - st.gy) * k) / n));
    }
    [st.gx, st.gy] = [gx, gy];
    if (p.down && !st.wasDown)
      for (const [x, y] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [2, 0], [0, -2], [0, 2]]) light(gx + x, gy + y);
    st.wasDown = p.down;
    st.t += p.dt;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    st.trail.forEach((c, i) => {
      c.age += p.dt;
      // Three steps down to nothing, not a smooth fade.
      els[i].style.opacity = c.age < 0.15 ? "0.7" : c.age < 0.3 ? "0.45" : c.age < 0.45 ? "0.2" : "0";
      els[i].style.transform = `translate(${c.x * CELL}px, ${c.y * CELL}px)`;
    });
    els[COUNT].style.transform = `translate(${gx * CELL}px, ${gy * CELL}px)`;
    const select = els[COUNT + 1];
    select.style.transform = `translate(${(gx - 1) * CELL}px, ${(gy - 1) * CELL}px)`;
    select.style.opacity = p.hover && (p.reduced || Math.floor(st.t * 3) % 2 === 0) ? "1" : "0";
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <div key={i} className="absolute size-2 bg-current opacity-0" />
      ))}
      <div className="absolute size-2 bg-current" />
      <div className="absolute size-6 border-2 border-current opacity-0" />
    </div>
  );
}
