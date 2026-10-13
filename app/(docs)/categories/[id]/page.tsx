import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categories, getCategory } from "../../../catalog";
import { Arrow, CursorTile, JsonLd, SITE, ogFields } from "../../../ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ id: c.id }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[id]">): Promise<Metadata> {
  const category = getCategory((await params).id);
  if (!category) return {};
  const title = `${category.name} cursors for React`;
  const url = `/categories/${category.id}`;
  return { title, description: category.intro, alternates: { canonical: url }, openGraph: { ...ogFields, title, description: category.intro, url } };
}

/** One kind of cursor on its own page: its lead, its tiles, and the way on to every other kind. */
export default async function CategoryPage({ params }: PageProps<"/categories/[id]">) {
  const category = getCategory((await params).id);
  if (!category) notFound();
  const url = `${SITE}/categories/${category.id}`;
  const count = category.cursors.length;

  return (
    <main className="min-w-0 pb-24">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "CollectionPage",
              name: `${category.name} cursors for React`,
              description: category.intro,
              url,
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: count,
                itemListElement: category.cursors.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `${c.title} cursor`, url: `${SITE}/cursors/${c.name}` })),
              },
            },
            {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "hover-ui", item: SITE },
                { "@type": "ListItem", position: 2, name: "Cursors", item: `${SITE}/cursors` },
                { "@type": "ListItem", position: 3, name: category.name, item: url },
              ],
            },
          ],
        }}
      />

      <header className="pt-12 pb-16 lg:pt-16">
        <h1 className="text-display">{category.name} cursors</h1>
        <p className="mt-6 max-w-[52ch] text-ink-soft">{category.intro}</p>
        <p className="mono-label mt-6 text-ink-soft">
          {count} {count === 1 ? "cursor" : "cursors"} · React · shadcn
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-x-16 gap-y-20 border-t border-hairline pt-12 sm:grid-cols-2 xl:grid-cols-3">
        {category.cursors.map((c) => (
          <li key={c.name}>
            <CursorTile cursor={c} />
          </li>
        ))}
      </ul>

      <nav aria-label="Other kinds of cursor" className="mt-24 border-t border-hairline pt-6">
        <h2 className="text-[28px] leading-8 tracking-[-0.02em]">Other kinds</h2>
        <ul className="mt-8 flex flex-wrap gap-3">
          {categories
            .filter((c) => c.id !== category.id)
            .map((c) => (
              <li key={c.id}>
                <Link href={`/categories/${c.id}`} className="group btn-secondary">
                  {c.name} <span className="mono-label text-ink-soft group-hover:text-paper">{c.cursors.length}</span>
                </Link>
              </li>
            ))}
          <li>
            <Link href="/cursors" className="btn-secondary">
              All cursors <Arrow />
            </Link>
          </li>
        </ul>
      </nav>
    </main>
  );
}
