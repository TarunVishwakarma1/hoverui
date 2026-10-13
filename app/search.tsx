"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type RefObject, useEffect, useMemo, useRef, useState } from "react";
import { categories, cursors, hooks } from "./catalog";
import { CopyButton, searchFind, searchWords } from "./client";
import { Scene } from "./scenes";
import { Arrow, Mark, Preview, Words, installCommand } from "./ui";

type Entry = {
  name: string;
  title: string;
  group: string;
  description: string;
  href: string;
  words: string[];
  /** The description's own words: a match there says more than one in the keywords. */
  says: string[];
  hook?: boolean;
};

/** Everything the search can find: every cursor, then the hooks. */
const ENTRIES: Entry[] = [
  ...cursors.map((c) => ({
    name: c.name,
    title: c.title,
    group: c.category,
    description: c.description,
    href: `/cursors/${c.name}`,
    words: searchWords(c.search),
    says: searchWords(c.description),
  })),
  ...hooks.map((h) => ({
    name: h.name,
    title: h.title,
    group: "Hooks",
    description: h.description,
    href: `/hooks/${h.name}`,
    words: searchWords(`${h.title} ${h.name} hook hooks engine custom cursor api ${h.description}`),
    says: searchWords(h.description),
    hook: true,
  })),
];
const BY_NAME = new Map(ENTRIES.map((e) => [e.name, e]));
const CURSORS = new Map(cursors.map((c) => [c.name, c]));
const GROUPS = [...categories.map((g) => g.name), "Hooks"];
const SUGGESTIONS = ["spooky", "space", "rain", "ship", "magic"];

/** The title with the first word the query starts marked, the way a selection would mark it. */
function Title({ entry, terms }: { entry: Entry; terms: string[] }) {
  for (const t of terms) {
    const m = new RegExp(`(^|\\s)(${t.replace(/[^a-z0-9]/g, "")})`, "i").exec(entry.title);
    if (!m || !m[2]) continue;
    const at = m.index + m[1].length;
    return (
      <>
        {entry.title.slice(0, at)}
        <mark className="bg-seal text-ink">{entry.title.slice(at, at + m[2].length)}</mark>
        {entry.title.slice(at + m[2].length)}
      </>
    );
  }
  return entry.title;
}

/**
 * The site search's panel, dropped beneath the bar: the matches on the left (every cursor by category until you type),
 * the highlighted one live on the right, to try before you open it. Arrow keys move, Enter opens.
 */
