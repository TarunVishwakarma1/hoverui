"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Any page, through a night-vision tube: drained of color, then pushed to phosphor green. */
const NIGHT = "grayscale(1) sepia(1) hue-rotate(70deg) saturate(6)";

/** Night-vision goggles that turn whatever they pass over green; over anything clickable they gain up and blink REC, and a press flashes them. */
export function GogglesCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, t: 0, gain: 1, flash: 0, filter: "", wasDown: false });
  const ref = useCursor((p, el) => {
    const st = s.current;
    st.t += p.dt;
    st.x += (p.x - st.x) * p.ease(18);
    st.y += (p.y - st.y) * p.ease(18);
    st.gain += ((p.hover ? 1.6 : 1.05) - st.gain) * p.ease(8);
    if (p.down && !st.wasDown && !p.reduced) st.flash = 1;
    st.wasDown = p.down;
    st.flash = Math.max(st.flash - p.dt * 4, 0);
    const [goggles, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    goggles.style.transform = `translate(${st.x}px, ${st.y}px)`;
    // Only touch the filter when it visibly changes: rebuilding a backdrop filter is not free.
    const filter = `${NIGHT} brightness(${(st.gain + st.flash * 2).toFixed(2)})`;
    if (filter !== st.filter) {
      st.filter = filter;
      goggles.querySelectorAll<HTMLElement>("[data-lens]").forEach((lens) => (lens.style.backdropFilter = filter));
    }
    (goggles.querySelector("[data-rec]") as HTMLElement).style.opacity = p.hover && (p.reduced || Math.floor(st.t * 2) % 2) ? "1" : "0";
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  // No blend mode or filter on the root: either would cut the lenses off from the page they see.
  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute flex -translate-1/2 items-center">
        {[0, 1].map((i) => (
          <div key={i} data-lens className="relative size-9 overflow-hidden rounded-full border-2 border-current" style={{ backdropFilter: `${NIGHT} brightness(1.05)` }}>
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgb(0_0_0/0.18)_0_1px,transparent_1px_3px)]" />
          </div>
        ))}
        <div data-rec className="absolute -top-1 -right-1 size-1.5 rounded-full bg-[#ff3b30] opacity-0" />
      </div>
      <div className="absolute size-1 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
