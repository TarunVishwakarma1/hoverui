"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A wide, soft glow that drifts after the pointer through slowly shifting color; over anything clickable it gathers in tight and bright. */
export function GlowCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, size: 1, hue: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.x += (p.x - st.x) * p.ease(6);
    st.y += (p.y - st.y) * p.ease(6);
    st.size += ((p.down ? 0.35 : p.hover ? 0.5 : 1) - st.size) * p.ease(10);
    if (!p.reduced) st.hue = (st.hue + p.dt * 40) % 360;
    const [glow, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    glow.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.size})`;
    glow.style.filter = `hue-rotate(${st.hue}deg)`;
    glow.style.opacity = String(Math.min(1, 1.3 - st.size * 0.5));
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div
        className="absolute size-60 -translate-1/2 rounded-full"
        style={{ background: "radial-gradient(circle, rgb(255 80 150 / 0.55), rgb(120 90 255 / 0.3) 40%, transparent 70%)" }}
      />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
