"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const PINK = "#ff2bd6";
const CYAN = "#14d8ff";

/** A humming neon tube that trails an exact dot and stutters now and then; over anything clickable it swells and switches color. */
export function NeonCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, size: 1, out: 0, wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.x += (p.x - st.x) * p.ease(14);
    st.y += (p.y - st.y) * p.ease(14);
    st.size += ((p.down ? 0.8 : p.hover ? 1.6 : 1) - st.size) * p.ease(14);
    // Now and then the tube stutters, the way old neon does; a click knocks it too.
    st.out = Math.max(st.out - p.dt, 0);
    if (!p.reduced && !st.out && (Math.random() < p.dt * 0.4 || (p.down && !st.wasDown))) st.out = 0.18;
    st.wasDown = p.down;
    const [tube, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    tube.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.size})`;
    tube.style.opacity = String(st.out && Math.sin(st.out * 90) > 0 ? 0.25 : 1);
    tube.style.color = p.hover ? CYAN : PINK;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div
        className="absolute size-8 -translate-1/2 rounded-full border-2 border-current shadow-[0_0_10px_currentColor,inset_0_0_6px_currentColor] transition-colors duration-200"
        style={{ color: PINK }}
      />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
