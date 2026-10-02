"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Viewfinder corners around the pointer that snap to frame whatever clickable thing you hover. */
export function FrameCursor({ className = "" }: { className?: string }) {
  const s = useRef({ l: 0, t: 0, r: 0, b: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const box = p.hover?.getBoundingClientRect();
    const [l, t, r, b] = box ? [box.left - 6, box.top - 6, box.right + 6, box.bottom + 6] : [p.x - 12, p.y - 12, p.x + 12, p.y + 12];
    const k = p.ease(18);
    st.l += (l - st.l) * k;
    st.t += (t - st.t) * k;
    st.r += (r - st.r) * k;
    st.b += (b - st.b) * k;
    const [tl, tr, bl, br, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    tl.style.transform = `translate(${st.l}px, ${st.t}px)`;
    tr.style.transform = `translate(${st.r}px, ${st.t}px)`;
    bl.style.transform = `translate(${st.l}px, ${st.b}px)`;
    br.style.transform = `translate(${st.r}px, ${st.b}px)`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-2 border-t border-l border-current" />
      <div className="absolute size-2 -translate-x-full border-t border-r border-current" />
      <div className="absolute size-2 -translate-y-full border-b border-l border-current" />
      <div className="absolute size-2 -translate-full border-r border-b border-current" />
      <div className="absolute size-1 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
