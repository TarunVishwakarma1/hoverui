"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Exact dot + lagging ring that swells over interactive elements and squeezes on press. */
export function RingCursor({
  className = "",
  size = 32,
  speed = 12,
  swell = 1.8,
}: {
  className?: string;
  /** The ring's diameter, in px. */
  size?: number;
  /** How quickly the ring catches up with the dot; lower trails further behind. */
  speed?: number;
  /** How much the ring grows over anything clickable: 1.8 is 80% larger. */
  swell?: number;
}) {
  const ring = useRef({ x: 0, y: 0, scale: 1 });
  const ref = useCursor((p, el) => {
    const r = ring.current;
    const [circle, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    r.x += (p.x - r.x) * p.ease(speed);
    r.y += (p.y - r.y) * p.ease(speed);
    r.scale += ((p.down ? 0.7 : p.hover ? swell : 1) - r.scale) * p.ease(16);
    circle.style.transform = `translate(${r.x}px, ${r.y}px) scale(${r.scale})`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute -translate-1/2 rounded-full border border-current" style={{ width: size, height: size }} />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
