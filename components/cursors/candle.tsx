"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A lit candle; the flame is marked `data-flame` and pivots on its wick. Exported so a page can draw it at rest. */
export function CandleArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 40" className={`overflow-visible ${className}`} aria-hidden>
      <g data-flame style={{ transformOrigin: "8px 14px" }}>
        <path d="M8 1c3 5 4 8 4 10a4 4 0 0 1-8 0c0-2 1-5 4-10z" fill="#ffaa00" />
        <path d="M8 6c1.5 2.5 2 4 2 5a2 2 0 0 1-4 0c0-1 .5-2.5 2-5z" fill="#fff3b0" />
      </g>
      <path d="M8 13.5v2.5" stroke="currentColor" strokeWidth="1.2" />
      <rect x="4" y="16" width="8" height="22" rx="1.5" fill="#f4efe6" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

/** The pointer is a candle flame: it leans away from your motion and flickers; it flares over anything clickable and gutters while you press. */
export function CandleCursor({ className = "" }: { className?: string }) {
  const s = useRef({ vx: 0, x: 0, t: 0, size: 1, glow: 0.5 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const vx = p.dt ? (p.x - st.x) / p.dt : 0;
    st.x = p.x;
    st.vx += (vx - st.vx) * p.ease(8);
    st.size += ((p.down ? 0.15 : p.hover ? 1.5 : 1) - st.size) * p.ease(p.down ? 20 : 8);
    st.glow += ((p.down ? 0 : p.hover ? 1 : 0.5) - st.glow) * p.ease(8);
    // Dragged through the air, the flame trails behind; still, it wavers on its own.
    const lean = p.reduced ? 0 : Math.max(-40, Math.min(40, -st.vx * 0.05)) + Math.sin(st.t * 3.7) * 3;
    const flicker = p.reduced ? 1 : 1 + Math.sin(st.t * 23) * 0.05 + Math.sin(st.t * 37) * 0.04;
    const [halo, candle] = el.children as HTMLCollectionOf<HTMLElement>;
    halo.style.transform = `translate(${p.x}px, ${p.y}px) scale(${0.6 + st.glow * 0.6})`;
    halo.style.opacity = String(st.glow);
    candle.style.transform = `translate(${p.x}px, ${p.y}px)`;
    (candle.querySelector("[data-flame]") as SVGElement).style.transform = `rotate(${lean}deg) scale(${st.size * (2 - flicker)}, ${st.size * flicker})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-24 -translate-1/2 rounded-full bg-[radial-gradient(circle,rgb(255_180_60/0.35),transparent_65%)]" />
      {/* Zero-size wrapper at the pointer, with the flame's heart on it. */}
      <div className="absolute top-0 left-0">
        <CandleArt className="absolute top-[-11px] left-[-10px] h-[50px] w-5" />
      </div>
    </div>
  );
}
