import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "./catalog";
import { Arrow, container } from "./ui";

export const metadata: Metadata = { title: "No cursor here" };

/** A missed link: say so plainly, then offer every way back in. */
export default function NotFound() {
  return (
    <main className={`${container} pt-16 pb-24 lg:pt-24`}>
      <h1 className="text-display max-w-[14ch]">No cursor here.</h1>
      <p className="mt-6 max-w-[46ch] text-ink-soft">
        The page you followed doesn&apos;t exist, or the cursor moved. Press <kbd className="mono-label border border-hairline px-1.5 text-ink">/</kbd> to search, or
        pick a kind below.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/cursors" className="btn-primary">
          All cursors <Arrow />
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={`/categories/${c.id}`} className="btn-secondary">
            {c.name}
          </Link>
        ))}
      </div>
    </main>
  );
}
