"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const DOTS = 14;

/** A tapering chain of dots, each chasing the one ahead. */
export function TrailCursor({ className = "" }: { className?: string }) {
  const dots = useRef(Array.from({ length: DOTS }, () => ({ x: 0, y: 0 })));
  const ref = useCursor((p, el) => {
    let { x, y } = p;
    dots.current.forEach((d, i) => {
      const k = i ? p.ease(30) : 1;
      d.x += (x - d.x) * k;
      d.y += (y - d.y) * k;
      ({ x, y } = d);
      (el.children[i] as HTMLElement).style.transform = `translate(${d.x}px, ${d.y}px) scale(${1 - i / DOTS})`;
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
