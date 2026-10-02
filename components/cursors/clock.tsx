"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** A clock face with hands marked `data-hand`, set to ten past ten by default; exported so a page can draw it at rest. */
export function ClockArt({ className = "", hours = 10.17, minutes = 10, seconds = 30 }: { className?: string; hours?: number; minutes?: number; seconds?: number }) {
  const hand = (deg: number) => ({ transformOrigin: "12px 12px", transform: `rotate(${deg}deg)` });
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={i % 3 ? "M12 2.6v1.2" : "M12 2.6v2.2"} stroke="currentColor" strokeWidth="1" style={{ transformOrigin: "12px 12px", transform: `rotate(${i * 30}deg)` }} />
      ))}
      <path data-hand d="M12 12V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={hand(hours * 30)} />
      <path data-hand d="M12 12V4.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" style={hand(minutes * 6)} />
      <path data-hand d="M12 13.8V3.6" stroke="currentColor" strokeWidth="0.6" style={hand(seconds * 6)} />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  );
}

/** A clock that keeps your visitor's real time; over anything clickable the hands race forward, a press winds them back, and they sweep home after. */
export function ClockCursor({ className = "" }: { className?: string }) {
  const warp = useRef(0);
  const ref = useCursor((p, el) => {
    // Seconds of warp away from the real time: an hour a second forward on hover, back on press, easing home otherwise.
    if (p.reduced) warp.current = 0;
    else if (p.down) warp.current -= p.dt * 3600;
    else if (p.hover) warp.current += p.dt * 3600;
    else warp.current -= warp.current * p.ease(2.5);
    const now = new Date(Date.now() + warp.current * 1000);
    const sec = now.getSeconds() + (p.reduced ? 0 : now.getMilliseconds() / 1000);
    const min = now.getMinutes() + sec / 60;
    const hr = (now.getHours() % 12) + min / 60;
    const clock = el.firstElementChild as HTMLElement;
    clock.style.transform = `translate(${p.x}px, ${p.y}px)`;
    const [h, m, sc] = clock.querySelectorAll<SVGElement>("[data-hand]");
    h.style.transform = `rotate(${hr * 30}deg)`;
    m.style.transform = `rotate(${min * 6}deg)`;
    sc.style.transform = `rotate(${sec * 6}deg)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <ClockArt className="absolute size-8 -translate-1/2" />
    </div>
  );
}
