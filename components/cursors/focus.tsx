"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Blurs its area except a sharp circle at the pointer, like a shallow depth of field; it opens up over anything clickable and racks in on press. */
export function FocusCursor({ className = "" }: { className?: string }) {
  const r = useRef(70);
  const ref = useCursor((p, el) => {
    r.current += ((p.down ? 40 : p.hover ? 110 : 70) - r.current) * p.ease(10);
    // The blur covers only the visible part of the area, with a hole where the pointer is.
    const a = el.parentElement!.getBoundingClientRect();
    const left = Math.max(a.left, 0);
    const top = Math.max(a.top, 0);
    const [blur, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    Object.assign(blur.style, {
      left: `${left}px`,
      top: `${top}px`,
      width: `${Math.min(a.right, innerWidth) - left}px`,
      height: `${Math.min(a.bottom, innerHeight) - top}px`,
      maskImage: `radial-gradient(circle ${r.current}px at ${p.x - left}px ${p.y - top}px, transparent 60%, black 100%)`,
    });
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  // No blend mode or filter on the root: either would cut the blur off from the page beneath.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute backdrop-blur-[3px]" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
