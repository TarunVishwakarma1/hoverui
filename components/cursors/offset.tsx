"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const INKS = ["#00a3e0", "#e5007e", "#ffd400"]; // cyan, magenta, yellow

/** Three process-color rings that drift out of register as you move and line back up when you stop; over a control they grow and slip apart. */
export function OffsetCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, vx: 0, vy: 0, size: 1, slip: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const k = p.ease(14);
    const dx = (p.x - st.x) * k;
    const dy = (p.y - st.y) * k;
    st.x += dx;
    st.y += dy;
    // The smoothed step is how far the inks drift out of register; zero on entry and under reduced motion.
    st.vx = !p.dt || p.reduced ? 0 : st.vx + (dx - st.vx) * p.ease(8);
    st.vy = !p.dt || p.reduced ? 0 : st.vy + (dy - st.vy) * p.ease(8);
    const len = Math.hypot(st.vx, st.vy) || 1;
    const spread = Math.min(len * 1.6, 12);
    st.size += ((p.down ? 0.8 : p.hover ? 1.5 : 1) - st.size) * p.ease(14);
    st.slip += ((p.hover && !p.down ? 4 : 0) - st.slip) * p.ease(10);
    const rings = el.children as HTMLCollectionOf<HTMLElement>;
    for (let i = 0; i < INKS.length; i++) {
      const o = i - 1;
      const x = st.x - (st.vx / len) * spread * o + st.slip * o;
      const y = st.y - (st.vy / len) * spread * o - st.slip * o * 0.75;
      rings[i].style.transform = `translate(${x}px, ${y}px) scale(${st.size})`;
    }
    rings[INKS.length].style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {INKS.map((c) => (
        <div key={c} className="absolute size-7 -translate-1/2 rounded-full border-2" style={{ borderColor: c }} />
      ))}
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
