"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const LEGS = "M13 11 8 5 3 7M12 13 5 11 1 14M12 15 5 18 2 23M13 17 9 22 8 27";

/** The spider, drawn from above; exported so a page can draw it at rest. */
export function SpiderArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 30" className={className} aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d={LEGS} />
        <path d={LEGS} transform="matrix(-1 0 0 1 32 0)" />
      </g>
      <ellipse cx="16" cy="16" rx="5" ry="6" fill="currentColor" />
      <circle cx="16" cy="8.5" r="3.2" fill="currentColor" />
    </svg>
  );
}

/** A spider on a thread from the top of its area: it drops to the pointer, bounces, and sways as you move; over anything clickable it swells and scuttles. */
export function SpiderCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, vy: 0, t: 0, size: 1 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.x += (p.x - st.x) * p.ease(14);
    if (p.reduced || !p.dt) [st.y, st.vy] = [p.y, 0];
    else {
      st.vy += ((p.y - st.y) * 140 - st.vy * 9) * p.dt;
      st.y += st.vy * p.dt;
    }
    st.t += p.dt;
    st.size += ((p.down ? 0.8 : p.hover ? 1.3 : 1) - st.size) * p.ease(12);
    const scuttle = p.hover && !p.reduced ? Math.sin(st.t * 28) * 8 : 0;
    const top = Math.max(el.parentElement!.getBoundingClientRect().top, 0);
    const [thread, spider] = el.children as HTMLCollectionOf<HTMLElement>;
    thread.style.transform = `translate(${st.x}px, ${top}px) scaleY(${Math.max(st.y - 10 - top, 0)})`;
    spider.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${Math.max(-20, Math.min(20, (p.x - st.x) * 0.6)) + scuttle}deg) scale(${st.size})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute top-0 left-0 h-px w-px origin-top bg-current" />
      <SpiderArt className="absolute h-[30px] w-8 -translate-1/2" />
    </div>
  );
}
