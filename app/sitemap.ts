import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { products } from "@/lib/products";
import { legalDocs } from "@/lib/legal";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ["", "shop", "about", "contact", "faq", "checkout"].map(
    (p) => ({
      url: `${site.url}/${p}`,
      lastModified: new Date(),
    })
  );
  const productPages = products.map((p) => ({
    url: `${site.url}/products/${p.slug}`,
    lastModified: new Date(),
  }));
  const legalPages = legalDocs.map((d) => ({
    url: `${site.url}/policies/${d.slug}`,
    lastModified: new Date(),
  }));
  return [...staticPages, ...productPages, ...legalPages];
}
