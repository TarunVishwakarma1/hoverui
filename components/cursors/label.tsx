"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "./use-cursor";

/** A dot that morphs into a pill showing the hovered element's `data-cursor-label`. */
export function LabelCursor({ className = "" }: { className?: string }) {
  const pos = useRef({ x: 0, y: 0 });
  const ref = useCursor((p, el) => {
    const c = pos.current;
    const group = el.firstChild as HTMLElement;
    const label = p.target?.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel;
    c.x += (p.x - c.x) * p.ease(20);
    c.y += (p.y - c.y) * p.ease(20);
    group.style.transform = `translate(${c.x}px, ${c.y}px)`;
    // Keep the old text while the pill scales out.
    if (label) group.querySelector("span")!.textContent = label;
    group.toggleAttribute("data-open", !!label);
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="group absolute">
        <div className="absolute size-3 -translate-1/2 rounded-full bg-current transition-[scale,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity group-data-open:scale-50 group-data-open:opacity-0" />
        {/* The hairline uses the text's contrast color, so the pill keeps its edge over its own color. */}
        <div
          className="absolute -translate-1/2 scale-90 whitespace-nowrap rounded-full bg-current px-3 py-1.5 opacity-0 transition-[scale,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity group-data-open:scale-100 group-data-open:opacity-100"
          style={{ boxShadow: "0 0 0 1px oklch(from currentColor calc((0.7 - l) * 1000) 0 0 / 0.35)" }}
        >
          {/* Black or white, whichever reads on the pill's currentColor; plain white where relative colors are unsupported. */}
          <span className="text-xs font-medium text-white" style={{ color: "oklch(from currentColor calc((0.7 - l) * 1000) 0 0)" }} />
        </div>
      </div>
    </div>
  );
}
