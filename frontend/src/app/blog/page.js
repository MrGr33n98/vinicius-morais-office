import Link from "next/link";
import { fetchPublicJson, normalizeCollection } from "@/lib/public-api";

export const revalidate = 60; // ISR - revalida a cada 60s

async function getArticles() {
  const data = await fetchPublicJson("/api/v1/articles", {
    next: { revalidate: 60 },
  });

  return normalizeCollection(data, "articles");
}

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <div style={{ padding: "60px 0" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "16px", textAlign: "center" }}>
          Blog & Opinião Jurídica
        </h1>
        <p style={{ textAlign: "center", color: "hsl(var(--text-secondary))", marginBottom: "48px" }}>
          Artigos escritos por nossos especialistas em Cuiabá com foco em direito de família, agro e empresarial.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
          {articles.length === 0 && (
            <div className="card" style={{ padding: "32px", textAlign: "center", color: "hsl(var(--text-secondary))" }}>
              Nenhum artigo publicado no momento.
            </div>
          )}

          {articles.map((article) => (
            <article key={article.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <span style={{ fontSize: "12px", color: "hsl(var(--gold-primary))", fontWeight: 600 }}>
                {new Date(article.published_at).toLocaleDateString('pt-BR')} | Por {article.author?.name}
              </span>
              <h2 style={{ fontSize: "24px" }}>
                <Link href={`/blog/${article.slug}`} style={{ color: "hsl(var(--text-primary))" }}>
                  {article.title}
                </Link>
              </h2>
              <p style={{ color: "hsl(var(--text-secondary))" }}>
                {article.content.substring(0, 180)}...
              </p>
              <Link href={`/blog/${article.slug}`} style={{
                color: "hsl(var(--gold-primary))",
                fontWeight: 600,
                fontSize: "14px",
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                Ler Artigo Completo <span>→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
