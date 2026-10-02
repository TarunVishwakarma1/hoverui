"use client";

import { useRef } from "react";
import { INTERACTIVE, cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A printer's registration mark: exact crosshair, a trailing ring that opens and fills over anything clickable. */
export function RegisterCursor({ className = "" }: { className?: string }) {
  const ring = useRef({ x: 0, y: 0, scale: 1 });
  const ref = useCursor((p, el) => {
    const r = ring.current;
    const [cross, circle] = el.children as HTMLCollectionOf<HTMLElement>;
    const hot = !!p.target?.closest(INTERACTIVE);
    r.x += (p.x - r.x) * p.ease(22);
    r.y += (p.y - r.y) * p.ease(22);
    r.scale += ((p.down ? 1.4 : hot ? 2.4 : 1) - r.scale) * p.ease(16);
    cross.style.transform = `translate(${p.x}px, ${p.y}px)`;
    circle.style.transform = `translate(${r.x}px, ${r.y}px) scale(${r.scale})`;
    circle.toggleAttribute("data-hot", hot);
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg viewBox="0 0 24 24" className="absolute size-6 -translate-1/2 overflow-visible">
        <path d="M12 0v24M0 12h24" stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute size-3 -translate-1/2 rounded-full border border-current transition-colors duration-150 data-hot:bg-current/10" />
    </div>
  );
}
