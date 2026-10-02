"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** What a control calls itself: its data-cursor-label, aria-label or title, else its text, kept short. */
function name(el: Element) {
  const words = (el.getAttribute("data-cursor-label") || el.getAttribute("aria-label") || el.getAttribute("title") || el.textContent || "").trim().replace(/\s+/g, " ");
  return words.length > 32 ? `${words.slice(0, 31)}…` : words;
}

/** A tooltip that rises above anything clickable, reading the control's own label or text, so it needs no markup. */
export function TooltipCursor({ className = "" }: { className?: string }) {
  const s = useRef({ x: 0, y: 0, hover: null as Element | null });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [tip, dot] = el.children as HTMLCollectionOf<HTMLElement>;
    if (p.hover !== st.hover) {
      st.hover = p.hover;
      const text = p.hover ? name(p.hover) : "";
      // Keep the old words while the tip fades out.
      if (text) tip.querySelector("span")!.textContent = text;
      tip.toggleAttribute("data-open", !!text);
    }
    st.x += (p.x - st.x) * p.ease(20);
    st.y += (p.y - st.y) * p.ease(20);
    tip.style.transform = `translate(${st.x}px, ${st.y - 10}px)`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="group absolute top-0 left-0">
        <div className="absolute bottom-2 left-0 flex origin-bottom -translate-x-1/2 scale-90 flex-col items-center opacity-0 transition-[scale,opacity] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)] motion-reduce:transition-opacity group-data-open:scale-100 group-data-open:opacity-100">
          {/* The hairline uses the text's contrast color, so the tip keeps its edge over its own color. */}
          <div className="rounded bg-current px-2.5 py-1.5 whitespace-nowrap" style={{ boxShadow: "0 0 0 1px oklch(from currentColor calc((0.7 - l) * 1000) 0 0 / 0.35)" }}>
            {/* Black or white, whichever reads on currentColor; plain white where relative colors are unsupported. */}
            <span className="text-xs font-medium text-white" style={{ color: "oklch(from currentColor calc((0.7 - l) * 1000) 0 0)" }} />
          </div>
          <div className="-mt-1 size-2 rotate-45 bg-current" />
        </div>
      </div>
      <div className="absolute size-1.5 -translate-1/2 rounded-full bg-current" />
    </div>
  );
}
