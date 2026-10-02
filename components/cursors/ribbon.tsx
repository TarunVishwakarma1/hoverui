"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const POINTS = 24;

/** A rainbow ribbon drawn by your path, tapering to its tail and cycling through the hues; it fattens over anything clickable. */
export function RibbonCursor({ className = "" }: { className?: string }) {
  const s = useRef({ pts: [] as { x: number; y: number }[], hue: 0, w: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    // Collapsed on entry, and always collapsed under reduced motion: only the head is drawn.
    if (!p.dt || p.reduced) st.pts = Array.from({ length: POINTS }, () => ({ x: p.x, y: p.y }));
    else {
      st.pts.unshift({ x: p.x, y: p.y });
      st.pts.length = POINTS;
    }
    st.w += ((p.down ? 0.6 : p.hover ? 1.8 : 1) - st.w) * p.ease(10);
    if (!p.reduced) st.hue = (st.hue + p.dt * (p.hover ? 240 : 60)) % 360;
    el.querySelectorAll("line").forEach((line, i) => {
      const [a, b] = [st.pts[i], st.pts[i + 1]];
      line.setAttribute("x1", String(a.x));
      line.setAttribute("y1", String(a.y));
      line.setAttribute("x2", String(b.x));
      line.setAttribute("y2", String(b.y));
      line.setAttribute("stroke", `hsl(${(st.hue + i * 14) % 360} 90% 58%)`);
      line.setAttribute("stroke-width", String((8 * (1 - i / POINTS) + 1) * st.w));
    });
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg className="absolute top-0 left-0 h-screen w-screen overflow-visible">
        {Array.from({ length: POINTS - 1 }, (_, i) => (
          <line key={i} strokeLinecap="round" />
        ))}
      </svg>
    </div>
  );
}
