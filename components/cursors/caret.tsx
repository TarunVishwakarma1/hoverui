"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A text caret, sized to the line height of whatever text it is over, that blinks when you stop; over anything clickable it becomes a block caret. */
export function CaretCursor({ className = "" }: { className?: string }) {
  const s = useRef({ w: 2, h: 20, target: null as Element | null, line: 20, font: 16, lx: 0, ly: 0, still: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    // Read the type under the pointer only when the element under it changes.
    if (p.target !== st.target && p.target) {
      st.target = p.target;
      const cs = getComputedStyle(p.target);
      st.font = parseFloat(cs.fontSize) || 16;
      st.line = Math.min(Math.max(cs.lineHeight === "normal" ? st.font * 1.2 : parseFloat(cs.lineHeight) || st.font * 1.2, 12), 96);
    }
    const k = p.ease(18);
    st.h += (st.line - st.h) * k;
    st.w += ((p.hover ? st.font * 0.6 : p.down ? 3 : 2) - st.w) * k;
    // Solid while moving; blinks at the editor's half-second once you stop.
    st.still = p.x === st.lx && p.y === st.ly ? st.still + p.dt : 0;
    [st.lx, st.ly] = [p.x, p.y];
    const on = p.reduced || p.down || st.still < 0.5 || Math.floor((st.still - 0.5) / 0.53) % 2 === 1;
    const bar = el.firstElementChild as HTMLElement;
    bar.style.transform = `translate(${p.x - st.w / 2}px, ${p.y - st.h / 2}px) scale(${st.w}, ${st.h})`;
    bar.style.opacity = on ? "1" : "0";
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-px origin-top-left bg-current" />
    </div>
  );
}
