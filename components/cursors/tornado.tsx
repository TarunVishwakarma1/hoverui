"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const RINGS = 7;

/** A twister touching down at the pointer: its funnel sways and leans behind your motion; it towers over anything clickable and whips round on press. */
export function TornadoCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, vx: 0, t: 0, size: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const vx = p.dt ? (p.x - st.x) / p.dt : 0;
    st.x = p.x;
    st.vx += (vx - st.vx) * p.ease(6);
    if (!p.reduced) st.t += p.dt * (p.down ? 3 : p.hover ? 1.8 : 1);
    st.size += ((p.hover ? 1.35 : 1) - st.size) * p.ease(8);
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    // Ring 0 is the tip at the pointer; higher rings are wider, sway more and lag further behind.
    const at = (i: number) => {
      const sway = p.reduced ? 0 : Math.sin(st.t * 5 + i * 0.8) * i * 0.9;
      return [p.x + sway - Math.max(-40, Math.min(40, st.vx * 0.012 * i)), p.y - 4 - i * 7 * st.size, (12 + i * 6) * st.size];
    };
    for (let i = 0; i < RINGS; i++) {
      const [x, y, w] = at(i);
      els[i].style.width = `${w}px`;
      els[i].style.transform = `translate(${x}px, ${y}px)`;
    }
    // A scrap of debris whirling round the lower funnel.
    const [x, y, w] = at(1);
    els[RINGS].style.transform = `translate(${x + (Math.cos(st.t * 9) * w) / 2}px, ${y + Math.sin(st.t * 9) * 3}px)`;
    els[RINGS + 1].style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: RINGS }, (_, i) => (
        <div key={i} className="absolute h-1.5 -translate-1/2 rounded-[50%] border border-current" />
      ))}
      <div className="absolute size-1 -translate-1/2 bg-current" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
