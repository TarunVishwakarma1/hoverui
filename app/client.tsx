"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useSyncExternalStore, type ComponentProps } from "react";

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

const subscribeTheme = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
};

/**
 * Flips the theme the head script set (app/layout.tsx), remembers the choice, and crossfades the page
 * where View Transitions exist so the brightness change eases instead of flashing.
 */
export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.dataset.theme === "dark", () => false);
  const toggle = () => {
    const next = dark ? "light" : "dark";
    try {
      localStorage.setItem("theme", next);
    } catch {
      // Storage blocked: the choice lasts until the page reloads.
    }
    const flip = () => {
      document.documentElement.dataset.theme = next;
    };
    if (document.startViewTransition) document.startViewTransition(flip);
    else flip();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label="Dark theme"
      title="Dark theme"
      className="flex size-10 shrink-0 items-center justify-center border border-ink transition-colors duration-100 hover:bg-ink hover:text-paper"
    >
      {/* A printer's density patch: half ink, half sheet, so it mirrors whichever stock the page is on. */}
      <svg viewBox="0 0 24 24" aria-hidden className="size-[18px]">
        <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1.25" />
        <path d="M12 4a8 8 0 0 0 0 16z" fill="currentColor" />
      </svg>
    </button>
  );
}

/** The bar's Install: on a cursor page it jumps to that cursor's command, everywhere else to the home page's. */
export function InstallLink(props: Omit<ComponentProps<typeof Link>, "href">) {
  const onCursorPage = usePathname().startsWith("/cursors/");
  return <Link {...props} href={onCursorPage ? "#install" : "/#install"} />;
}

export function NavLink(props: ComponentProps<typeof Link>) {
  const path = usePathname();
  const href = String(props.href);
  const current = path === href ? "page" : path.startsWith(`${href}/`) ? "true" : undefined;
  return <Link {...props} aria-current={current} />;
}
