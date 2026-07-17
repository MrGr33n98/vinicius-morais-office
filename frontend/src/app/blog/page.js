export const revalidate = 60; // ISR - revalida a cada 60s
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

async function getArticles() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/articles`, {
      next: { revalidate: 60 }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Falha ao carregar artigos da API.", e);
  }

  return [];
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
                <a href={`/blog/${article.slug}`} style={{ color: "hsl(var(--text-primary))" }}>
                  {article.title}
                </a>
              </h2>
              <p style={{ color: "hsl(var(--text-secondary))" }}>
                {article.content.substring(0, 180)}...
              </p>
              <a href={`/blog/${article.slug}`} style={{
                color: "hsl(var(--gold-primary))",
                fontWeight: 600,
                fontSize: "14px",
                alignSelf: "flex-start",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                Ler Artigo Completo <span>→</span>
              </a>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