export default function SearchPanel({
  query,
  setQuery,
  field,
  onPick,
}: {
  query: string;
  setQuery: (q: string) => void;
  field: RefObject<HTMLInputElement | null>;
  onPick: () => void;
}) {
  const router = useRouter();
  const list = useRef<HTMLDivElement>(null);
  const terms = useMemo(() => searchWords(query), [query]);
  // Typing ranks the matches: a title that starts with the search, then a title word that does, then a cursor whose
  // description says it, then one that only lists it as a keyword or a kind.
  const results = useMemo(() => {
    if (!terms.length) return ENTRIES;
    const first = terms[0];
    const rank = (e: Entry) => {
      const title = e.title.toLowerCase();
      if (title.startsWith(query.trim().toLowerCase())) return 0;
      if (title.split(/\s+/).some((w) => w.startsWith(first))) return 1;
      return terms.every((t) => e.says.some((w) => w.startsWith(t))) ? 2 : 3;
    };
    return searchFind(ENTRIES, terms)
      .map((name) => BY_NAME.get(name)!)
      .sort((a, b) => rank(a) - rank(b));
  }, [terms, query]);
  // The highlight starts on the first result each time the search changes.
  const [active, setActive] = useState({ query, index: 0 });
  const index = active.query === query ? Math.min(active.index, results.length - 1) : 0;
  const current = results[index];
  const move = (i: number) => setActive({ query, index: (i + results.length) % results.length });

  // The keys belong to the bar's field, which keeps focus the whole time.
  useEffect(() => {
    const input = field.current;
    if (!input) return;
    const onKey = (e: KeyboardEvent) => {
      if (!results.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        move(index + (e.key === "ArrowDown" ? 1 : -1));
      } else if (e.key === "Enter" && current) {
        e.preventDefault();
        router.push(current.href);
        onPick();
      }
    };
    input.addEventListener("keydown", onKey);
    input.setAttribute("aria-activedescendant", current ? `search-${current.name}` : "");
    return () => input.removeEventListener("keydown", onKey);
  });
  useEffect(() => {
    list.current?.querySelector(`#search-${CSS.escape(current?.name ?? "")}`)?.scrollIntoView({ block: "nearest" });
  }, [current?.name]);

  const row = (entry: Entry) => {
    const on = entry === current;
    return (
      <Link
        key={entry.name}
        id={`search-${entry.name}`}
        href={entry.href}
        role="option"
        aria-selected={on}
        tabIndex={-1}
        onPointerMove={() => !on && move(results.indexOf(entry))}
        onClick={onPick}
        className={`relative flex items-baseline justify-between gap-4 py-2.5 pr-5 pl-8 md:py-2 ${on ? "bg-preview" : ""}`}
      >
        {on && <Mark className="absolute top-1/2 left-1.5 size-4! -translate-y-1/2 text-ink" />}
        <span className="min-w-0">
          <span className={`block leading-6 text-ink ${entry.hook ? "font-mono text-[15px]" : "text-[17px]"}`}>
            <Title entry={entry} terms={terms} />
          </span>
          {/* Phones get no live preview, so each row carries its description. */}
          <span className="mt-0.5 block text-[14px] leading-5 text-ink-soft md:hidden">{entry.description}</span>
        </span>
        {terms.length > 0 && <span className="mono-label shrink-0 text-ink-soft">{entry.group}</span>}
      </Link>
    );
  };

  const cursor = current && CURSORS.get(current.name);
  // Under the field: right-aligned with the bar's own right edge, which the container keeps 40px in (more past 1440px).
  return (
    <>
      {/* The page steps back a tone behind the panel; pressing it closes the search. */}
      <div aria-hidden onPointerDown={onPick} className="fixed inset-x-0 top-18 bottom-0 bg-paper/75" />
      <div className="fixed inset-x-0 top-18 bottom-0 flex flex-col border-t border-hairline bg-paper md:top-21 md:right-[max(40px,calc((100vw-1440px)/2+40px))] md:bottom-auto md:left-auto md:w-[min(60rem,calc(100vw-80px))] md:border md:border-ink">
        {["-left-[22px] -top-[22px]", "-right-[22px] -top-[22px]", "-bottom-[22px] -left-[22px]", "-bottom-[22px] -right-[22px]"].map((pos) => (
          <Mark key={pos} className={`absolute hidden text-ink md:block ${pos}`} />
        ))}
        <div className={`grid min-h-0 flex-1 md:flex-none md:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] ${results.length ? "md:h-[min(30rem,calc(100dvh-11rem))]" : ""}`}>
          <div ref={list} id="site-search-results" role="listbox" aria-label="Cursors" className="min-h-0 overflow-y-auto overscroll-contain py-3">
            {results.length === 0 ? (
              <div className="py-6 pr-5 pl-8">
                <p className="text-[22px] leading-7 tracking-[-0.01em]">No cursor matches &ldquo;{query.trim()}&rdquo;.</p>
                <p className="mt-3 text-[15px] leading-[22px] text-ink-soft">
                  Try a name, a mood or a thing:{" "}
                  {SUGGESTIONS.map((q, i) => (
                    <span key={q}>
                      {i > 0 && ", "}
                      <button type="button" onClick={() => (setQuery(q), field.current?.focus())} className="text-ink underline underline-offset-4 hover:no-underline">
                        {q}
                      </button>
                    </span>
                  ))}
                  .
                </p>
              </div>
            ) : terms.length ? (
              results.map(row)
            ) : (
              GROUPS.map((group) => (
                <div key={group} role="group" aria-label={group} className="pb-3">
                  <p aria-hidden className="mono-label pt-3 pr-5 pb-1.5 pl-8 text-ink-soft">
                    {group}
                  </p>
                  {results.filter((e) => e.group === group).map(row)}
                </div>
              ))
            )}
          </div>

          {/* The highlighted cursor, live: put the pointer in and try it before opening its page. */}
          {current && (
            <aside aria-label={`${current.title} preview`} className="hidden min-h-0 flex-col gap-5 overflow-y-auto border-l border-hairline p-9 md:flex">
              {cursor ? (
                <Preview className="aspect-[4/3] shrink-0" touchNote={false}>
                  <cursor.Cursor eager />
                  <Scene name={cursor.name} />
                </Preview>
              ) : (
                <pre className="shrink-0 border border-hairline bg-paper-warm/70 p-5 font-mono text-[13px] leading-5 whitespace-pre-wrap">{`const ref = useCursor((p, el) => {\n  el.style.transform =\n    \`translate(\${p.x}px, \${p.y}px)\`;\n});`}</pre>
              )}
              <div className="flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className={`text-[22px] leading-7 tracking-[-0.01em] ${current.hook ? "font-mono text-[18px]" : ""}`}>{current.title}</h2>
                  <span className="mono-label shrink-0 text-ink-soft">{current.group}</span>
                </div>
                <p className="text-[15px] leading-[22px] text-ink-soft">
                  <Words text={current.description} />
                </p>
              </div>
              <div className="mt-auto flex flex-wrap gap-3">
                <Link href={current.href} onClick={onPick} className="btn-secondary">
                  Open {current.hook ? "hook" : "cursor"} <Arrow />
                </Link>
                {cursor && <CopyButton text={installCommand(cursor.name)} label="Copy install" className="btn-secondary" />}
              </div>
            </aside>
          )}
        </div>
        <div aria-hidden className="hidden items-center justify-between gap-6 border-t border-hairline px-5 py-3 md:flex">
          <p className="mono-label flex items-center gap-4 text-ink-soft">
            {[
              ["↑ ↓", "move"],
              ["↵", "open"],
              ["esc", "close"],
            ].map(([key, what]) => (
              <span key={what} className="flex items-center gap-1.5">
                <kbd className="border border-hairline px-1.5 text-ink">{key}</kbd>
                {what}
              </span>
            ))}
          </p>
          <p className="mono-label text-ink-soft">
            {terms.length ? `${results.length} of ${ENTRIES.length}` : `${ENTRIES.length - hooks.length} cursors, ${hooks.length} hook`}
          </p>
        </div>
        <p aria-live="polite" className="sr-only">
          {terms.length ? `${results.length} ${results.length === 1 ? "result" : "results"}` : ""}
        </p>
      </div>
    </>
  );
}
