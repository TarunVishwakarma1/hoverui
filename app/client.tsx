"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createContext, Suspense, use, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ComponentProps, type ReactNode } from "react";

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
  const ref = useRef<HTMLAnchorElement>(null);
  // In a long scrolling index, bring the current entry into view (the nav box only, never the page).
  useEffect(() => {
    const box = ref.current?.closest("nav");
    if (current !== "page" || !ref.current || !box) return;
    const [r, b] = [ref.current.getBoundingClientRect(), box.getBoundingClientRect()];
    if (r.top < b.top || r.bottom > b.bottom) box.scrollTop += r.top - b.top - b.height / 2;
  }, [current]);
  return <Link {...props} ref={ref} aria-current={current} />;
}

/** Words too common in the descriptions to mean anything: "yo" should find Yo-yo, not every "you". */
const STOP = new Set("a an and any are as at be by each every for from in into is it its of on or over so the their then they this to under up with you your".split(" "));

/** Lowercase words without accents, punctuation or filler, so "Yo-yo", "yo yo" and "YO-YO" read the same. */
const searchWords = (text: string) =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-z0-9]+/)
    .filter((w) => w && !STOP.has(w));

/** A whole word, give or take a plural: "star" is "stars", "ships" is "ship". */
const sameWord = (w: string, t: string) => w === t || w === `${t}s` || w === `${t}es` || (t.length > 3 && t.endsWith("s") && w === t.slice(0, -1));

/**
 * The names a search finds. Whole words win: "rain" finds Cloud and Matrix, not every rainbow. Only when no cursor has
 * them all as words does a term count as the start of a word, so a half-typed "spoo" already finds the spooky ones.
 */
const searchFind = (index: { name: string; words: string[] }[], terms: string[]) => {
  const whole = index.filter((c) => terms.every((t) => c.words.some((w) => sameWord(w, t))));
  return (whole.length ? whole : index.filter((c) => terms.every((t) => c.words.some((w) => w.startsWith(t))))).map((c) => c.name);
};

/** The names the gallery search lets through, or null while there is no search and everything shows. */
const Shown = createContext<Set<string> | null>(null);

/**
 * Takes ?q= into the search once, on arrival. After that the field leads and the address follows; reading every
 * address change back would race the typing and drop keystrokes.
 */
function QueryFromAddress({ onQuery }: { onQuery: (q: string) => void }) {
  const q = useSearchParams().get("q") ?? "";
  const read = useRef(false);
  useEffect(() => {
    if (read.current) return;
    read.current = true;
    if (q) onQuery(q);
  }, [q, onQuery]);
  return null;
}

/**
 * The all-cursors search: a field that filters the gallery beneath it by name, category, description or keyword as you
 * type. It keeps the search in the address (?q=), focuses on "/", clears on Escape, and sticks under the bar once the
 * page scrolls. The gallery stays server-rendered; sections and tiles read what to show from context.
 */
