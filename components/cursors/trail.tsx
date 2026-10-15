"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A tapering chain of dots, each chasing the one ahead; the head swells over anything clickable. */
export function TrailCursor({
  className = "",
  length = 14,
  size = 12,
  speed = 30,
}: {
  className?: string;
  /** How many dots make the chain. */
  length?: number;
  /** The head dot's diameter, in px; the rest taper from it. */
  size?: number;
  /** How quickly each dot catches the one ahead; lower stretches the chain out. */
  speed?: number;
}) {
  const dots = useRef<{ x: number; y: number }[]>([]);
  const swell = useRef(1);
  const ref = useCursor((p, el) => {
    // The chain follows `length` as it changes: new dots start at the pointer.
    while (dots.current.length < length) dots.current.push({ x: p.x, y: p.y });
    dots.current.length = length;
    swell.current += ((p.down ? 0.7 : p.hover ? 1.8 : 1) - swell.current) * p.ease(16);
    let { x, y } = p;
    dots.current.forEach((d, i) => {
      const k = i ? p.ease(speed) : 1;
      d.x += (x - d.x) * k;
      d.y += (y - d.y) * k;
      ({ x, y } = d);
      const t = 1 - i / length;
      // The swell fades down the chain: full at the head, none at the tail.
      (el.children[i] as HTMLElement).style.transform = `translate(${d.x}px, ${d.y}px) scale(${t * (1 + (swell.current - 1) * t)})`;
    });
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length }, (_, i) => (
        <div key={i} className="absolute -translate-1/2 rounded-full bg-current" style={{ width: size, height: size }} />
      ))}
    </div>
  );
}
