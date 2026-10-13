import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { attributes, categories, classNameDoc, cursors, getCursor, Specimen } from "../../../catalog";
import { Arrow, Code, GITHUB, Install, JsonLd, Preview, Row, SITE, Words, ogFields } from "../../../ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return cursors.map((p) => ({ name: p.name }));
}

export async function generateMetadata({ params }: PageProps<"/cursors/[name]">): Promise<Metadata> {
  const cursor = getCursor((await params).name);
  if (!cursor) return {};
  const title = `${cursor.title} cursor for React`;
  const description = `${cursor.description} A copy-paste React cursor component, installed with the shadcn CLI.`;
  const url = `/cursors/${cursor.name}`;
  return { title, description, alternates: { canonical: url }, openGraph: { ...ogFields, title, description, url } };
}

export default async function CursorPage({ params }: PageProps<"/cursors/[name]">) {
  const cursor = getCursor((await params).name);
  if (!cursor) notFound();

  // Every registry file lives in components/cursors; scoping the path keeps the build from tracing the whole project.
  const files = await Promise.all(
    cursor.files.map(async (path) => ({ path, code: await readFile(join(process.cwd(), "components/cursors", path.split("/").pop()!), "utf8") })),
  );
  // Read from the hook's source: importing it here would pull client hooks into this server page.
  const hookSource = await readFile(join(process.cwd(), "hooks", "use-cursor.ts"), "utf8");
  const targets = hookSource.match(/INTERACTIVE = "(.+)"/)?.[1] ?? "";
  const i = cursors.indexOf(cursor);
  const prev = cursors[(i - 1 + cursors.length) % cursors.length];
  const next = cursors[(i + 1) % cursors.length];
  // Read from the source: titles like "Black hole" or "UFO" are not the component's name.
  const source = files[0].code;
  const component = /export function (\w+Cursor)\b/.exec(source)?.[1] ?? `${cursor.title}Cursor`;
  // The component's own doc comment says what it does at more length than the registry line: shown when it does.
  const doc = /\/\*\*((?:[^*]|\*(?!\/))*)\*\/\s*export function \w+Cursor\b/.exec(source)?.[1];
  const behaviour = doc
    ?.split("\n")
    .map((line) => line.replace(/^\s*\*\s?/, ""))
    .join(" ")
    .replace(/`/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const kin = categories.find((c) => c.name === cursor.category)!;
  const others = kin.cursors.filter((c) => c !== cursor);
  const usage = `import { ${component} } from "@/components/cursors/${cursor.name}";

export function Section() {
  return (
    <section>
      <${component} />
      {/* this section now wears ${cursor.title} */}
    </section>
  );
}`;
  const props: [string, string][] = [
    ["className", classNameDoc(cursor.name)],
    ...(attributes[cursor.name] ?? []),
  ];

  const url = `${SITE}/cursors/${cursor.name}`;

  return (
      <main className="min-w-0 pb-12">
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "SoftwareSourceCode",
                name: `${cursor.title} cursor`,
                description: cursor.description,
                url,
                programmingLanguage: "TypeScript",
                runtimePlatform: "React",
                license: "https://opensource.org/licenses/MIT",
                isAccessibleForFree: true,
                keywords: [cursor.title, cursor.category, "custom cursor", "React", ...cursor.keywords].join(", "),
                codeRepository: GITHUB,
                ...(cursor.author && { author: { "@type": "Person", name: cursor.author.name, url: cursor.author.url } }),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "hover-ui", item: SITE },
                  { "@type": "ListItem", position: 2, name: "Cursors", item: `${SITE}/cursors` },
                  { "@type": "ListItem", position: 3, name: cursor.title, item: url },
                ],
              },
            ],
          }}
        />

        {/* Install is never buried: beside the title from xl, under it on desktop, after the preview on phones. */}
        <div className="grid grid-cols-1 gap-x-10 gap-y-12 pt-12 pb-16 lg:pt-16 xl:grid-cols-12">
          <header className="xl:col-span-6">
            <h1 className="text-display">{cursor.title}</h1>
            <p className="mt-6 max-w-[46ch] text-ink-soft">
              <Words text={cursor.description} />
            </p>
          </header>

          <div id="install" className="order-last flex min-w-0 scroll-mt-28 flex-col gap-4 lg:order-none xl:col-span-6 xl:self-end">
            <Install name={cursor.name} />
            <p className="text-[15px] leading-[22px] text-ink-soft">
              Adds <code className="font-mono text-[13px] text-ink">components/cursors/{cursor.name}.tsx</code>. The CLI also installs the{" "}
              <Link href="/hooks/use-cursor" className="underline underline-offset-4">
                useCursor
              </Link>{" "}
              hook it runs on, once, into your hooks folder. The files are yours from there.
            </p>
          </div>

          <section className="xl:col-span-12">
            <Preview className="aspect-[4/5] sm:aspect-[16/10] xl:aspect-[2/1]">
              <cursor.Cursor eager />
              <Specimen name={cursor.name} />
            </Preview>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 border-t border-hairline sm:grid-cols-4">
              {[
                ["Kind", cursor.category],
                ["Hook", "useCursor"],
                ["Dependencies", "None"],
                ["License", "MIT"],
              ].map(([term, def]) => (
                <div key={term} className="flex flex-col gap-1 border-b border-hairline py-3 sm:border-b-0">
                  <dt className="mono-label text-ink-soft">{term}</dt>
                  <dd className="font-mono text-[13px]">
                    {term === "Hook" ? (
                      <Link href="/hooks/use-cursor" className="underline underline-offset-4">
                        {def}
                      </Link>
                    ) : (
                      def
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {behaviour && behaviour.length > cursor.description.length + 10 && (
          <Row title="How it behaves">
            <p className="max-w-[62ch] text-ink-soft">
              <Words text={behaviour} />
            </p>
          </Row>
        )}

        <Row title="Usage">
          <Code title="Any element" code={usage} />
          <p className="text-[15px] leading-[22px] text-ink-soft">
            Put it inside <code className="font-mono text-[13px] text-ink">&lt;body&gt;</code> in your root layout to wear it on every page. Nested cursors take over inside their own element.
          </p>
        </Row>

        <Row title="Props">
          <dl className="divide-y divide-hairline border-y border-hairline">
            {[...props, ["Hover targets", targets.replaceAll(",", ", ")] as [string, string]].map(([term, def]) => (
              <div key={term} className="grid gap-1 py-4 sm:grid-cols-[11rem_1fr] sm:gap-6">
                <dt className="font-mono text-[13px] leading-6">{term}</dt>
                <dd className="text-ink-soft">{def}</dd>
              </div>
            ))}
          </dl>
        </Row>

        <Row title="Source">
          {files.map((f) => (
            <Code key={f.path} title={f.path.split("/").pop()!} code={f.code} />
          ))}
          <p className="text-[15px] leading-[22px] text-ink-soft">
            It runs on the{" "}
            <Link href="/hooks/use-cursor" className="underline underline-offset-4">
              useCursor
            </Link>{" "}
            hook, which has its own source and API.
          </p>
        </Row>

        {others.length > 0 && (
          <Row title={`More ${cursor.category.toLowerCase()} cursors`}>
            <ul className="grid gap-x-10 gap-y-6 sm:grid-cols-2">
              {others.map((c) => (
                <li key={c.name}>
                  <Link href={`/cursors/${c.name}`} className="group block">
                    <span className="text-[17px] leading-6 group-hover:underline group-hover:underline-offset-4">{c.title}</span>
                    <span className="mt-1 block text-[15px] leading-[22px] text-ink-soft">
                      <Words text={c.description} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/categories/${kin.id}`} className="-my-0.5 flex items-center gap-2 self-start py-0.5 text-[15px] leading-5 hover:underline hover:underline-offset-4">
              All {cursor.category.toLowerCase()} cursors <Arrow />
            </Link>
          </Row>
        )}

        {/* The credit line: who made this cursor, if someone other than the maintainer did, and the way in for the next one. */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-hairline py-8">
          {cursor.author ? (
            <p className="flex flex-wrap items-baseline gap-x-3">
              <span className="mono-label text-ink-soft">Contributed by</span>
              {cursor.author.url ? (
                <a href={cursor.author.url} className="text-[22px] leading-7 tracking-[-0.01em] underline decoration-1 underline-offset-4 hover:decoration-2">
                  {cursor.author.name}
                </a>
              ) : (
                <span className="text-[22px] leading-7 tracking-[-0.01em]">{cursor.author.name}</span>
              )}
            </p>
          ) : (
            <p className="max-w-[46ch] text-[15px] leading-[22px] text-ink-soft">Made a cursor of your own? Contributed cursors carry their maker&apos;s name on their page.</p>
          )}
          <a href={`${GITHUB}/blob/main/CONTRIBUTING.md`} className="-my-0.5 flex shrink-0 items-center gap-2 py-0.5 text-[15px] leading-5 hover:underline hover:underline-offset-4">
            Contribute a cursor <Arrow />
          </a>
        </div>

        <nav aria-label="More cursors" className="flex items-center justify-between gap-6 border-t border-hairline pt-8">
          {[
            [prev, "left", "Previous"],
            [next, "right", "Next"],
          ].map(([p, to, label]) => {
            const target = p as typeof cursor;
            return (
              <Link
                key={label as string}
                href={`/cursors/${target.name}`}
                className={`group flex items-center gap-4 ${to === "right" ? "flex-row-reverse text-right" : ""}`}
              >
                <span className="flex size-11 items-center justify-center rounded-full border border-ink transition-colors duration-100 group-hover:bg-ink group-hover:text-paper">
                  <Arrow to={to as "left" | "right"} />
                </span>
                <span className="sr-only">{label as string} cursor:</span>
                <span className="text-[22px] leading-7 tracking-[-0.01em]">{target.title}</span>
              </Link>
            );
          })}
        </nav>
      </main>
  );
}