export function CursorSearch({ index, children }: { index: { name: string; text: string }[]; children: ReactNode }) {
  const [query, setQuery] = useState("");
  const [stuck, setStuck] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const edge = useRef<HTMLDivElement>(null);
  const prepared = useMemo(() => index.map((c) => ({ name: c.name, words: searchWords(c.text) })), [index]);
  const shown = useMemo(() => {
    const terms = searchWords(query);
    return terms.length ? new Set(searchFind(prepared, terms)) : null;
  }, [prepared, query]);

  const search = (q: string) => {
    setQuery(q);
    // Replace, not push: each keystroke is not a step back.
    const url = new URL(location.href);
    if (q) url.searchParams.set("q", q);
    else url.searchParams.delete("q");
    history.replaceState(history.state, "", url);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey || t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return;
      e.preventDefault();
      field.current?.focus();
    };
    addEventListener("keydown", onKey);
    // A sidebar category link aims at a section the search may be hiding: clear it first, so there is somewhere to go.
    const onClick = (e: MouseEvent) => {
      if ((e.target as Element).closest?.("a")?.getAttribute("href")?.startsWith("/cursors#")) search("");
    };
    addEventListener("click", onClick, true);
    // Stuck under the bar, the row takes the sheet and a rule so tiles scroll beneath it cleanly.
    const observer = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { rootMargin: "-73px 0px 0px 0px" });
    if (edge.current) observer.observe(edge.current);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener("click", onClick, true);
      observer.disconnect();
    };
  }, []);

  const count = shown?.size ?? index.length;
  return (
    <Shown value={shown}>
      <Suspense fallback={null}>
        <QueryFromAddress onQuery={setQuery} />
      </Suspense>
      <div ref={edge} aria-hidden className="h-px" />
      <div
        role="search"
        data-stuck={stuck || undefined}
        className="sticky top-18 z-30 -mt-px border-b border-transparent pt-3 pb-6 data-stuck:border-hairline data-stuck:bg-paper data-stuck:pb-3"
      >
        <label className="relative flex h-12 max-w-xl items-center border border-ink has-[input:focus-visible]:outline-1 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-ink">
          <svg viewBox="0 0 24 24" aria-hidden className="pointer-events-none absolute left-4 size-[18px]">
            <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.25" />
            <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.25" />
          </svg>
          <input
            ref={field}
            type="search"
            value={query}
            onChange={(e) => search(e.target.value)}
            onKeyDown={(e) => e.key === "Escape" && query && (e.preventDefault(), search(""))}
            aria-label="Search cursors"
            placeholder="Search by name, mood or thing"
            autoComplete="off"
            spellCheck={false}
            className="h-full min-w-0 flex-1 bg-transparent pr-3 pl-11 text-[15px] placeholder:text-ink-soft focus-visible:outline-none! [&::-webkit-search-cancel-button]:appearance-none"
          />
          {query ? (
            <>
              <span aria-hidden className="mono-label shrink-0 text-ink-soft">
                {count} of {index.length}
              </span>
              <button type="button" onClick={() => (search(""), field.current?.focus())} className="h-full shrink-0 px-4 text-[15px] text-ink-soft hover:text-ink">
                Clear
              </button>
            </>
          ) : (
            <kbd aria-hidden className="mono-label mr-4 shrink-0 border border-hairline px-1.5 text-ink-soft cursorless:hidden">
              /
            </kbd>
          )}
        </label>
        <p aria-live="polite" className="sr-only">
          {query ? `${count} ${count === 1 ? "cursor matches" : "cursors match"}` : ""}
        </p>
      </div>
      {children}
      {count === 0 && (
        <div className="border-t border-hairline pt-6 pb-20">
          <p className="text-[28px] leading-8 tracking-[-0.02em]">No cursor matches &ldquo;{query.trim()}&rdquo;.</p>
          <p className="mt-4 text-ink-soft">
            Try a name, a mood or a thing:{" "}
            {["spooky", "space", "rain", "ship", "text"].map((q, i) => (
              <span key={q}>
                {i > 0 && ", "}
                <button type="button" onClick={() => search(q)} className="text-ink underline underline-offset-4 hover:no-underline">
                  {q}
                </button>
              </span>
            ))}
            .
          </p>
        </div>
      )}
    </Shown>
  );
}

/** A gallery section that hides when the search leaves nothing in it, its count following the search. */
export function SearchSection({ id, title, names, children }: { id: string; title: string; names: string[]; children: ReactNode }) {
  const shown = use(Shown);
  const count = shown ? names.filter((n) => shown.has(n)).length : names.length;
  return (
    <section id={id} aria-labelledby={`${id}-title`} hidden={count === 0} className="scroll-mt-40 border-t border-hairline pt-6 pb-20">
      <h2 id={`${id}-title`} className="flex items-baseline gap-3 text-[28px] leading-8 tracking-[-0.02em]">
        {title}
        <span className="mono-label text-ink-soft">{count}</span>
      </h2>
      {children}
    </section>
  );
}

/** A gallery tile the search shows or hides; hidden, not removed, so the tile and its live cursor stay mounted. */
export function SearchItem({ name, children }: { name: string; children: ReactNode }) {
  const shown = use(Shown);
  return <li hidden={!!shown && !shown.has(name)}>{children}</li>;
}
