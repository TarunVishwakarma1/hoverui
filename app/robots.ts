import type { MetadataRoute } from "next";
import registry from "@/registry.json";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${registry.homepage}/sitemap.xml`,
  };
}
