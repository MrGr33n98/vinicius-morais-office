import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { fetchPublicJson, normalizeCollection } from "@/lib/public-api";

export const revalidate = 3600;

export async function generateStaticParams() {
  const data = await fetchPublicJson("/api/v1/glossary_terms", {
    next: { revalidate: 3600 },
  });
  const terms = normalizeCollection(data, "glossary_terms");

  return terms.map((term) => ({ slug: term.slug }));
}

const getTerm = cache(async (slug) => (
  fetchPublicJson(`/api/v1/glossary_terms/${slug}`, {
    next: { revalidate: 3600 },
  })
));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const term = await getTerm(slug);
  
  if (!term) return { title: "Termo Não Encontrado" };

  return {
    title: `O que é ${term.term}? | Dicionário Jurídico Vinicius Morais`,
    description: `Entenda o significado de ${term.term} de forma simples: ${term.definition.substring(0, 120)}...`
  };
}

export default async function GlossaryDetailPage({ params }) {
  const { slug } = await params;
  const term = await getTerm(slug);

  if (!term) {
    notFound();
  }

  return (
    <div style={{ padding: "60px 0" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <Link href="/glossario" style={{
          color: "hsl(var(--gold-primary))",
          fontWeight: 600,
          marginBottom: "24px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span>←</span> Voltar para o Glossário
        </Link>

        <article className="card animate-fade-in" style={{ marginTop: "16px", padding: "40px" }}>
          <header style={{ marginBottom: "24px", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "16px" }}>
            <h1 style={{ fontSize: "36px", color: "hsl(var(--gold-primary))" }}>{term.term}</h1>
            <p style={{ color: "hsl(var(--text-muted))", fontSize: "14px", marginTop: "4px" }}>
              Terminologia jurídica traduzida para linguagem didática
            </p>
          </header>

          <section style={{ fontSize: "17px", lineHeight: "1.8", color: "hsl(var(--text-primary))" }}>
            <p>{term.definition}</p>
          </section>
        </article>
      </div>
    </div>
  );
}
