import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { legalDocs } from "@/lib/legal";

export function generateStaticParams() {
  return legalDocs.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const doc = legalDocs.find((d) => d.slug === slug);
  return doc ? { title: doc.title } : {};
}

export default async function PolicyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const doc = legalDocs.find((d) => d.slug === slug);
  if (!doc) notFound();

  return (
    <div className="page-wrap page-narrow legal">
      <header className="page-head">
        <h1>{doc.title}</h1>
        <p className="page-sub">Last updated {doc.updated}</p>
      </header>
      {doc.sections.map((s) => (
        <section key={s.heading} className="legal-section">
          <h2>{s.heading}</h2>
          {s.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ))}
    </div>
  );
}
