"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const CELL = 10;
const MAX = 24;

/** The phone-game snake, chasing the pointer square by square on a 10px grid; it grows over anything clickable and speeds up on press. */
export function SnakeCursor({ className = "" }: { className?: string }) {
  const s = useRef({ cells: [] as number[][], steps: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [gx, gy] = [Math.floor(p.x / CELL), Math.floor(p.y / CELL)];
    const len = p.hover ? 16 : 8;
    if (!p.dt || p.reduced || !st.cells.length) st.cells = Array.from({ length: len }, () => [gx, gy]);
    // Never diagonal, the longer way first. It sprints when far behind and crawls near the pointer; a press doubles it.
    const far = Math.abs(gx - st.cells[0][0]) + Math.abs(gy - st.cells[0][1]);
    st.steps += p.dt * (30 + far * 3) * (p.down ? 2 : 1);
    for (; st.steps >= 1; st.steps--) {
      const [hx, hy] = st.cells[0];
      if (hx === gx && hy === gy) {
        st.steps = 0;
        break;
      }
      const [dx, dy] = [gx - hx, gy - hy];
      st.cells.unshift(Math.abs(dx) >= Math.abs(dy) ? [hx + Math.sign(dx), hy] : [hx, hy + Math.sign(dy)]);
    }
    // Growing adds squares at the tail; shrinking drops them.
    while (st.cells.length < len) st.cells.push(st.cells[st.cells.length - 1]);
    st.cells.length = len;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < MAX; i++) {
      const cell = st.cells[i];
      els[i].style.opacity = cell ? "1" : "0";
      if (cell) els[i].style.transform = `translate(${cell[0] * CELL + 1}px, ${cell[1] * CELL + 1}px)`;
    }
    // The food is the exact pointer.
    els[MAX].style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: MAX }, (_, i) => (
        <div key={i} className="absolute size-2 bg-current opacity-0" />
      ))}
      <div className="absolute size-1 -translate-1/2 bg-current" />
    </div>
  );
}
