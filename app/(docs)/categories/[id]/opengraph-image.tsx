import registry from "@/registry.json";
import { ogPlate, ogSize } from "../../../og";

export const size = ogSize;
export const contentType = "image/png";
export const alt = "A kind of hover-ui cursor component for React";

const items = registry.items.filter((item) => item.type === "registry:component");
const kinds = [...new Set(items.map((item) => item.categories[0]))];

export function generateStaticParams() {
  return kinds.map((name) => ({ id: name.toLowerCase() }));
}

/** Each kind's share card: its name and the cursors in it. */
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const name = kinds.find((k) => k.toLowerCase() === id)!;
  const titles = items.filter((item) => item.categories[0] === name).map((item) => item.title);
  return ogPlate({ title: `${name} cursors`, description: titles.join(", "), label: `${titles.length} cursors`, foot: `${registry.homepage.replace("https://", "")}/categories/${id}` });
}
