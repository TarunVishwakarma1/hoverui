"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 12;
const LIFE = 0.9;

/** The pointer touches water: a faint wake as you move, rings spreading from every click, and a ring breathing round it over anything clickable. */
export function RippleCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    rings: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, age: Infinity, strength: 1 })),
    next: 0,
    travel: 0,
    lx: 0,
    ly: 0,
    t: 0,
    halo: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    // A ring born `delay` seconds from now.
    const ring = (delay: number, strength: number) => {
      Object.assign(st.rings[st.next], { x: p.x, y: p.y, age: -delay, strength });
      st.next = (st.next + 1) % COUNT;
    };
    if (!p.dt) {
      [st.lx, st.ly, st.travel] = [p.x, p.y, 0];
      for (const r of st.rings) r.age = Infinity;
    }
    st.travel += Math.hypot(p.x - st.lx, p.y - st.ly);
    [st.lx, st.ly] = [p.x, p.y];
    if (!p.reduced) for (; st.travel > 70; st.travel -= 70) ring(0, 0.35);
    if (p.down && !st.wasDown) [0, 0.12, 0.24].forEach((delay) => ring(delay, 1));
    st.wasDown = p.down;
    st.rings.forEach((r, i) => {
      r.age += p.dt;
      const t = Math.max(r.age, 0) / LIFE;
      els[i].style.transform = `translate(${r.x}px, ${r.y}px) scale(${0.2 + t * 2.2 * r.strength})`;
      els[i].style.opacity = String(r.age < 0 || t > 1 ? 0 : (1 - t) * 0.8 * Math.min(r.strength * 2, 1));
    });
    st.t += p.dt;
    st.halo += ((p.hover ? 1 : 0) - st.halo) * p.ease(10);
    const breathe = p.reduced ? 1 : 1 + Math.sin(st.t * 4) * 0.12;
    els[COUNT].style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.halo * breathe})`;
    els[COUNT + 1].style.transform = `translate(${p.x}px, ${p.y}px) scale(${p.down ? 0.7 : 1})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <div key={i} className="absolute size-10 -translate-1/2 rounded-full border border-current opacity-0" />
      ))}
      <div className="absolute size-9 -translate-1/2 rounded-full border border-current opacity-50" />
      <div className="absolute size-2 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
