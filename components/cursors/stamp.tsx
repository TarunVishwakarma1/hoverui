"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const COUNT = 8;

/** An inked seal impression: a worn double ring around a registration mark. Exported so a page can draw it at rest. */
export function StampMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" aria-hidden>
      <circle cx="24" cy="24" r="21" strokeWidth="2.5" strokeDasharray="34 2 18 1.5 40 2.5" />
      <circle cx="24" cy="24" r="16.5" strokeWidth="1" />
      <path d="M24 11v26M11 24h26" strokeWidth="1.2" />
      <circle cx="24" cy="24" r="6" strokeWidth="1.2" />
    </svg>
  );
}

/** A rubber stamp held over the page: it lifts and tilts over anything clickable, and every click leaves an inked seal that fades. */
export function StampCursor({ className = "" }: { className?: string }) {
  const s = useRef({
    marks: Array.from({ length: COUNT }, () => ({ x: 0, y: 0, rot: 0, age: Infinity })),
    next: 0,
    lift: 0,
    wasDown: false,
  });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const els = el.children as HTMLCollectionOf<HTMLElement>;
    if (!p.dt) for (const m of st.marks) m.age = Infinity;
    if (p.down && !st.wasDown) {
      Object.assign(st.marks[st.next], { x: p.x, y: p.y, rot: (Math.random() - 0.5) * 50, age: 0 });
      st.next = (st.next + 1) % COUNT;
    }
    st.wasDown = p.down;
    st.marks.forEach((m, i) => {
      m.age += p.dt;
      // Inked at once, held, then dried away over its last 0.8s.
      els[i].style.transform = `translate(${m.x}px, ${m.y}px) rotate(${m.rot}deg)`;
      els[i].style.opacity = String(Math.max(0, Math.min(0.85, (2.4 - m.age) / 0.8)));
    });
    // Raised and tilted, ready, over a control; slammed flat on press.
    st.lift += ((p.down ? 0 : p.hover ? 1 : 0.35) - st.lift) * p.ease(p.down ? 30 : 12);
    els[COUNT].style.transform = `translate(${p.x}px, ${p.y - st.lift * 10}px) rotate(${-st.lift * 14}deg) scale(1, ${p.down ? 0.9 : 1})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      {Array.from({ length: COUNT }, (_, i) => (
        <StampMark key={i} className="absolute size-12 -translate-1/2 opacity-0" />
      ))}
      {/* The stamp, side on: its rubber face sits on the pointer. */}
      <svg viewBox="0 0 24 24" className="absolute h-6 w-6 origin-bottom -translate-x-1/2 -translate-y-full">
        <circle cx="12" cy="4" r="3" fill="currentColor" />
        <path d="M10.5 6h3v9h-3z" fill="currentColor" />
        <rect x="4" y="15" width="16" height="5" rx="1" fill="currentColor" />
        <path d="M5 21h14v3H5z" fill="currentColor" opacity="0.6" />
      </svg>
    </div>
  );
}
