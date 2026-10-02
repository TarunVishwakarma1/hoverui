import type { ReactNode } from "react";
import { categories, hooks } from "../catalog";
import { NavLink } from "../client";
import { Mark, container } from "../ui";

/** Every /cursors and /hooks page sits beside the index: a sticky sidebar from lg, like a component library's docs. */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${container} lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-x-12`}>
      <aside className="hidden lg:block">
        <nav aria-label="All cursors" className="sticky top-18 max-h-[calc(100dvh-4.5rem)] overflow-y-auto pt-16 pb-12">
          <NavLink href="/cursors" className="group relative block text-[15px] leading-5 hover:underline hover:underline-offset-4">
            <Mark className="absolute top-1/2 -left-6 hidden size-4! -translate-y-1/2 group-aria-[current=page]:block" />
            All cursors
          </NavLink>
          {categories.map((group) => (
            <div key={group.name} className="mt-8">
              <p className="mono-label text-ink-soft">{group.name}</p>
              <ul className="mt-3 flex flex-col gap-1.5">
                {group.cursors.map((c) => (
                  <li key={c.name}>
                    <NavLink
                      href={`/cursors/${c.name}`}
                      className="group relative flex items-baseline gap-3 py-0.5 text-[15px] leading-6 text-ink-soft hover:text-ink aria-[current=page]:text-ink"
                    >
                      <Mark className="absolute top-1/2 -left-6 hidden size-4! -translate-y-1/2 group-aria-[current=page]:block" />
                      <span className="mono-label">{c.number}</span>
                      <span>{c.title}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="mt-8">
            <p className="mono-label text-ink-soft">Hooks</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {hooks.map((h) => (
                <li key={h.name}>
                  <NavLink
                    href={`/hooks/${h.name}`}
                    className="group relative flex items-baseline py-0.5 font-mono text-[13px] leading-6 text-ink-soft hover:text-ink aria-[current=page]:text-ink"
                  >
                    <Mark className="absolute top-1/2 -left-6 hidden size-4! -translate-y-1/2 group-aria-[current=page]:block" />
                    {h.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>
      {children}
    </div>
  );
}
