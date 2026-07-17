import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 3600;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/glossary_terms`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    const terms = await res.json();
    return terms.map((term) => ({ slug: term.slug }));
  } catch {
    return [];
  }
}

async function getTerm(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/glossary_terms/${slug}`, {
      next: { revalidate: 3600 }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Falha ao buscar termo por slug na API", e);
  }

  return null;
}

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
