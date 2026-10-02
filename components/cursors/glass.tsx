"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A lens of frosted glass that blurs whatever it passes over; it widens over anything clickable and presses in on click. */
export function GlassCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, size: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.x += (p.x - st.x) * p.ease(16);
    st.y += (p.y - st.y) * p.ease(16);
    st.size += ((p.down ? 0.85 : p.hover ? 1.5 : 1) - st.size) * p.ease(12);
    const [lens, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    lens.style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.size})`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  // No blend mode or filter on the root: either would cut the lens off from the page it blurs.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-16 -translate-1/2 rounded-full border border-current/25 bg-white/10 shadow-[inset_0_1px_1px_rgb(255_255_255/0.5)] backdrop-blur-[5px] backdrop-saturate-150" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
