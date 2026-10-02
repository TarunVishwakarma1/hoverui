import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { attributes, getCursor, cursors, Specimen } from "../../../catalog";
import { Arrow, Code, GITHUB, Install, JsonLd, Preview, Row, SITE, Words, siteOpenGraph } from "../../../ui";

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
  return { title, description, alternates: { canonical: url }, openGraph: { ...siteOpenGraph, title, description, url } };
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
  const component = `${cursor.title}Cursor`;
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
    [
      "className",
      cursor.name === "label"
        ? "Colors the dot and pill through currentColor, e.g. text-pink-500. The pill's words switch to black or white to stay readable."
        : "Colors the cursor through currentColor, e.g. text-pink-500. To read on any background, pass text-white mix-blend-difference, as this site does.",
    ],
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
                codeRepository: GITHUB,
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
              <cursor.Cursor />
              <Specimen name={cursor.name} />
            </Preview>
            <dl className="mt-8 grid grid-cols-2 gap-x-6 border-t border-hairline sm:grid-cols-5">
              {[
                ["No.", cursor.number],
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
                <span className="flex items-baseline gap-3">
                  <span className="text-[22px] leading-7 tracking-[-0.01em]">{target.title}</span>
                  <span className="mono-label text-ink-soft">{target.number}</span>
                </span>
              </Link>
            );
          })}
        </nav>
      </main>
  );
}
