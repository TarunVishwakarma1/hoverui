"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Lets a control go: it springs back from wherever the magnet held it. */
function release(node: HTMLElement | null) {
  const from = node?.style.translate;
  if (!node || !from) return;
  node.style.translate = "";
  node.animate({ translate: [from, "0px 0px"] }, { duration: 450, easing: "cubic-bezier(0.23, 1, 0.32, 1)" });
}

/** A dot with a pull: over anything clickable, the control leans toward the pointer and the dot settles between them. */
export function MagnetCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, size: 1, el: null as HTMLElement | null, ox: 0, oy: 0 });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const hit = p.hover as HTMLElement | null;
    if (hit !== st.el) {
      release(st.el);
      st.el = hit;
      [st.ox, st.oy] = [0, 0];
      // Leaving the area stops the frames, so the control also lets go on its own.
      hit?.addEventListener("pointerleave", () => release(hit), { once: true });
    }
    let [tx, ty] = [p.x, p.y];
    if (hit) {
      const r = hit.getBoundingClientRect();
      // The control's resting centre: its box minus the lean already applied.
      const cx = r.left + r.width / 2 - st.ox;
      const cy = r.top + r.height / 2 - st.oy;
      if (!p.reduced) {
        st.ox += ((p.x - cx) * 0.3 - st.ox) * p.ease(12);
        st.oy += ((p.y - cy) * 0.3 - st.oy) * p.ease(12);
        hit.style.translate = `${st.ox}px ${st.oy}px`;
      }
      [tx, ty] = [(p.x + cx + st.ox) / 2, (p.y + cy + st.oy) / 2];
    }
    st.x += (tx - st.x) * p.ease(18);
    st.y += (ty - st.y) * p.ease(18);
    st.size += ((p.down ? 0.7 : hit ? 2.2 : 1) - st.size) * p.ease(14);
    (el.firstElementChild as HTMLElement).style.transform = `translate(${st.x}px, ${st.y}px) scale(${st.size})`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-3 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
