"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const GREEN = "rgb(34 197 94)";

/** A radar scope sweeping round the pointer; over anything clickable it widens, sweeps faster and pings a contact on the control's centre. */
export function RadarCursor({ className = "" }: { className?: string }) {
  const s = useRef({ a: 0, size: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    if (!p.reduced) st.a += p.dt * Math.PI * (p.hover ? 4 : 1.6);
    st.size += ((p.down ? 0.8 : p.hover ? 1.4 : 1) - st.size) * p.ease(12);
    const [scope, sweep, blip] = el.children as HTMLCollectionOf<HTMLElement>;
    scope.style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.size})`;
    sweep.style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.size}) rotate(${st.a}rad)`;
    // The contact sits on the control's centre and pings once per turn of the sweep.
    const box = p.hover?.getBoundingClientRect();
    const phase = (st.a % (Math.PI * 2)) / (Math.PI * 2);
    if (box) blip.style.transform = `translate(${box.left + box.width / 2}px, ${box.top + box.height / 2}px) scale(${0.4 + phase})`;
    blip.style.opacity = box ? String(p.reduced ? 1 : 1 - phase) : "0";
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-12 -translate-1/2 rounded-full border border-current/70" style={{ color: GREEN }}>
        <div className="absolute inset-[30%] rounded-full border border-current/40" />
        <div className="absolute top-1/2 left-0 h-px w-full bg-current/30" />
        <div className="absolute top-0 left-1/2 h-full w-px bg-current/30" />
        <div className="absolute top-1/2 left-1/2 size-1.5 -translate-1/2 rounded-full bg-current" />
      </div>
      <div className="absolute size-12 -translate-1/2 rounded-full bg-[conic-gradient(from_270deg,transparent,rgb(34_197_94/0.55)_90deg,transparent_90deg)]" />
      <div className="absolute size-5 -translate-1/2 rounded-full border-2 opacity-0" style={{ borderColor: GREEN }} />
    </div>
  );
}
