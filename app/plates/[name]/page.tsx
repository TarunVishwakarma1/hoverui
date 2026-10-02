import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { attributes, getPlate, plates, Specimen } from "../../plates";
import { Arrow, Code, Install, Plate, container } from "../../ui";

export const dynamicParams = false;

export function generateStaticParams() {
  return plates.map((p) => ({ name: p.name }));
}

export async function generateMetadata({ params }: PageProps<"/plates/[name]">): Promise<Metadata> {
  const plate = getPlate((await params).name);
  return { title: plate?.title, description: plate?.description };
}

function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 gap-x-10 gap-y-6 border-t border-hairline py-12 lg:grid-cols-12">
      <h2 className="text-[28px] leading-8 tracking-[-0.02em] lg:col-span-4">{title}</h2>
      <div className="flex min-w-0 flex-col gap-5 lg:col-span-8">{children}</div>
    </section>
  );
}

export default async function PlatePage({ params }: PageProps<"/plates/[name]">) {
  const plate = getPlate((await params).name);
  if (!plate) notFound();

  // Every registry file lives in components/cursors; scoping the path keeps the build from tracing the whole project.
  const files = await Promise.all(
    plate.files.map(async (path) => ({ path, code: await readFile(join(process.cwd(), "components/cursors", path.split("/").pop()!), "utf8") })),
  );
  // Read from the shipped hook source: importing it here would pull client hooks into this server page.
  const targets = files.map((f) => f.code.match(/INTERACTIVE = "(.+)"/)?.[1]).find(Boolean) ?? "";
  const i = plates.indexOf(plate);
  const prev = plates[(i - 1 + plates.length) % plates.length];
  const next = plates[(i + 1) % plates.length];
  const component = `${plate.title}Cursor`;
  const usage = `import { ${component} } from "@/components/cursors/${plate.name}";

export function Section() {
  return (
    <section>
      <${component} />
      {/* this section now wears ${plate.title} */}
    </section>
  );
}`;
  const props: [string, string][] = [
    [
      "className",
      plate.name === "label"
        ? "Colors the dot and pill through currentColor, e.g. text-pink-500. The pill's words switch to black or white to stay readable."
        : "Colors the cursor through currentColor, e.g. text-pink-500. To read on any background, pass text-white mix-blend-difference, as this site does.",
    ],
    ...(attributes[plate.name] ?? []),
  ];

  return (
    <main className={`${container} pb-12`}>
      <section className="grid grid-cols-1 gap-x-10 gap-y-14 pt-12 pb-16 lg:grid-cols-12 lg:pt-16">
        <div className="flex flex-col gap-6 lg:col-span-4">
          <h1 className="text-display">{plate.title}</h1>
          <p className="max-w-[38ch] text-ink-soft">{plate.description}</p>
          <dl className="mt-2 grid grid-cols-2 border-t border-hairline">
            {[
              ["Plate", plate.number],
              ["Files", String(files.length)],
              ["Dependencies", "None"],
              ["License", "MIT"],
            ].map(([term, def]) => (
              <div key={term} className="flex flex-col gap-1 border-b border-hairline py-3">
                <dt className="mono-label text-ink-soft">{term}</dt>
                <dd className="font-mono text-[13px]">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="lg:col-span-8">
          <Plate className="aspect-[4/5] sm:aspect-[16/10]">
            <plate.Cursor />
            <Specimen name={plate.name} />
          </Plate>
        </div>
      </section>

      <Row title="Install">
        <Install name={plate.name} />
        <p className="text-[15px] leading-[22px] text-ink-soft">
          Adds <code className="font-mono text-[13px] text-ink">components/cursors/{plate.name}.tsx</code> and the shared{" "}
          <code className="font-mono text-[13px] text-ink">use-cursor.ts</code> to your project. The files are yours from there.
        </p>
      </Row>

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
      </Row>

      <nav aria-label="More plates" className="flex items-center justify-between gap-6 border-t border-hairline pt-8">
        {[
          [prev, "left", "Previous"],
          [next, "right", "Next"],
        ].map(([p, to, label]) => {
          const target = p as typeof plate;
          return (
            <Link key={label as string} href={`/plates/${target.name}`} className={`group flex items-center gap-4 ${to === "right" ? "flex-row-reverse text-right" : ""}`}>
              <span className="flex size-11 items-center justify-center rounded-full border border-ink transition-colors duration-100 group-hover:bg-ink group-hover:text-paper">
                <Arrow to={to as "left" | "right"} />
              </span>
              <span className="sr-only">{label as string} plate:</span>
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
