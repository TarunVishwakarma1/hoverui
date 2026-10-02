"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** The saucer, level; exported so a page can draw it at rest. */
export function UfoArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className} aria-hidden>
      <path d="M11 12a9 8 0 0 1 18 0" fill="#bdf3ff" stroke="currentColor" strokeWidth="1.2" />
      <ellipse cx="20" cy="14" rx="18" ry="5.5" fill="#d4d4d8" stroke="currentColor" strokeWidth="1.2" />
      {[10, 20, 30].map((cx) => (
        <circle key={cx} data-light cx={cx} cy={cx === 20 ? 15.5 : 14.5} r="1.4" fill="#ffc400" />
      ))}
    </svg>
  );
}

/** A flying saucer hovering above the pointer, lights chasing round its rim; over anything clickable it lowers a tractor beam onto it. */
export function UfoCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, t: 0, beam: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    const lift = p.hover ? 34 : 44;
    st.x += (p.x - st.x) * p.ease(5);
    st.y += (p.y - lift - st.y) * p.ease(5);
    const bob = p.reduced ? 0 : Math.sin(st.t * 2.4) * 3;
    const tilt = Math.max(-16, Math.min(16, (p.x - st.x) * 0.25));
    st.beam += ((p.hover ? (p.down ? 1 : 0.75) : 0) - st.beam) * p.ease(10);
    const [beam, saucer, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    // The beam hangs from the saucer's belly and reaches down to the pointer.
    const [bx, by] = [st.x, st.y + bob + 6];
    const [dx, dy] = [p.x - bx, p.y - by];
    beam.style.transform = `translate(${bx - 22}px, ${by}px) rotate(${Math.atan2(-dx, dy)}rad)`;
    beam.style.height = `${Math.hypot(dx, dy)}px`;
    beam.style.opacity = String(st.beam);
    saucer.style.transform = `translate(${st.x}px, ${st.y + bob}px) rotate(${tilt}deg)`;
    saucer.querySelectorAll<SVGElement>("[data-light]").forEach((light, i) => {
      light.style.opacity = p.reduced || Math.floor(st.t * 5) % 3 === i ? "1" : "0.3";
    });
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div
        className="absolute top-0 left-0 w-11 origin-top bg-linear-to-b from-[rgb(255_214_70/0.85)] to-[rgb(255_214_70/0.2)] opacity-0"
        style={{ clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)" }}
      />
      <UfoArt className="absolute h-6 w-10 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
