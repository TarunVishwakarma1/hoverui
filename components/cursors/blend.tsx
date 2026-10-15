"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A disc that inverts whatever is beneath it and grows over interactive elements. */
export function BlendCursor({
  className = "",
  size = 24,
  speed = 18,
  swell = 2.5,
}: {
  className?: string;
  /** The disc's diameter, in px. */
  size?: number;
  /** How quickly the disc catches up with the pointer; lower trails further behind. */
  speed?: number;
  /** How much the disc grows over anything clickable: 2.5 is two and a half times as wide. */
  swell?: number;
}) {
  const disc = useRef({ x: 0, y: 0, scale: 1 });
  const ref = useCursor((p, el) => {
    const d = disc.current;
    d.x += (p.x - d.x) * p.ease(speed);
    d.y += (p.y - d.y) * p.ease(speed);
    d.scale += ((p.down ? 0.8 : p.hover ? swell : 1) - d.scale) * p.ease(14);
    (el.firstChild as HTMLElement).style.transform = `translate(${d.x}px, ${d.y}px) scale(${d.scale})`;
  });

  // mix-blend lives on the root: a child would only blend inside the root's own stacking context.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} mix-blend-difference ${className}`}>
      <div className="absolute -translate-1/2 rounded-full bg-white" style={{ width: size, height: size }} />
    </div>
  );
}
