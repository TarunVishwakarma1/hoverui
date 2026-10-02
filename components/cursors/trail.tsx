"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const DOTS = 14;

/** A tapering chain of dots, each chasing the one ahead; the head swells over anything clickable. */
export function TrailCursor({ className = "" }: { className?: string }) {
  const dots = useRef(Array.from({ length: DOTS }, () => ({ x: 0, y: 0 })));
  const size = useRef(1);
  const ref = useCursor((p, el) => {
    size.current += ((p.down ? 0.7 : p.hover ? 1.8 : 1) - size.current) * p.ease(16);
    let { x, y } = p;
    dots.current.forEach((d, i) => {
      const k = i ? p.ease(30) : 1;
      d.x += (x - d.x) * k;
      d.y += (y - d.y) * k;
      ({ x, y } = d);
      const t = 1 - i / DOTS;
      // The swell fades down the chain: full at the head, none at the tail.
      (el.children[i] as HTMLElement).style.transform = `translate(${d.x}px, ${d.y}px) scale(${t * (1 + (size.current - 1) * t)})`;
    });
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: DOTS }, (_, i) => (
        <div key={i} className="absolute size-3 -translate-1/2 rounded-full bg-current" />
      ))}
    </div>
  );
}
