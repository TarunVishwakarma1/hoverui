"use client";

import { useRef } from "react";
import { cursorRoot, useCursor } from "@/hooks/use-cursor";

/** Where a control leads: the path for a link on this site, the host for another, or what it is. */
function where(el: Element) {
  const a = el.closest("a[href]");
  if (!(a instanceof HTMLAnchorElement)) return `[${el.getAttribute("role") || el.tagName.toLowerCase()}]`;
  const u = new URL(a.href);
  const to =
    u.origin === location.origin ? `→ ${u.pathname}${u.search}${u.hash}` : u.protocol.startsWith("http") ? `↗ ${u.host}${u.pathname.replace(/\/$/, "")}` : `↗ ${a.href}`;
  return to.length > 40 ? `${to.slice(0, 39)}…` : to;
}

/** A ring that shows where a link goes before you click it: the path for links on your site, the host for anywhere else. */
export function PeekCursor({ className = "" }: { className?: string }) {
  const s = useRef({ size: 1, hover: null as Element | null });
  const ref = useCursor((p, el) => {
    const st = s.current;
    const [ring, dot, label] = el.children as HTMLCollectionOf<HTMLElement>;
    if (p.hover !== st.hover) {
      st.hover = p.hover;
      // Keep the old destination while the label fades out.
      if (p.hover) label.textContent = where(p.hover);
      label.toggleAttribute("data-open", !!p.hover);
    }
    st.size += ((p.down ? 0.7 : p.hover ? 1.6 : 1) - st.size) * p.ease(16);
    ring.style.transform = `translate(${p.x}px, ${p.y}px) scale(${st.size})`;
    dot.style.transform = `translate(${p.x}px, ${p.y}px)`;
    // Near the right or bottom edge, the label flips to the other side to stay on screen.
    const w = label.offsetWidth;
    const lx = p.x + 16 + w > innerWidth ? p.x - 16 - w : p.x + 16;
    const ly = p.y + 34 > innerHeight ? p.y - 30 : p.y + 14;
    label.style.transform = `translate(${lx}px, ${ly}px)`;
  });

  return (
    <div ref={ref} aria-hidden className={`${cursorRoot} ${className}`}>
      <div className="absolute size-4 -translate-1/2 rounded-full border border-current" />
      <div className="absolute size-1 -translate-1/2 rounded-full bg-current" />
      <span className="absolute font-mono text-[11px] leading-4 tracking-[0.04em] whitespace-nowrap opacity-0 transition-opacity duration-150 data-open:opacity-100" />
    </div>
  );
}
