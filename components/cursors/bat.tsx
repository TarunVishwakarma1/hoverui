"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

const WING = "M18 8C14 3 8 2 1 5C4 7 5 9 5 12C7 10 9 10 10 13C12 11 14 11 15 14C16 12 17 11 18 12Z";

/** The bat, wings spread; each wing is marked `data-wing` for flapping. Exported so a page can draw it at rest. */
export function BatArt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 20" className={className} aria-hidden>
      <g fill="currentColor">
        <path data-wing d={WING} style={{ transformOrigin: "18px 9px" }} />
        <g transform="matrix(-1 0 0 1 40 0)">
          <path data-wing d={WING} style={{ transformOrigin: "18px 9px" }} />
        </g>
        <ellipse cx="20" cy="11" rx="3.2" ry="4.5" />
        <path d="M17.6 7.5 17.9 2.6 19.4 5h1.2l1.5-2.4.3 4.9a2.6 2.6 0 0 1-4.8 0Z" />
      </g>
    </svg>
  );
}

/** A bat flitting about beside the pointer; over anything clickable it folds its wings and hangs upside down from it. */
export function BatCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, t: 0, rot: 0, fold: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt * (p.down ? 2 : 1);
    const hang = !!p.hover;
    // An erratic flutter: two sines at odd rates, off to the upper right; none while it hangs.
    const wx = hang || p.reduced ? 0 : Math.sin(st.t * 3.1) * 10 + Math.sin(st.t * 7.7) * 4;
    const wy = hang || p.reduced ? 0 : Math.sin(st.t * 4.3 + 1) * 8 + Math.sin(st.t * 9.1) * 3;
    const [tx, ty] = hang ? [p.x, p.y + 12] : [p.x + 24 + wx, p.y - 20 + wy];
    st.x += (tx - st.x) * p.ease(hang ? 14 : 6);
    st.y += (ty - st.y) * p.ease(hang ? 14 : 6);
    st.rot += ((hang ? 180 : Math.max(-20, Math.min(20, (tx - st.x) * 0.8))) - st.rot) * p.ease(10);
    st.fold += ((hang ? 1 : 0) - st.fold) * p.ease(12);
    // Wings beat from above level to well below it; folded, they wrap close.
    const beat = p.reduced ? 1 : Math.cos(st.t * 22);
    const wing = (1 - st.fold) * beat + st.fold * 0.2;
    const bat = el.firstElementChild as HTMLElement;
    bat.style.transform = `translate(${st.x}px, ${st.y}px) rotate(${st.rot}deg)`;
    bat.querySelectorAll<SVGElement>("[data-wing]").forEach((w) => (w.style.transform = `scale(${1 - st.fold * 0.5}, ${wing})`));
    (el.lastElementChild as HTMLElement).style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <BatArt className="absolute h-5 w-10 -translate-1/2" />
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
