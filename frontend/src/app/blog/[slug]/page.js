import { notFound } from "next/navigation";
import Link from "next/link";
import { cache } from "react";
import { fetchPublicJson, normalizeCollection } from "@/lib/public-api";

// Define a revalidação estática (ISR) para revalidar a cada 60s
export const revalidate = 60;

// Opcional: pré-gera caminhos em tempo de build
export async function generateStaticParams() {
  const data = await fetchPublicJson("/api/v1/articles", {
    next: { revalidate: 60 },
  });
  const articles = normalizeCollection(data, "articles");

  return articles.map((article) => ({ slug: article.slug }));
}

const getArticle = cache(async (slug) => (
  fetchPublicJson(`/api/v1/articles/${slug}`, {
    next: { revalidate: 60 },
  })
));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) return { title: "Artigo Não Encontrado" };

  return {
    title: `${article.title} | Blog Vinicius Morais`,
    description: article.content.substring(0, 150) + "..."
  };
}

export default async function ArticleDetailPage({ params }) {
  const { slug } = await params;
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  return (
    <div style={{ padding: "60px 0" }}>
      <div className="container" style={{ maxWidth: "800px" }}>
        <Link href="/blog" style={{
          color: "hsl(var(--gold-primary))",
          fontWeight: 600,
          marginBottom: "24px",
          display: "inline-flex",
          alignItems: "center",
          gap: "6px"
        }}>
          <span>←</span> Voltar para o Blog
        </Link>

        <article className="animate-fade-in" style={{ marginTop: "16px" }}>
          <header style={{ marginBottom: "32px", borderBottom: "1px solid hsl(var(--border-color))", paddingBottom: "24px" }}>
            <h1 style={{ fontSize: "36px", marginBottom: "16px" }}>{article.title}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", color: "hsl(var(--text-secondary))", fontSize: "14px" }}>
              <strong>Por {article.author?.name}</strong>
              <span>•</span>
              <span>{new Date(article.published_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </header>

          <section style={{ fontSize: "17px", lineHeight: "1.8", color: "hsl(var(--text-primary))", whiteSpace: "pre-line" }}>
            {article.content}
          </section>

          {article.author && (
            <footer style={{
              marginTop: "48px",
              padding: "24px",
              backgroundColor: "hsl(var(--bg-secondary))",
              borderRadius: "var(--radius-md)",
              border: "1px solid hsl(var(--border-color))",
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <strong style={{ color: "hsl(var(--gold-primary))" }}>Sobre o Autor</strong>
              <p style={{ fontWeight: 600, fontSize: "16px" }}>{article.author.name}</p>
              <p style={{ color: "hsl(var(--text-secondary))", fontSize: "14px" }}>{article.author.bio}</p>
            </footer>
          )}
        </article>
      </div>
    </div>
  );
}
