"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A drafting crosshair with live coordinates in its area; over a control it reads the control's tag and size. */
export function ReadoutCursor({ className = "" }: { className?: string }) {
  const text = useRef("");
  const ref = useCursor((p, el) => {
    const [cross, label] = el.children as HTMLCollectionOf<HTMLElement>;
    let next: string;
    if (p.hover) {
      const r = p.hover.getBoundingClientRect();
      next = `${p.hover.tagName.toLowerCase()} ${Math.round(r.width)}×${Math.round(r.height)}`;
    } else {
      const a = el.parentElement!.getBoundingClientRect();
      next = `x ${Math.round(p.x - a.left)}  y ${Math.round(p.y - a.top)}`;
    }
    if (next !== text.current) label.textContent = text.current = next;
    // Near the right or bottom edge, the label flips to the other side of the crosshair to stay on screen.
    const lx = p.x + 14 + label.offsetWidth > innerWidth ? p.x - 14 - label.offsetWidth : p.x + 14;
    const ly = p.y + 30 > innerHeight ? p.y - 30 : p.y + 14;
    cross.style.transform = `translate(${p.x}px, ${p.y}px)`;
    label.style.transform = `translate(${lx}px, ${ly}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <svg viewBox="0 0 40 40" className="absolute size-10 -translate-1/2 overflow-visible">
        <path d="M20 0v14M20 26v14M0 20h14M26 20h14" stroke="currentColor" strokeWidth="1" />
      </svg>
      <span className="absolute font-mono text-[11px] leading-4 tracking-[0.06em] whitespace-pre" />
    </div>
  );
}
