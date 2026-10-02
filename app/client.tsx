"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentProps } from "react";

export function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("copied");
    } catch {
      setState("failed");
    }
    setTimeout(() => setState("idle"), 1800);
  };

  return (
    <button type="button" onClick={copy} className={`shrink-0 px-4 text-[15px] leading-5 ${className}`}>
      <span aria-live="polite">{state === "copied" ? "Copied" : state === "failed" ? "Select to copy" : "Copy"}</span>
    </button>
  );
}

export function NavLink(props: ComponentProps<typeof Link>) {
  const active = usePathname() === props.href;
  return <Link {...props} aria-current={active ? "page" : undefined} />;
}
